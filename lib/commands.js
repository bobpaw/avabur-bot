const Secrets = require("../secrets");

const basic_math = require("mathjs");
const math = basic_math.create(basic_math.all);
math.import({
	import: function () { throw new ReferenceError("Function import is disabled"); },
	createUnit: function () { throw new ReferenceError("Function createUnit is disabled"); },
	simplify: function () { throw new ReferenceError("Function simplify is disabled"); },
	derivative: function () { throw new ReferenceError("Function derivative is disabled"); }
}, { override: true });

const { promisify } = require("util");

const sql_pool = require("mysql").createPool({
	connectionLimit: 5,
	host: "localhost",
	user: "avabur-bot",
	password: Secrets.sql_pass,
	database: "avabur"
});
sql_pool.query = promisify(sql_pool.query);

const get_currency_prices = require("./get-currency-prices");
const get_version = require("./get-version.js");
const {add_commas, remove_commas, expand_numeric_literals} = require("./util");

async function market (str) {
	"use strict";
	let tags = str.split(" ");
	let currencies = [];
	// let ingredients = [];
	for (const tag of tags) {
		switch (tag.toLowerCase()) {
		case "crystals": case "crystal": case "cry": case "c":
			currencies.push("Crystal");
			break;
		case "platinum": case "plats": case "plat": case "p":
			currencies.push("Platinum");
			break;
		case "food": case "f":
			currencies.push("Food");
			break;
		case "wood": case "w":
			currencies.push("Wood");
			break;
		case "stone": case "s":
			currencies.push("Stone");
			break;
		case "iron": case "i":
			currencies.push("Iron");
			break;
		case "crafting_materials": case "crafting": case "materials": case "mats": case "m":
			currencies.push("Crafting Material");
			break;
		case "gem_fragments": case "gem": case "gems": case "frags": case "frag": case "g":
			currencies.push("Gem Fragment");
			break;
		default:
			// Gives a slightly better error
			currencies.push(tag);
		} // switch(tag)
	} // for (tag of tags)

	let reply = "";
	try {
		const currency_prices = await get_currency_prices();
		for (const currency of currencies) {
			if (currency in currency_prices) {
				reply += `${currency}: ${add_commas(currency_prices[currency][0].price)}, `;
			} else {
				reply += `Nobody is selling ${currency}, `;
			}
		}
	} catch (e) {
		if (e.name === "AbortError") {
			console.error("Fetch aborted while trying to get currency prices.");
			return "Fetch aborted while trying to get currency prices.";
		} else if (e.name === "FetchError") {
			console.error("Error getting currency prices: %s", e.message);
			return "Error fetching currency prices.";
		} else {
			// Yikes, not sure what this is.
			throw e;
		}
	}
	return reply.replace(/, $/, "");
}

async function calculate (str) {
	if (typeof str === "undefined") {
		str = "";
	}
	let reply = "";
	try {
		const currency_prices = await get_currency_prices();
		let scope = {
			units: function (curr, n) {
				if (!(curr in currency_prices)) throw new Error("Invalid currency");
				let price = 0;
				const listings = currency_prices[curr];
				while (n > listings[0].amount) {
					price += listings[0].amount * listings[0].price;
					n -= listings[0].amount;
					listings.shift();
				}
				if (n > 0) {
					price += listings[0].price * n;
				}
				return price;
			},
			max_units: function (curr, price) {
				if (!(curr in currency_prices)) throw new Error("Invalid currency");
				let n = 0;
				const listings = currency_prices[curr];
				while (price > listings[0].amount * listings[0].price) {
					n += listings[0].amount;
					price -= listings[0].amount * listings[0].price;
					listings.shift();
				}
				if (price > 0 && price > listings[0].price) {
					n += Math.floor(price / listings[0].price);
				}
				return n;
			},
			cry: "Crystal", plat: "Platinum", food: "Food",
			wood: "Wood", iron: "Iron", stone: "Stone",
			mat: "Crafting Material", frag: "Gem Fragment",
			c: "Crystal", p: "Platinum", f: "Food", w: "Wood",
			i: "Iron", s: "Stone", cr: "Crafting Material",
			g: "Gem Fragment"
		};
		let expression = remove_commas(expand_numeric_literals(str).replace(/evaluate|parse/, ""));
		console.log(`Calculating expression: ${expression}`);
		try {
			reply = add_commas(await math.evaluate(expression, scope));
			console.log(`Expression evaluated to ${reply}`);
		} catch (e) {
			console.error("math.evaluate error: %s", e.message);
			reply = `Error evaluating ${str} expression \`${str}\` -> \`${expression}\``;
		}
	} catch (e) {
		if (e.name === "AbortError") {
			console.error("Fetch aborted while trying to get currency prices.");
			reply = "Fetch aborted while trying to get currency prices.";
		} else if (e.name === "FetchError") {
			console.error("Error getting currency prices: %s", e.message);
			reply = "Error fetching currency prices.";
		} else {
			// Yikes, not sure what this is.
			throw e;
		}
	}
	return reply;
}

async function handle_message (msg) {
	let reply = "";
	if (msg.content === "Everyone An event is starting soon!" && msg.author.bot) {
		console.log("Received Event starting message");
		await sql_pool.query("insert into events (time) values (current_timestamp())");
		console.log("Logged current time in events table");
		return reply;
	}	else if (/^![a-zA-Z]+/.test(msg.content)) {
		switch (msg.content.match(/^![a-zA-Z]+/)[0]) {
		case "!ping":
			reply = "pong";
			break;
		case "!luck":
			console.log("Calculating current luck.");
			try {
				let result = await sql_pool.query("select unix_timestamp(time) from events;");
				result = result.map(x => x["unix_timestamp(time)"]);
				let changes = result.map((x, i, a) => (i > 0 ? x - a[i - 1] : 0));
				changes.shift();

				// Remove long times where NoA script was down
				let counted_entries = 0;
				let avg = changes.reduce((total, x) => { counted_entries++; return total + (x > 21600 ? 0 : x); }, 0) / counted_entries;
				let time_since_last = Date.now() / 1000 - result[result.length - 1];
				reply = `Event luck is at ${(time_since_last / avg * 100).toFixed(2)}%.`;
			} catch (e) {
				console.error(e.message);
				reply = "Error calculating luck";
			}
			break;
		case "!market":
			console.log("Getting market currency values.");
			reply = await market(msg.content.replace(/^!market ?/, ""));
			break;
		case "!source":
			reply = "avabur-bot by extrafox45#9230 https://github.com/bobpaw/avabur-bot";
			break;
		case "!math": case "!calc": case "!calculate":
			reply = await calculate(msg.content.replace(/^!math ?|!calc(?:ulate)? ?/, ""));
			break;
		case "!version":
			try {
				reply = await get_version();
			} catch (e) {
				console.log("Error getting version: %s", e.message);
				reply = "Error getting version.";
			}
			break;
		case "!help": case "!commands": default:
			reply = "!luck, !market, !ping, !source, !version, !help, !commands, !math, !calc, !calculate";
		}
	}
	return reply;
}

module.exports = {
	market,
	calculate,
	handle_message
};
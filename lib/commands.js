/**
 * @file Exposes discord bot commands.
 * @author Aiden Woodruff <aiden.woodruff@gmail.com>
 * @copyright Aiden Woodruff 2020
 * @license MIT
 * @module lib/commands
 * @package
 * @requires lib/get-currency-prices
 * @requires lib/get-version
 * @requires lib/util
 */

import * as Secrets from "../secrets.js";

import basic_math from "mathjs";
const math = basic_math.create(basic_math.all);
math.import({
	import: function () { throw new ReferenceError("Function import is disabled"); },
	createUnit: function () { throw new ReferenceError("Function createUnit is disabled"); },
	simplify: function () { throw new ReferenceError("Function simplify is disabled"); },
	derivative: function () { throw new ReferenceError("Function derivative is disabled"); }
}, { override: true });

import { promisify } from "util";

import mysql from "mysql";

const sql_pool = mysql.createPool({
	connectionLimit: 5,
	host: "localhost",
	user: "avabur-bot",
	password: Secrets.sql_pass,
	database: "avabur"
});
sql_pool.query = promisify(sql_pool.query);

import get_currency_prices from "./get-currency-prices.js";
import get_version from "./get-version.js";
import { add_commas, remove_commas, expand_numeric_literals } from "./util.js";

/**
 * Returns current lowest price per unit of provided currencies.
 * Currencies that are possibly available: Crystal, Platinum, Food, Wood, Iron, Stone, Crafting Materials, Gem Fragments.
 * 
 * @async
 * @example
 * // Returns lowest crystal price
 * market("cry");
 * 
 * // Returns lowest platinum price
 * market("plat");
 * 
 * // Returns the lowest wood, stone, and iron prices
 * market("wood stone iron");
 * @param {string} str A space separated list of currencies to return the price of.
 * @public
 * @returns {string} A comma separated list of currencies and ther prices.
 * @throws Errors that are not FetchError or AbortError (which are thrown by get-currency-prices).
 */
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

/**
 * Evaluate math expressions. Also includes functions to evaluate summations,
 * multiply currency units, and calculate max currency for a certain sum of money.
 * 
 * @async
 * @example
 * // Resolves to "4"
 * calculate("2 * 2");
 * 
 * // Resolves to "10"
 * calculate(`summ("x", "x", 1, 4)`);
 * 
 * @param {string} str A math expression.
 * @public
 * @returns {string} The evaluated expression, usually a number.
 * @throws May throw the same errors as {@link:module:lib/get_currency_prices}.
 */
async function calculate (str) {
	if (typeof str === "undefined") {
		str = "";
	}
	let reply = "";
	if (str === "") {
		return "";
	} else if (/^[0-9,]+$/.test(str)) {
		return add_commas(expand_numeric_literals(str));
	}
	try {
		const currency_prices = await get_currency_prices();
		let scope = {
			/**
			 * Calculates the summation of an expression.
			 * 
			 * @example
			 * // Returns 10
			 * summ("x", "x", 1, 4);
			 * // Returns 50
			 * summ("x^2 + 2x", "x", 1, 4);
			 * @param {string} expr An expression to sum.
			 * @param {string} x The variable to use.
			 * @param {number} start Starting value.
			 * @param {number} end Ending value.
			 * @returns {number} The result of the summation.
			 */
			summ: function (expr, x, start, end) {
				let sum = 0;
				let negate = false;
				if (start === end) return 0;
				if (start > end) {
					let i = start;
					start = end;
					end = i;
					negate = true;
				}
				for (let i = start; i <= end; ++i) {
					sum += math.evaluate(expr, { x: i });
				}
				return negate ? -sum : sum;
			},
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


/**
 * An object like a Discord.js User.
 * 
 * @typedef UserLike
 * @property {boolean} bot Is the author a bot?
 */

/**
 * An object like a Discord.js Message.
 * 
 * @typedef MessageLike
 * @property {string} content The textual content of the message.
 * @property {UserLike} author The author of the message.
 */

/**
 * Parse a message object.
 * 
 * @example
 * // msg.content = "!help", resolves help string.
 * handle_message(msg);
 * 
 * // msg.content = "!ping", resolves to "pong".
 * handle_message(msg);
 * 
 * @param {MessageLike} msg The message to handle.
 * @returns {string} The response string.
 */
async function handle_message (msg) {
	let reply = "";
	if (typeof msg === "undefined" || typeof msg.content !== "string" || msg.content === "") return "";
	if (msg.content === "Everyone An event is starting soon!" && msg.author.bot) {
		console.log("Received Event starting message");
		await sql_pool.query("insert into events (time) values (current_timestamp())");
		console.log("Logged current time in events table");
		return reply;
	}

	let command = msg.content.split(" ", 1)[0];
	
	switch (command.toLowerCase()) {
	case "!help": case "!commands": default:
		reply = command.startsWith("!") ? "!luck, !market, !ping, !source, !version, !help, !commands, !math, !calc, !calculate" : "";
		break;
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
			let avg = changes.reduce((total, x) => {
				if (x < 21600) {
					counted_entries++;
					total += x;
				}
				return total;
			}, 0) / counted_entries;
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
	}
	return reply;
}

export  {
	market,
	calculate,
	handle_message
};

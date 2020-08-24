const basic_math = require("mathjs");
const math = basic_math.create(basic_math.all);
math.import({
	import: function () { throw new Error("Function import is disabled"); },
	createUnit: function () { throw new Error("Function createUnit is disabled"); },
	simplify: function () { throw new Error("Function simplify is disabled"); },
	derivative: function () { throw new Error("Function derivative is disabled"); }
}, { override: true });

const get_currency_prices = require("./get-currency-prices");
const {add_commas, remove_commas, expand_numeric_literals} = require("./util");

exports.market = async function (str) {
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
};

exports.calculate = async function (str) {
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
		let expression = remove_commas(expand_numeric_literals(str.replace(/^!(?:math|calc(?:ulate)?) /, "")).replace(/evaluate|parse/, ""));
		console.log(`Calculating expression: ${expression}`);
		try {
			reply = add_commas(await math.evaluate(expression, scope));
			console.log(`Expression evaluated to ${reply}`);
		} catch (e) {
			console.error("math.evaluate error: %s", e.message);
			reply = `Error evaluating ${str} expression \`${str.replace(/^!(?:math|calc(?:ulate)?) /, "")}\` -> \`${expression}\``;
		}
	} catch (e) {
		if (e.name === "AbortError") {
			console.log("Fetch aborted while trying to get currency prices");
			reply = "Fetch aborted while trying to get currency prices";
		} else if (e.name === "FetchError") {
			console.log("Error getting currency prices: %s", e.message);
			reply = "Error fetching currency prices.";
		} else {
			// Yikes, not sure what this is.
			throw e;
		}
	}
	return reply;
};
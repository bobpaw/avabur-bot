const get_currency_prices = require("../get-currency-prices.js");

module.exports = async function (str) {
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
	try {
		const currency_prices = await get_currency_prices();
	} catch (e) {
		if (e.name === "AbortError") {
			console.log("Fetch aborted while trying to get currency prices");
			return "Fetch aborted while trying to get currency prices";
		} else if (e.name === "FetchError") {
			console.log("Error getting currency prices: %s", e.message);
			return "Error fetching currency prices.";
		} else {
			// Yikes, not sure what this is.
			throw e;
		}
	}
	let reply = "";
	for (const currency of currencies) {
		if (currency in currency_prices) {
			reply += `${currency}: ${add_commas(currency_prices[currency][0].price)}, `;
		} else {
			reply += `Nobody is selling ${currency}, `;
		}
	}
	return reply.replace(/, $/, "");
}
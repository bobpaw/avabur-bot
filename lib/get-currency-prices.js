const fetch = require("node-fetch");

/**
 * Currency price fetcher
 * @module lib/get-currency-prices
 */

/**
 * Get currency prices from the RoA API
 * 
 * @async
 * @returns {Promise.<Object>} An object similar to the one in commands.test.js
 */
module.exports = async function () {
	let prices = await fetch("https://www.avabur.com/api/market/currency").then(res => res.json());
	return prices;
};


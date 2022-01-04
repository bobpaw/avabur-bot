/**
 * @file Fetches currency price.
 * @author Aiden Woodruff <aiden.woodruff@gmail.com>
 * @copyright Aiden Woodruff 2020
 * @license MIT
 * @module {Function} lib/get-currency-prices
 */

import fetch from "node-fetch";

/**
 * Get currency prices from the RoA API.
 * 
 * @async
 * @returns {object} An object similar to the one in commands.test.js.
 */
export default async function () {
	let prices = await fetch("https://www.avabur.com/api/market/currency").then(res => res.json());
	return prices;
}

const fetch = require("node-fetch");

module.exports = async function () {
	let prices = await fetch("https://www.avabur.com/api/market/currency").then(res => res.json());
	return prices;
}
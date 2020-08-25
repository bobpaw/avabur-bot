const { expect } = require("chai");
const get_currency_prices = require("../lib/get-currency-prices.js");

describe("get_currency_prices()", function () {
	it("should return an object with the keys Crystal, Platinum, Food, Wood, Iron, Stone, Gem Fragment, and Crafting Material", async function () {
		const currency_prices = await get_currency_prices();
		expect(currency_prices).to.be.an("object").that.has.all.keys("Crystal", "Platinum", "Food", "Wood", "Iron", "Stone", "Gem Fragment", "Crafting Material");
	});
});
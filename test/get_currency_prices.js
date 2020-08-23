const { describe, it } = require("mocha");
const { expect } = require("chai");
const get_currency_prices = require("../lib/get-currency-prices.js");

describe("get_currency_prices()", function () {
	it("should have the key Crystal", async function () {
		const currency_prices = await get_currency_prices();
		expect(currency_prices).to.be.an("object").that.has.all.keys("Crystal", "Platinum", "Wood", "Food", "Iron", "Stone", "Gem Fragment", "Crafting Material");
	});
});
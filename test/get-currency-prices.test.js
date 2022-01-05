import expect from "chai";
import sinon from "sinon";
import proxyquire from "proxyquire";

describe("get_currency_prices()", function () {
	let fetch_stub = sinon.stub();
	let get_currency_prices;

	before(function () {
		get_currency_prices = proxyquire("../lib/get-currency-prices.js", {
			"node-fetch": fetch_stub
		});
	});
	afterEach(function () {
		fetch_stub.reset();
	});

	it("should return call node-fetch only once", async function () {
		fetch_stub.resolves({ json: sinon.stub() });

		await get_currency_prices();
		expect(fetch_stub.calledOnce).to.be.true;
	});
	it("should only call json once", async function () {
		let res = { json: sinon.stub() };
		fetch_stub.resolves(res);

		await get_currency_prices();
		expect(res.json.calledOnce).to.be.true;
	});
});

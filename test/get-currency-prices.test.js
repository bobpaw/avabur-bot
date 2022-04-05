import expect from "chai";
import sinon from "sinon";

import * as fetch from "node-fetch";

describe("get_currency_prices()", function () {
	let fetch_stub;
	let get_currency_prices;

	before(function () {
		fetch_stub = sinon.stub(fetch, "default");
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
	it("should not handle errors.");
});

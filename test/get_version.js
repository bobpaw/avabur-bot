const {describe, it} = require("mocha");
const assert = require("assert");
const getVersion = require("../lib/get-version.js");

describe("getVersion()", function () {
	it("should return a string", async function () {
		assert.equal(typeof (await getVersion()), "string");
	});
});

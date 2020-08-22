const {describe, it} = require("mocha");
const {expect} = require("chai");
const getVersion = require("../lib/get-version.js");

describe("getVersion()", function () {
	it("should return a string", async function () {
		expect(await getVersion()).to.satisfy(function (str) {
			return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(str) || "experimental" === str || /[0-9a-f]{7}/.test(str);
		});
	});
});

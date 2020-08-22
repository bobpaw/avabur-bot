const {describe, it} = require("mocha");
const {expect} = require("chai");
const valid = require("semver/functions/valid");
const getVersion = require("../lib/get-version.js");

describe("getVersion()", function () {
	it("should be a semver, 'experimental', or commit hash", async function () {
		expect(await getVersion()).to.satisfy(function (str) {
			return valid(str) !== null || "experimental" === str || /[0-9a-f]{7}/.test(str);
		});
	});
});

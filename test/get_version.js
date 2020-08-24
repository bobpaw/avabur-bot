const { describe, it, beforeEach, afterEach } = require("mocha");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require("sinon");

const valid = require("semver/functions/valid");
const getVersion = require("../lib/get-version.js");
const SimpleGit = require("simple-git");

const proxyquire = require("proxyquire");
const pkg_version = require("../package.json")["version"];

describe("getVersion()", function () {
	it("should return a semver or a commit hash", async function () {
		expect(await getVersion()).to.satisfy(function (str) {
			return valid(str) !== null || /^[0-9a-f]{7} \(branch: (?!-)(?!.+(?:\.\.|@{).+)[^ ~^:?*[]+(?<!\.)\)$/.test(str);
		});
	});
	it("should return v1.1.0", async function () {
		expect(await getVersion("8835f11d6c00b61fc2e2a27fe9ce66653118a7bb")).to.equal("v1.1.0");
	});
	it("should return 08a5078 (branch: experimental)", async function () {
		expect(await getVersion("08a507836f9b8888e9f7f4e18b0bcbc8227d39cc")).to.equal("08a5078 (branch: experimental)");
	});
	let other_git = SimpleGit();
	let gitStub;
	let get_version;

	describe("should responds to exceptions", function () {
		beforeEach(function () {
			gitStub = sinon.stub(other_git, "branch");
			get_version = proxyquire("../lib/get-version.js", {
				"simple-git": function () {
					return other_git;
				}
			});
		});
		afterEach(function () {
			gitStub.restore();
		});
		it(`named GitError from git describe by returning ${pkg_version}`, async function () {
			gitStub.restore();
			gitStub = sinon.stub(other_git, "raw");
			gitStub.withArgs(sinon.match.array.deepEquals(["describe", "--exact-match", "--tags", "HEAD"])).throws("GitError", "Zesty testy");
			expect(await get_version()).to.equal(pkg_version);
		});
		it(`named GitError by returning ${pkg_version}`, async function () {
			gitStub.throws("GitError", "Zesty testy");
			expect(await get_version()).to.equal(pkg_version);
		});
		it(`named GitResponseError by returning ${pkg_version}`, async function () {
			let zesty = new Error("Zesty testy");
			zesty.git = "Zesty testy parsed git error";
			zesty.name = "GitResponseError";
			gitStub.throws(zesty);
			expect(await get_version()).to.equal(pkg_version);
		});
		it("named something else by throwing it", async function () {
			gitStub.throws(new TypeError("Wrong Zesty"));
			await expect(get_version()).to.be.rejectedWith(TypeError, "Wrong Zest");
		});
	});
});

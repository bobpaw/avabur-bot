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
		await expect(getVersion()).to.eventually.satisfy(function (str) {
			return valid(str) !== null || /^[0-9a-f]{7} \(branch: (?!-)(?!.+(?:\.\.|@{).+)[^ ~^:?*[]+(?<!\.)\)$/.test(str);
		});
	});
	it("should return v1.1.0", async function () {
		await expect(getVersion("8835f11d6c00b61fc2e2a27fe9ce66653118a7bb")).to.eventually.equal("v1.1.0");
	});
	it("should return /08a5078 \\(branch: (?:[-_a-zA-Z0-9]+)?\\)/", async function () {
		await expect(getVersion("08a507836f9b8888e9f7f4e18b0bcbc8227d39cc")).to.eventually.match(/08a5078 \(branch: (?:[-_a-zA-Z0-9]+\))?/);
	});

	describe("should responds to exceptions", function () {
		let other_git = SimpleGit();
		let gitStub;
		let get_version;
		let error_stub;

		before(function () {
			error_stub = sinon.stub(console, "error");
		});
		beforeEach(function () {
			gitStub = sinon.stub(other_git, "branch");
			get_version = proxyquire("../lib/get-version.js", {
				"simple-git": () => other_git
			});
		});
		afterEach(function () {
			gitStub.restore();
			error_stub.resetHistory();
		});
		after(function () {
			console.error.restore();
		});
		it(`named GitError from git describe by returning ${pkg_version}`, async function () {
			gitStub.resolves("Response");
			let raw_stub = sinon.stub(other_git, "raw");
			let git_error = new Error("Zesty testy");
			git_error.name = "GitError";
			raw_stub.withArgs("describe", "--exact-match", "--tags", "HEAD").rejects(git_error);
			await expect(get_version()).to.eventually.equal(pkg_version);
			expect(error_stub.calledWith("Git error while getting version: %s\nFalling back to npm package version.", "Zesty testy")).to.be.true;
			raw_stub.restore();
		});
		it(`named GitError by returning ${pkg_version}`, async function () {
			gitStub.throws("GitError", "Zesty testy");
			await expect(get_version()).to.eventually.equal(pkg_version);
			expect(error_stub.calledWith("Git error while getting version: %s\nFalling back to npm package version.", "Zesty testy")).to.be.true;
		});
		it(`named GitResponseError by returning ${pkg_version}`, async function () {
			let zesty = new Error("Zesty testy");
			zesty.git = "Zesty testy parsed git error";
			zesty.name = "GitResponseError";
			gitStub.throws(zesty);
			await expect(get_version()).to.eventually.equal(pkg_version);
			expect(error_stub.calledWith("Git error while getting version: %s\nFalling back to npm package version.", "Zesty testy parsed git error")).to.be.true;
		});
		it("named something else by throwing it", async function () {
			gitStub.throws(new TypeError("Wrong Zesty"));
			await expect(get_version()).to.be.rejectedWith(TypeError, "Wrong Zest"); // matches substring so we're fine
		});
	});
});

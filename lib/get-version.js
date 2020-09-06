/**
 * @file Gets it's own version from Git.
 * @author Aiden Woodruff <aiden.woodruff@gmail.com>
 * @copyright Aiden Woodruff 2020
 * @license MIT
 */

const Git = require("simple-git")();

/**
 * Get version.
 * 
 * @module {Function} lib/get-version
 */

/**
 * Get version using Git or npm as a fallback.
 * 
 * @async
 * @example
 * const getVersion = require("./lib/get-version");
 * 
 * // Get the version of the HEAD commit
 * let version = getVersion();
 * 
 * // Get the version of the 8835f11 commit
 * let version2 = getVersion("8835f11"); // version2 = "v1.1.0"
 * 
 * @param {string} [commit="HEAD"] The commit to get the version for.
 * @returns {string} If on a commit which has a tag associated with it, the name of that tag.
 * If not, the commit hash and branch name.
 * If Git fails, the current version in package.json.
 * @throws Things that aren't GitError or GitResponseError.
 */
module.exports = async function (commit) {
	"use strict";
	if (commit === undefined) commit = "HEAD";
	let cur_branch = "";
	let version = "";
	try {
		cur_branch = (await Git.branch())["current"];
		let cur_tag = "";
		try {
			cur_tag = await Git.raw("describe", "--exact-match", "--tags", commit);
		} catch (e) {
			if (!/fatal: no tag exactly matches/.test(e.message)) throw e;
		}

		if (typeof cur_tag !== "undefined" && !cur_tag.failed && /v\d\.\d\.\d(?:-[^ ]+)?/.test(cur_tag)) {
			version = cur_tag.replace(/^\s+|\s+$/g, "");
		} else {
			let commit_hash = await Git.revparse(["--short", commit]);
			version = `${commit_hash} (branch: ${cur_branch})`;
		}
	} catch (e) {
		if (e.name === "GitError") {
			console.error("Git error while getting version: %s\nFalling back to npm package version.", e.message);
		} else if (e.name === "GitResponseError") {
			console.error("Git error while getting version: %s\nFalling back to npm package version.", e.git);
		} else {
			// An error from somewhere other than SimpleGit or a Git TaskConfigurationError (which is programmer error, so throw)
			throw e;
		}
		version = require("../package.json")["version"];
	}
	return version;
};

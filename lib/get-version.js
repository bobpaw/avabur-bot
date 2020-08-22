const Git = require("simple-git")();

module.exports = async function () {
	"use strict";
	let branch = await Git.branch();
	let cur_tag = await Git.raw(["describe", "--exact-match", "--tags", "HEAD"]).catch(e => {
		if (!/fatal: no tag exactly matches/.test(e.message)) throw e;
	});
	if (cur_tag && !cur_tag.failed && /v\d\.\d\.\d(?:-[^ ]+)?/.test(cur_tag)) {
		console.log(`Providing version ${cur_tag}`);
		return cur_tag;
	} else if (branch["current"] === "experimental") {
		let commit_hash = await Git.revparse(["--short", "HEAD"]);
		console.log(`Providing current commit hash ${commit_hash}`);
		return commit_hash;
	} else {
		console.log(`Providing current branchname ${branch["current"]}`);
		return branch["current"];
	}
};
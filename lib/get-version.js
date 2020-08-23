const Git = require("simple-git")();

module.exports = async function (commit) {
	"use strict";
	if (commit === undefined) commit = "HEAD";
	let branch = await Git.branch();
	let cur_tag = await Git.raw(["describe", "--exact-match", "--tags", commit]).catch(e => {
		if (!/fatal: no tag exactly matches/.test(e.message)) throw e;
	});
	if (cur_tag && !cur_tag.failed && /v\d\.\d\.\d(?:-[^ ]+)?/.test(cur_tag)) {
		return cur_tag.replace(/^\s+|\s+$/g, "");
	} else {
		let commit_hash = await Git.revparse(["--short", commit]);
		return `${commit_hash} (branch: ${branch["current"]})`;
	}
};

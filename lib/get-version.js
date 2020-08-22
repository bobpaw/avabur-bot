const Git = require("simple-git")();

module.exports = async function () {
	"use strict";
	let branch = await Git.branch();
	let cur_tag = await Git.raw(["describe", "--exact-match", "--tags", "HEAD"]).catch(e => {
		if (!/fatal: no tag exactly matches/.test(e.message)) throw e;
	});
	if (cur_tag && !cur_tag.failed && /v\d\.\d\.\d(?:-[^ ]+)?/.test(cur_tag)) {
		return cur_tag;
	} else {
		let commit_hash = await Git.revparse(["--short", "HEAD"]);
		return `${commit_hash} (branch: ${branch})`;
	}
};

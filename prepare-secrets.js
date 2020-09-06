/**
 * @file Installs a secrets.js file if it does not exist.
 * @author Aiden Woodruff <aiden.woodruff@gmail.com>
 * @license MIT
 */

const fs = require("fs");

fs.access("secrets.js", function (err) {
	if (err) {
		console.log("Installing sample secrets.js file so that tests pass.");
		fs.copyFile("secrets.sample.js", "secrets.js", fs.constants.COPYFILE_EXCL, (e) => { if (e) throw e; });
	} else {
		console.log("Not overwriting current secrets.js file.");
	}
});

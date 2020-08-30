const fs = require("fs");

fs.access("secrets.js", function (err) {
	if (err) {
		fs.copyFile("secrets.sample.js", "secrets.js", fs.constants.COPYFILE_EXCL, (e) => { if (e) throw e; });
	}
});

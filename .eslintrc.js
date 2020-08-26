module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2020: true,
		mocha: true
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: 11
	},
	rules: {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			(require("os").EOL === "\r\n" ? "windows" : "unix")
		],
		"quotes": [
			"error",
			"double"
		],
		"quote-props": [
			"error",
			"consistent-as-needed"
		],
		"semi": [
			"error",
			"always"
		]
	}
};

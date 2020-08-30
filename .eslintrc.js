module.exports = {
	env: {
		node: true,
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
		],
		"eol-last": [
			"error",
			"always"
		],
		"block-spacing": [
			"error",
			"always"
		],
		"arrow-spacing": [
			"error",
			{
				before: true,
				after: true
			}
		],
		"comma-spacing": [
			"error",
			{
				before: false,
				after: true
			}
		],
		"space-before-blocks": [
			"error",
			"always"
		],
		"keyword-spacing": [
			"error",
			{
				before: true,
				after: true
			}
		]
	}
};

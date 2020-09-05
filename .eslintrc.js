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
	plugins: [
		"jsdoc"
	],
	ignorePatterns: [".eslintrc.js"],
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
			"double",
			{
				avoidEscape: true,
				allowTemplateLiterals: true
			}
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
		],
		"jsdoc/check-access": "error",
		"jsdoc/check-alignment": "error", // Recommended
		"jsdoc/check-examples": "warn",
		"jsdoc/check-indentation": "error",
		"jsdoc/check-param-names": "error", // Recommended
		"jsdoc/check-syntax": "error",
		"jsdoc/check-tag-names": "error", // Recommended
		"jsdoc/check-types": "error", // Recommended
		"jsdoc/empty-tags": "error",
		"jsdoc/implements-on-classes": "error", // Recommended
		"jsdoc/match-description": "off",
		"jsdoc/newline-after-description": "error", // Recommended
		"jsdoc/no-bad-blocks": "error",
		"jsdoc/no-types": "off", // Only 1 if using TypeScript
		"jsdoc/no-undefined-types": "error", // Recommended
		"jsdoc/require-description": "error",
		"jsdoc/require-description-complete-sentence": "warn",
		"jsdoc/require-example": "warn",
		"jsdoc/require-file-overview": "warn",
		"jsdoc/require-hyphen-before-param-description": "off",
		"jsdoc/require-jsdoc": "warn", // Recommended
		"jsdoc/require-param": "error", // Recommended
		"jsdoc/require-param-description": "error", // Recommended
		"jsdoc/require-param-name": "error", // Recommended
		"jsdoc/require-param-type": "error", // Recommended
		"jsdoc/require-property": "error",
		"jsdoc/require-property-description": "error",
		"jsdoc/require-property-name": "error",
		"jsdoc/require-property-type": "error",
		"jsdoc/require-returns": "error", // Recommended
		"jsdoc/require-returns-check": "error", // Recommended
		"jsdoc/require-returns-description": "error", // Recommended
		"jsdoc/require-returns-type": "error", // Recommended
		"jsdoc/require-throws": "error",
		"jsdoc/valid-types": "error" // Recommended
	}
};

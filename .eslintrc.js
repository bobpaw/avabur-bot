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
	ignorePatterns: ["out/"],
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
		"jsdoc/valid-types": 0 // Recommended; Broken rn
	},
	overrides: [
		{
			files: ["*.test.js", ".eslintrc.js"],
			rules: {
				"jsdoc/check-access": 0, "jsdoc/check-alignment": 0, "jsdoc/check-examples": 0,
				"jsdoc/check-indentation": 0, "jsdoc/check-param-names": 0, "jsdoc/check-syntax": 0,
				"jsdoc/check-tag-names": 0, "jsdoc/check-types": 0, "jsdoc/empty-tags": 0,
				"jsdoc/implements-on-classes": 0, "jsdoc/match-description": 0, "jsdoc/newline-after-description": 0,
				"jsdoc/no-bad-blocks": 0, "jsdoc/no-types": 0, "jsdoc/no-undefined-types": 0,
				"jsdoc/require-description": 0, "jsdoc/require-description-complete-sentence": 0,
				"jsdoc/require-example": 0, "jsdoc/require-file-overview": 0, "jsdoc/require-hyphen-before-param-description": 0,
				"jsdoc/require-jsdoc": 0, "jsdoc/require-param": 0, "jsdoc/require-param-description": 0,
				"jsdoc/require-param-name": 0, "jsdoc/require-param-type": 0, "jsdoc/require-property": 0,
				"jsdoc/require-property-description": 0, "jsdoc/require-property-name": 0,
				"jsdoc/require-property-type": 0, "jsdoc/require-returns": 0, "jsdoc/require-returns-check": 0,
				"jsdoc/require-returns-description": 0, "jsdoc/require-returns-type": 0,
				"jsdoc/require-throws": 0, "jsdoc/valid-types": 0
			}
		}
	]
};

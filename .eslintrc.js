module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es2020": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 11
	},
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			process.env.VisualStudioEdition === undefined ? "unix" : "windows"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		]
	}
};

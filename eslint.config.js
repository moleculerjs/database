const js = require("@eslint/js");
const globals = require("globals");
const pluginN = require("eslint-plugin-n");
const pluginSecurity = require("eslint-plugin-security");
const prettier = require("eslint-config-prettier");

module.exports = [
	js.configs.recommended,
	pluginSecurity.configs.recommended,
	prettier,
	{
		plugins: {
			n: pluginN,
			security: pluginSecurity
		},
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: "commonjs",
			globals: {
				...globals.node,
				...globals.jest,
				...globals.jasmine
			}
		},
		rules: {
			"no-var": "error",
			"no-console": "warn",
			"no-unused-vars": "warn",
			"no-trailing-spaces": "error",
			"security/detect-object-injection": "off",
			"security/detect-non-literal-require": "off",
			"security/detect-non-literal-fs-filename": "off",
			"no-process-exit": "off",
			"n/no-unpublished-require": "off",
			"require-atomic-updates": "off",
			"object-curly-spacing": ["warn", "always"],
			"no-useless-assignment": "off"
		}
	}
];

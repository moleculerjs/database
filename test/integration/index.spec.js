"use strict";

const _ = require("lodash");
const AdapterTests = require("./adapter.test");
const MethodTests = require("./methods.test");
const ScopeTests = require("./scopes.test");
const ActionsTests = require("./actions.test");
const TransformTests = require("./transform.test");
const PopulateTests = require("./populate.test");
const ValidationTests = require("./validation.test");
const RESTTests = require("./rest.test");
const TenantTests = require("./tenants.test");

// console.log(process.env);

let Adapters;
if (process.env.GITHUB_ACTIONS_CI) {
	/*const Adapters = Object.keys(require("../../").Adapters).filter(
		s => ["resolve", "register", "Base"].indexOf(s) == -1
	);
	*/
	Adapters = [
		{ type: "NeDB" },
		{ type: "MongoDB", options: { dbName: "db-int-test" } },
		{
			name: "Knex-SQLite",
			type: "Knex",
			options: {
				knex: {
					client: "sqlite3",
					connection: {
						filename: ":memory:"
					},
					useNullAsDefault: true
				}
			}
		}
	];
} else {
	// Local development tests
	Adapters = [
		{ type: "NeDB" },
		{ type: "MongoDB", options: { dbName: "db-int-test" } },
		{
			name: "Knex-SQLite",
			type: "Knex",
			options: {
				knex: {
					client: "sqlite3",
					connection: {
						filename: ":memory:"
					},
					useNullAsDefault: true
				}
			}
		}
	];
}

describe("Integration tests", () => {
	for (const adapter of Adapters) {
		const getAdapter = options => {
			if (adapter.options) return _.defaultsDeep({}, { options }, adapter);

			return adapter;
		};

		getAdapter.isNoSQL = ["NeDB", "MongoDB", "Mongoose"].includes(adapter.type);
		getAdapter.isSQL = ["Knex"].includes(adapter.type);
		getAdapter.IdColumnType = ["Knex"].includes(adapter.type) ? "integer" : "string";

		describe(`Adapter: ${adapter.name || adapter.type}`, () => {
			describe("Test adapter", () => AdapterTests(getAdapter, adapter.type));
			describe("Test methods", () => MethodTests(getAdapter, adapter.type));
			describe("Test scopes", () => ScopeTests(getAdapter, adapter.type));
			describe("Test actions", () => ActionsTests(getAdapter, adapter.type));
			describe("Test transformations", () => TransformTests(getAdapter, adapter.type));
			describe("Test populating", () => PopulateTests(getAdapter, adapter.type));
			describe("Test Validations", () => ValidationTests(getAdapter, adapter.type));
			describe("Test REST", () => RESTTests(getAdapter, adapter.type));
			describe("Test Tenants", () => TenantTests(getAdapter, adapter.type));
		});
	}
});

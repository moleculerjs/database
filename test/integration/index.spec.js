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
		{ type: "MongoDB", options: { dbName: "db-int-test", collection: "users" } }
	];
} else {
	// Local development tests
	Adapters = [
		{ type: "NeDB" },
		{ type: "MongoDB", options: { dbName: "db-int-test", collection: "users" } },
		{
			type: "Knex",
			options: {
				knex: {
					client: "sqlite3",
					connection: {
						filename: ":memory:"
					}
				}
			}
		}
	];
}

describe("Integration tests", () => {
	for (const adapter of Adapters) {
		const getAdapter = options => {
			if (adapter.options && adapter.options.collection)
				return _.defaultsDeep({}, { options }, adapter);

			return adapter;
		};

		describe(`Adapter: ${adapter.type}`, () => {
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

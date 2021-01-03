"use strict";

const _ = require("lodash");
const MethodTests = require("./methods.test");
const ScopeTests = require("./scopes.test");
const ActionsTests = require("./actions.test");
const TransformTests = require("./transform.test");
const PopulateTests = require("./populate.test");
const RESTTests = require("./rest.test");
const TenantTests = require("./tenants.test");

// console.log(process.env);

let Adapters;
if (process.env.CI) {
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
		//{ type: "NeDB" }
		{ type: "MongoDB", options: { dbName: "db-int-test", collection: "users" } }
	];
}

describe("Integration tests", () => {
	for (const adapter of Adapters) {
		const getAdapter = opts => {
			if (adapter.options && adapter.options.collection)
				return _.defaultsDeep({ options: { opts } }, adapter);

			return adapter;
		};

		describe(`Adapter: ${adapter.type}`, () => {
			// describe("Test common methods", () => MethodTests(getAdapter, adapter.type));
			// describe("Test scopes", () => ScopeTests(getAdapter, adapter.type));
			// describe("Test actions", () => ActionsTests(getAdapter, adapter.type));
			// describe("Test transformations", () => TransformTests(getAdapter, adapter.type));
			// describe("Test populating", () => PopulateTests(getAdapter, adapter.type));
			// describe("Test REST", () => RESTTests(getAdapter, adapter.type));
			describe("Test Tenants", () => TenantTests(getAdapter, adapter.type));
		});
	}
});

"use strict";

const MethodTests = require("./methods.test");
const ScopeTests = require("./scopes.test");
const ValidationTests = require("./validation.test");

// console.log(process.env);

/*const Adapters = Object.keys(require("../../").Adapters).filter(
	s => ["resolve", "register", "Base"].indexOf(s) == -1
);
*/
const Adapters = [
	"NeDB"
	{ type: "MongoDB", options: { dbName: "db-int-test", collection: "users" } }
];

describe("Integration tests", () => {
	for (const adapter of Adapters) {
		const adapterType = typeof adapter == "string" ? adapter : adapter.type;

		describe(`Adapter: ${adapterType}`, () => {
			describe("Test common methods", () => {
				MethodTests(adapter, adapterType);
			});
			describe("Test scopes", () => {
				ScopeTests(adapter, adapterType);
			});
			describe.only("Test validations", () => {
				ValidationTests(adapter, adapterType);
			});
		});
	}
});

"use strict";

const MethodTests = require("./methods.test");
const ScopeTests = require("./scopes.test");

/*const Adapters = Object.keys(require("../../").Adapters).filter(
	s => ["resolve", "register", "Base"].indexOf(s) == -1
);
*/
const Adapters = ["NeDB"];

describe("Integration tests", () => {
	for (const adapterName of Adapters) {
		describe(`Adapter: ${adapterName}`, () => {
			describe("Test common methods", () => {
				MethodTests(adapterName);
			});
			describe("Test scopes", () => {
				ScopeTests(adapterName);
			});
		});
	}
});

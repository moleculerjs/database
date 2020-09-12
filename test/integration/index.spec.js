"use strict";

const MethodTests = require("./methods");

/*const Adapters = Object.keys(require("../../").Adapters).filter(
	s => ["resolve", "register", "Base"].indexOf(s) == -1
);
*/
const Adapters = ["NeDB"];

describe("Integration tests", () => {
	for (const adapterName of Adapters) {
		describe(`Adapter: ${adapterName}`, () => {
			describe("Test adapter via methods", () => {
				MethodTests(adapterName);
			});
		});
	}
});

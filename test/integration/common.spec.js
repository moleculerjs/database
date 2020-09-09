"use strict";

const { ServiceBroker } = require("moleculer");
const DbService = require("../../");

const Adapters = ["?"];

describe("Integration tests", () => {
	for (const Adapter in Adapters) {
		describe(`Adapter: ${Adapter.constructor.name}`, () => {
			const broker = new ServiceBroker({ logger: false });
			const service = broker.createService({
				name: "posts",
				mixins: [DbService({ createActions: false })]
			});

			beforeAll(() => broker.start());
			afterAll(() => broker.stop());

			it("should be started", () => {
				expect(service).toBeDefined();
			});
		});
	}
});

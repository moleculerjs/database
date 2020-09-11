"use strict";

const { ServiceBroker } = require("moleculer");
const DbService = require("../../").Service;

const Adapters = Object.keys(require("../../").Adapters).filter(
	s => ["resolve", "register", "Base"].indexOf(s) == -1
);

describe("Integration tests", () => {
	for (const adapterName of Adapters) {
		describe(`Adapter: ${adapterName}`, () => {
			describe("Test adapter via methods", () => {
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

			describe("Test adapter via actions", () => {
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
		});
	}
});

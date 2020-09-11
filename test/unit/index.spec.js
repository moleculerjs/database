"use strict";

const { ServiceBroker } = require("moleculer");
const DbService = require("../../").Service;

describe("Test DbService", () => {
	const broker = new ServiceBroker({ logger: false });
	const service = broker.createService({
		name: "posts",
		mixins: [DbService({ createActions: false })]
	});

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it("should be created", () => {
		expect(service).toBeDefined();
	});
});

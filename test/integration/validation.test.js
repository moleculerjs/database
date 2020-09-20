"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { MoleculerClientError } = require("moleculer").Errors;
const { EntityNotFoundError } = require("../../src/errors");
const DbService = require("../..").Service;

module.exports = adapter => {
	describe("Test validation", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter,
					createActions: false
				})
			],
			settings: {}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});

		describe("Set up", () => {
			it("should return empty array", async () => {
				await svc.clearEntities();

				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});
		});
	});
};

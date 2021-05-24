"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

module.exports = (getAdapter, adapterType) => {
	let expectedID;
	if (["Knex"].includes(adapterType)) {
		expectedID = expect.any(Number);
	} else {
		expectedID = expect.any(String);
	}

	describe("Test transformations", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter()
				})
			],
			settings: {
				fields: {
					myID: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					},
					name: { type: "string" },
					upperName: {
						type: "string",
						readonly: true,
						virtual: true,
						get: ({ entity }) => (entity.name ? entity.name.toUpperCase() : entity.name)
					},
					password: { type: "string", hidden: true },
					token: { type: "string", hidden: "byDefault" },
					email: { type: "string", readPermission: "admin" },
					phone: { type: "string", permission: "admin" }
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}

				await this.clearEntities();
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		const docs = {};

		describe("Set up", () => {
			it("should return empty array", async () => {
				await svc.clearEntities();

				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});
		});

		describe("Test hidden fields, getter, readPermission", () => {
			it("create test entity", async () => {
				const res = await svc.createEntity(ctx, {
					name: "John Doe",
					upperName: "Nothing",
					email: "john.doe@moleculer.services",
					phone: "+1-555-1234",
					password: "johnDoe1234",
					token: "token1234"
				});
				docs.johnDoe = res;

				expect(res).toEqual({
					myID: expectedID,
					name: "John Doe",
					upperName: "JOHN DOE",
					email: "john.doe@moleculer.services",
					phone: "+1-555-1234"
				});
			});

			it("should hide e-mail address", async () => {
				svc.checkFieldAuthority = jest.fn(async () => false);
				const res = await svc.resolveEntities(ctx, { myID: docs.johnDoe.myID });
				expect(res).toEqual({
					myID: expectedID,
					name: "John Doe",
					upperName: "JOHN DOE"
				});
			});

			it("should not transform the entity", async () => {
				const res = await svc.resolveEntities(
					ctx,
					{ myID: docs.johnDoe.myID },
					{ transform: false }
				);
				expect(res).toEqual({
					_id: expect.anything(),
					name: "John Doe",
					email: "john.doe@moleculer.services",
					phone: "+1-555-1234",
					password: "johnDoe1234",
					token: "token1234"
				});
			});

			it("should filter fields", async () => {
				const res = await svc.resolveEntities(ctx, {
					myID: docs.johnDoe.myID,
					fields: ["upperName", "asdasdasd", "password", "email", "token"]
				});
				expect(res).toEqual({
					upperName: "JOHN DOE",
					token: "token1234"
				});
			});

			it("should filter all fields", async () => {
				const res = await svc.resolveEntities(ctx, {
					myID: docs.johnDoe.myID,
					fields: []
				});
				expect(res).toEqual({});
			});
		});
	});
};

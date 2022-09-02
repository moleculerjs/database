"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { EntityNotFoundError } = require("../../src/errors");
const DbService = require("../..").Service;

const TEST_DOCS = {
	johnDoe: {
		name: "John Doe",
		age: 42,
		status: true,
		dob: Date.parse("1980-10-07T00:00:00"),
		roles: ["admin", "user"]
	},

	janeDoe: {
		name: "Jane Doe",
		age: 35,
		status: false,
		dob: Date.parse("1986-03-03T00:00:00"),
		roles: ["moderator"]
	},

	bobSmith: {
		name: "Bob Smith",
		age: 58,
		status: true,
		dob: Date.parse("1964-04-22T00:00:00"),
		roles: ["user"]
	},

	kevinJames: {
		name: "Kevin James",
		age: 49,
		status: true,
		dob: Date.parse("1976-12-10T00:00:00"),
		roles: ["guest"]
	}
};

module.exports = (getAdapter, adapterType) => {
	describe("Test scopes", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: false
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					},
					name: { type: "string", trim: true, required: true },
					age: { type: "number", columnType: "integer", columnName: "ages" },
					dob: { type: "number", columnType: "bigInteger" },
					roles: { type: "array", items: "string", columnType: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					}
				},
				scopes: {
					onlyActive: {
						status: true
					},
					old: {
						age: { $gt: 50 }
					},
					young: {
						age: { $lt: 50 }
					},
					async myScope(q, ctx) {
						q.age = ctx.meta.age;
						return q;
					}
				},
				defaultScopes: ["onlyActive"]
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
		ctx.meta.age = 58;
		let docs = {};

		describe("Set up", () => {
			it("should return empty array", async () => {
				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});

			it("create test entities", async () => {
				for (const [key, value] of Object.entries(TEST_DOCS)) {
					docs[key] = await svc.createEntity(ctx, value);
				}
			});
		});

		describe("Test findEntities & countEntities", () => {
			it("should filtered by default scope", async () => {
				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.bobSmith, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(3);
			});

			it("should filtered by default scope", async () => {
				const params = { scope: true };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.bobSmith, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(3);
			});

			it("should filtered by default scope & custom query", async () => {
				const params = { query: { name: "Bob Smith" } };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(expect.arrayContaining([docs.bobSmith]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});

			it("should filtered by desired scope", async () => {
				const params = { scope: "young" };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(expect.arrayContaining([docs.johnDoe, docs.kevinJames]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});

			it("should filtered by desired scope without default scope", async () => {
				const params = { scope: ["young", "-onlyActive"] };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.janeDoe, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(3);
			});

			it("should filtered by desired scope & custom query", async () => {
				const params = { scope: "young", query: { name: "Kevin James" } };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(expect.arrayContaining([docs.kevinJames]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});

			it("should filtered by multi desired scope", async () => {
				const params = { scope: ["young", "onlyActive"] };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(expect.arrayContaining([docs.johnDoe, docs.kevinJames]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});

			it("should filtered by desired scope & custom query", async () => {
				const params = { scope: ["young", "onlyActive"], query: { name: "Kevin James" } };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(expect.arrayContaining([docs.kevinJames]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});

			it("should filtered by custom scope", async () => {
				const params = { scope: "myScope" };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual([docs.bobSmith]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});

			it("should filtered by custom scope & custom query", async () => {
				const params = { scope: "myScope", query: { name: "Bob Smith" } };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(expect.arrayContaining([docs.bobSmith]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});

			it("should disable default scope", async () => {
				const params = { scope: false };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(
					expect.arrayContaining([
						docs.johnDoe,
						docs.janeDoe,
						docs.bobSmith,
						docs.kevinJames
					])
				);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(4);
			});

			it("should disable default scope and filtered by custom query", async () => {
				const params = { scope: false, query: { name: "Jane Doe" } };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(expect.arrayContaining([docs.janeDoe]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});
		});

		describe("Test updateEntity & removeEntity", () => {
			it("setup", async () => {
				docs.kevinJames = await svc.updateEntity(ctx, {
					id: docs.kevinJames.id,
					status: false
				});
			});

			it("should throw error because entity is not in the scope", async () => {
				expect.assertions(2);
				try {
					await svc.updateEntity(ctx, {
						id: docs.kevinJames.id,
						age: 99
					});
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: docs.kevinJames.id });
				}
			});

			it("should update because scope is disabled", async () => {
				const res = await svc.updateEntity(
					ctx,
					{
						id: docs.kevinJames.id,
						age: 88
					},
					{ scope: false }
				);
				expect(res).toEqual({ ...docs.kevinJames, age: 88 });

				const kevin = await svc.findEntity(ctx, {
					query: { id: docs.kevinJames.id },
					scope: false
				});
				expect(kevin.age).toBe(88);
			});

			it("should throw error because entity is not in the scope", async () => {
				expect.assertions(2);
				try {
					await svc.replaceEntity(ctx, {
						id: docs.kevinJames.id,
						age: 99
					});
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: docs.kevinJames.id });
				}
			});

			it("should replace because scope is disabled", async () => {
				const res = await svc.replaceEntity(
					ctx,
					{
						id: docs.kevinJames.id,
						name: "Kevin James",
						age: 77,
						status: false,
						dob: Date.parse("1976-12-10T00:00:00"),
						roles: ["guest"]
					},
					{ scope: false }
				);
				expect(res).toEqual({ ...docs.kevinJames, age: 77 });

				const kevin = await svc.findEntity(ctx, {
					query: { id: docs.kevinJames.id },
					scope: false
				});
				expect(kevin.age).toBe(77);
			});

			it("should throw error because entity is not in the scope", async () => {
				expect.assertions(2);
				try {
					await svc.removeEntity(ctx, {
						id: docs.kevinJames.id
					});
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: docs.kevinJames.id });
				}
			});

			it("should remove because scope is disabled", async () => {
				const res = await svc.removeEntity(
					ctx,
					{
						id: docs.kevinJames.id
					},
					{ scope: false }
				);
				expect(res).toEqual(docs.kevinJames.id);

				const count = await svc.countEntities(ctx, { scope: false });
				expect(count).toEqual(3);
			});
		});

		describe("Test updateEntities & removeEntities", () => {
			it("should not update because entities is not in the scope", async () => {
				const res = await svc.updateEntities(ctx, {
					query: { name: "Jane Doe" },
					changes: { age: 99 }
				});
				expect(res).toEqual([]);

				const jane = await svc.findEntity(ctx, {
					query: { id: docs.janeDoe.id },
					scope: false
				});
				expect(jane.age).toBe(35);
			});

			it("should update because scope is disabled", async () => {
				const res = await svc.updateEntities(ctx, {
					query: { name: "Jane Doe" },
					changes: { age: 99 },
					scope: false
				});
				expect(res).toEqual([{ ...docs.janeDoe, age: 99 }]);

				const jane = await svc.findEntity(ctx, {
					query: { id: docs.janeDoe.id },
					scope: false
				});
				expect(jane.age).toBe(99);
			});

			it("should not remove because entity is not in the scope", async () => {
				const res = await svc.removeEntities(ctx, {
					query: { name: "Jane Doe" }
				});
				expect(res).toEqual([]);

				const count = await svc.countEntities(ctx, { scope: false });
				expect(count).toEqual(3);
			});

			it("should remove because scope is disabled", async () => {
				const res = await svc.removeEntities(ctx, {
					query: { name: "Jane Doe" },
					scope: false
				});
				expect(res).toEqual([docs.janeDoe.id]);

				const count = await svc.countEntities(ctx, { scope: false });
				expect(count).toEqual(2);
			});
		});
	});
};

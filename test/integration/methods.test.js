"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { MoleculerClientError, ValidationError } = require("moleculer").Errors;
const { EntityNotFoundError } = require("../../src/errors");
const { addExpectAnyFields } = require("./utils");
const { Stream } = require("stream");
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
		status: false,
		dob: Date.parse("1976-12-10T00:00:00"),
		roles: ["guest"]
	}
};

module.exports = (getAdapter, adapterType) => {
	let expectedID;
	if (["Knex"].includes(adapterType)) {
		expectedID = expect.any(Number);
	} else {
		expectedID = expect.any(String);
	}

	describe("Test findEntity, findEntities & countEntities method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({ adapter: getAdapter({ collection: "users" }), createActions: false })
			],

			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string", trim: true, required: true },
					age: { type: "number" },
					dob: { type: "number" },
					roles: { type: "array", items: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? v => !!v : undefined
					},
					_score: { type: "number", readonly: true }
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.client.schema.createTable("users", function (table) {
						table.increments("_id");
						table.string("name").index();
						table.integer("age");
						table.date("dob");
						table.boolean("status");
						table.string("roles").index();
					});
				}

				await this.clearEntities();
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		describe("Set up", () => {
			it("should return empty array", async () => {
				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});

			it("Adapter specific setups", async () => {
				if (adapterType == "MongoDB") {
					(await svc.getAdapter()).createIndex({
						fields: { name: "text", age: "text", roles: "text" }
					});
				}
			});

			it("create test entities", async () => {
				for (const [key, value] of Object.entries(TEST_DOCS)) {
					docs[key] = await svc.createEntity(ctx, Object.assign({}, value));
				}
				expect(docs.johnDoe).toEqual({ ...TEST_DOCS.johnDoe, id: expectedID });
				expect(docs.janeDoe).toEqual({ ...TEST_DOCS.janeDoe, id: expectedID });
				expect(docs.bobSmith).toEqual({ ...TEST_DOCS.bobSmith, id: expectedID });
				expect(docs.kevinJames).toEqual({
					...TEST_DOCS.kevinJames,
					id: expectedID
				});
			});
		});

		describe("Test sort, limit, offset", () => {
			it("should return all rows", async () => {
				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(expect.arrayContaining(Object.values(docs)));

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(4);
			});

			it("should sort & limit rows", async () => {
				const params = { sort: "age", limit: 2 };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual([docs.janeDoe, docs.johnDoe]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(4);
			});

			it("should sort & limit & offset rows", async () => {
				const params = { sort: "age", limit: 2, offset: 2 };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual([docs.kevinJames, docs.bobSmith]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(4);
			});

			it("should negative sort the rows", async () => {
				const rows = await svc.findEntities(ctx, { sort: "-dob" });
				expect(rows).toEqual([docs.janeDoe, docs.johnDoe, docs.kevinJames, docs.bobSmith]);
			});

			it("should multiple sort the rows", async () => {
				const rows = await svc.findEntities(ctx, { sort: ["status", "-age"] });
				expect(rows).toEqual([docs.kevinJames, docs.janeDoe, docs.bobSmith, docs.johnDoe]);
			});

			it("should multiple sort the rows (reverse)", async () => {
				const rows = await svc.findEntities(ctx, { sort: ["-status", "age"] });
				expect(rows).toEqual([docs.johnDoe, docs.bobSmith, docs.janeDoe, docs.kevinJames]);
			});
		});

		describe("Test full-text search", () => {
			it("should filter by searchText", async () => {
				const params = { search: "Doe", searchFields: ["name"] };
				const rows = await svc.findEntities(ctx, params);
				if (adapterType == "MongoDB") {
					expect(rows).toEqual(
						expect.arrayContaining([
							addExpectAnyFields(docs.janeDoe, { _score: Number }),
							addExpectAnyFields(docs.johnDoe, { _score: Number })
						])
					);
				} else expect(rows).toEqual(expect.arrayContaining([docs.janeDoe, docs.johnDoe]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});

			it("should filter by searchText", async () => {
				const params = { search: "user", searchFields: ["roles"] };
				const rows = await svc.findEntities(ctx, params);
				if (adapterType == "MongoDB") {
					expect(rows).toEqual(
						expect.arrayContaining([
							addExpectAnyFields(docs.bobSmith, { _score: Number }),
							addExpectAnyFields(docs.johnDoe, { _score: Number })
						])
					);
				} else expect(rows).toEqual(expect.arrayContaining([docs.johnDoe, docs.bobSmith]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});

			if (["NeDB"].indexOf(adapterType) !== -1) {
				it("should filter by searchText && searchFields", async () => {
					const params = {
						search: "user",
						searchFields: ["name", "age"]
					};
					const rows = await svc.findEntities(ctx, params);
					expect(rows).toEqual([]);

					const count = await svc.countEntities(ctx, params);
					expect(count).toEqual(0);
				});
			}

			it("should filter by searchText & sort", async () => {
				const params = {
					search: "user",
					searchFields: ["name", "roles"],
					sort: "-age"
				};
				const rows = await svc.findEntities(ctx, params);
				if (adapterType == "MongoDB") {
					expect(rows).toEqual(
						expect.arrayContaining([
							addExpectAnyFields(docs.bobSmith, { _score: Number }),
							addExpectAnyFields(docs.johnDoe, { _score: Number })
						])
					);
				} else expect(rows).toEqual([docs.bobSmith, docs.johnDoe]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});
		});

		describe("Test query", () => {
			it("should filter by query", async () => {
				const params = { query: { name: "Jane Doe" } };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual([docs.janeDoe]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});

			it("should filter by multi query", async () => {
				const params = { query: { status: true, age: 58 } };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual([docs.bobSmith]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});

			it("should filter by query & limit & sort", async () => {
				const params = {
					query: { status: false },
					sort: "-age",
					limit: 1
				};
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual([docs.kevinJames]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});

			it("should filter by query & full-text search", async () => {
				const params = {
					query: { status: false },
					search: "Doe",
					searchFields: ["name"]
				};
				const rows = await svc.findEntities(ctx, params);
				if (adapterType == "MongoDB") {
					expect(rows).toEqual([addExpectAnyFields(docs.janeDoe, { _score: Number })]);
				} else expect(rows).toEqual([docs.janeDoe]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(1);
			});

			it("should filter by all", async () => {
				docs.joeDoe = await svc.createEntity(ctx, {
					...TEST_DOCS.janeDoe,
					name: "Joe Doe",
					status: false,
					age: 20
				});

				const params = {
					query: { status: false },
					search: "Doe",
					searchFields: ["name"],
					sort: "age",
					limit: 1
				};
				const rows = await svc.findEntities(ctx, params);
				if (adapterType == "MongoDB") {
					expect(rows).toEqual([addExpectAnyFields(docs.joeDoe, { _score: Number })]);
				} else expect(rows).toEqual([docs.joeDoe]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});
		});

		describe("Test findEntity", () => {
			it("should return the first row by query", async () => {
				const params = { query: { name: "Jane Doe" } };
				const row = await svc.findEntity(ctx, params);
				expect(row).toEqual(docs.janeDoe);
			});

			it("should return the first row by query", async () => {
				const params = { query: { status: true, age: 58 } };
				const row = await svc.findEntity(ctx, params);
				expect(row).toEqual(docs.bobSmith);
			});

			it("should return null if no match", async () => {
				const params = { query: { age: 88 } };
				const row = await svc.findEntity(ctx, params);
				expect(row == null).toBe(true);
			});
		});

		if (["MongoDB"].indexOf(adapterType) !== -1) {
			describe("Test streamEntities", () => {
				it("should return all rows", async () => {
					const rows = [];
					const stream = await svc.streamEntities(ctx, {});
					expect.assertions(2);

					return new Promise((resolve, reject) => {
						expect(stream).toBeInstanceOf(Stream);
						stream.on("data", row => rows.push(row));

						expect.assertions(2);
						stream.on("error", reject);
						stream.on("end", () => {
							expect(rows).toEqual(expect.arrayContaining(Object.values(docs)));
							resolve();
						});
					});
				});
			});
		}
	});

	describe("Test createEntity & createEntities & resolveEntities method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({ adapter: getAdapter({ collection: "users" }), createActions: false })
			],

			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string", trim: true, required: true },
					age: { type: "number" },
					dob: { type: "number" },
					roles: { type: "array", items: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? v => !!v : undefined
					}
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.client.schema.createTable("users", function (table) {
						table.increments("_id");
						table.string("name").index();
						table.integer("age");
						table.date("dob");
						table.boolean("status");
						table.string("roles").index();
					});
				}

				await this.clearEntities();
			}
		});
		svc.entityChanged = jest.fn();

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		it("should return empty array", async () => {
			const rows = await svc.findEntities(ctx);
			expect(rows).toEqual([]);

			const count = await svc.countEntities(ctx);
			expect(count).toEqual(0);
		});

		it("create an entity", async () => {
			svc.entityChanged.mockClear();
			docs.johnDoe = await svc.createEntity(ctx, TEST_DOCS.johnDoe);

			expect(docs.johnDoe).toEqual({ ...TEST_DOCS.johnDoe, id: expectedID });

			expect(svc.entityChanged).toBeCalledTimes(1);
			expect(svc.entityChanged).toBeCalledWith("create", docs.johnDoe, ctx);
		});

		it("create multiple entities", async () => {
			svc.entityChanged.mockClear();
			const res = await svc.createEntities(ctx, [
				TEST_DOCS.janeDoe,
				TEST_DOCS.bobSmith,
				TEST_DOCS.kevinJames
			]);

			expect(res.length).toBe(3);
			docs.janeDoe = res[0];
			docs.bobSmith = res[1];
			docs.kevinJames = res[2];

			expect(docs.janeDoe).toEqual({ ...TEST_DOCS.janeDoe, id: expectedID });
			expect(docs.bobSmith).toEqual({ ...TEST_DOCS.bobSmith, id: expectedID });
			expect(docs.kevinJames).toEqual({
				...TEST_DOCS.kevinJames,
				id: expectedID
			});

			expect(svc.entityChanged).toBeCalledTimes(1);
			expect(svc.entityChanged).toBeCalledWith("create", res, ctx);
		});

		describe("Test resolveEntities method", () => {
			it("resolve entities by IDs", async () => {
				const res = await svc.resolveEntities(ctx, { id: docs.janeDoe.id });
				expect(res).toEqual(docs.janeDoe);

				const res2 = await svc.resolveEntities(ctx, {
					id: [docs.johnDoe.id, docs.bobSmith.id]
				});
				expect(res2).toEqual([docs.johnDoe, docs.bobSmith]);
			});

			it("resolve entities by IDs with mapping", async () => {
				const res = await svc.resolveEntities(ctx, {
					id: docs.janeDoe.id,
					mapping: true
				});
				expect(res).toEqual({ [docs.janeDoe.id]: docs.janeDoe });

				const res2 = await svc.resolveEntities(ctx, {
					id: [docs.johnDoe.id, docs.bobSmith.id],
					mapping: true
				});
				expect(res2).toEqual({
					[docs.johnDoe.id]: docs.johnDoe,
					[docs.bobSmith.id]: docs.bobSmith
				});
			});

			it("throw Missing ID", async () => {
				expect.assertions(4);
				try {
					await svc.resolveEntities(ctx, { a: 5 });
				} catch (err) {
					expect(err).toBeInstanceOf(MoleculerClientError);
					expect(err.type).toEqual("MISSING_ID");
					expect(err.code).toEqual(400);
					expect(err.data).toEqual({ params: { a: 5 } });
				}
			});

			it("should not throw EntityNotFound", async () => {
				const res = await svc.resolveEntities(ctx, { id: "1234567890abcdef12345678" });
				expect(res == null).toBeTruthy();

				const res2 = await svc.resolveEntities(ctx, {
					id: ["1234567890abcdef12345678", "234567890abcdef123456789"]
				});
				expect(res2).toEqual([]);
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.resolveEntities(
						ctx,
						{ id: "1234567890abcdef12345678" },
						{ throwIfNotExist: true }
					);
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "1234567890abcdef12345678" });
				}
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.resolveEntities(
						ctx,
						{
							id: ["1234567890abcdef12345678", "234567890abcdef123456789"]
						},
						{ throwIfNotExist: true }
					);
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({
						id: ["1234567890abcdef12345678", "234567890abcdef123456789"]
					});
				}
			});
		});
	});

	describe("Test updateEntity & replaceEntity method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({ adapter: getAdapter({ collection: "users" }), createActions: false })
			],

			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string", trim: true, required: true },
					age: { type: "number" },
					dob: { type: "number" },
					height: { type: "number" },
					roles: { type: "array", items: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? v => !!v : undefined
					}
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.client.schema.createTable("users", function (table) {
						table.increments("_id");
						table.string("name").index();
						table.integer("age");
						table.integer("height");
						table.date("dob");
						table.boolean("status");
						table.string("roles").index();
					});
				}

				await this.clearEntities();
			}
		});
		svc.entityChanged = jest.fn();

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
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

		describe("Test updateEntity method", () => {
			it("should update an entity", async () => {
				svc.entityChanged.mockClear();
				const row = await svc.updateEntity(ctx, {
					id: docs.janeDoe.id,
					status: true,
					age: 28,
					height: 168
				});
				expect(row).toEqual({
					id: docs.janeDoe.id,
					name: "Jane Doe",
					age: 28,
					dob: docs.janeDoe.dob,
					height: 168,
					roles: ["moderator"],
					status: true
				});

				expect(svc.entityChanged).toBeCalledTimes(1);
				expect(svc.entityChanged).toBeCalledWith("update", row, ctx);
			});

			if (adapterType == "MongoDB" || adapterType == "NeDB") {
				it("should raw update an entity", async () => {
					svc.entityChanged.mockClear();
					const row = await svc.updateEntity(ctx, {
						id: docs.johnDoe.id,
						$raw: true,

						$set: {
							status: false,
							height: 192
						},
						$inc: {
							age: 1
						},
						$unset: {
							dob: true
						}
					});
					expect(row).toEqual({
						id: docs.johnDoe.id,
						name: "John Doe",
						age: 43,
						height: 192,
						roles: ["admin", "user"],
						status: false
					});

					expect(svc.entityChanged).toBeCalledTimes(1);
					expect(svc.entityChanged).toBeCalledWith("update", row, ctx);
				});
			}

			it("throw Missing ID", async () => {
				expect.assertions(4);
				try {
					await svc.updateEntity(ctx, { a: 5 });
				} catch (err) {
					expect(err).toBeInstanceOf(MoleculerClientError);
					expect(err.type).toEqual("MISSING_ID");
					expect(err.code).toEqual(400);
					expect(err.data).toEqual({ params: { a: 5 } });
				}
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.updateEntity(ctx, { id: "1234567890abcdef12345678" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "1234567890abcdef12345678" });
				}
			});
		});

		describe("Test replaceEntity method", () => {
			if (adapterType == "MongoDB" || adapterType == "NeDB") {
				it("should replace an entity", async () => {
					svc.entityChanged.mockClear();
					const row = await svc.replaceEntity(ctx, {
						id: docs.kevinJames.id,
						name: "Kevin",
						age: 72,
						height: 185
					});
					expect(row).toEqual({
						id: docs.kevinJames.id,
						name: "Kevin",
						age: 72,
						height: 185,
						status: true
					});

					expect(svc.entityChanged).toBeCalledTimes(1);
					expect(svc.entityChanged).toBeCalledWith("replace", row, ctx);
				});
			}

			it("throw Missing ID", async () => {
				expect.assertions(4);
				try {
					await svc.replaceEntity(ctx, { a: 5 });
				} catch (err) {
					expect(err).toBeInstanceOf(MoleculerClientError);
					expect(err.type).toEqual("MISSING_ID");
					expect(err.code).toEqual(400);
					expect(err.data).toEqual({ params: { a: 5 } });
				}
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.replaceEntity(ctx, { id: "1234567890abcdef12345678" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "1234567890abcdef12345678" });
				}
			});
		});
	});

	describe("Test removeEntity method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({ adapter: getAdapter({ collection: "users" }), createActions: false })
			],

			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string", trim: true, required: true },
					age: { type: "number" },
					dob: { type: "number" },
					height: { type: "number" },
					roles: { type: "array", items: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? v => !!v : undefined
					}
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.client.schema.createTable("users", function (table) {
						table.increments("_id");
						table.string("name").index();
						table.integer("age");
						table.date("dob");
						table.boolean("status");
						table.string("roles").index();
					});
				}

				await this.clearEntities();
			}
		});

		svc.entityChanged = jest.fn();

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
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

		describe("Test removeEntity", () => {
			it("should return all rows", async () => {
				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(expect.arrayContaining(Object.values(docs)));

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(4);
			});

			it("should return the remaining rows", async () => {
				svc.entityChanged.mockClear();

				const res = await svc.removeEntity(ctx, { id: docs.janeDoe.id });
				expect(res).toBe(docs.janeDoe.id);

				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.bobSmith, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(3);

				expect(svc.entityChanged).toBeCalledTimes(1);
				expect(svc.entityChanged).toBeCalledWith("remove", docs.janeDoe, ctx);
			});

			it("throw Missing ID", async () => {
				expect.assertions(4);
				try {
					await svc.removeEntity(ctx, { a: 5 });
				} catch (err) {
					expect(err).toBeInstanceOf(MoleculerClientError);
					expect(err.type).toEqual("MISSING_ID");
					expect(err.code).toEqual(400);
					expect(err.data).toEqual({ params: { a: 5 } });
				}
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.removeEntity(ctx, { id: "1234567890abcdef12345678" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "1234567890abcdef12345678" });
				}
			});
		});
	});

	describe("Test methods withouth 'ctx'", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({ adapter: getAdapter({ collection: "users" }), createActions: false })
			],
			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string", required: true },
					email: { type: "string", required: true },
					age: { type: "number", integer: true, positive: true, required: true }
				}
			},
			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.client.schema.createTable("users", function (table) {
						table.increments("_id");
						table.string("name");
						table.string("email");
						table.integer("age");
					});
				}

				await this.clearEntities();
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		let entity;

		it("setup", async () => {
			const rows = await svc.findEntities(null, {});
			expect(rows).toEqual([]);

			const count = await svc.countEntities(null, {});
			expect(count).toEqual(0);
		});

		it("should throw error if missing a field", async () => {
			expect.assertions(2);
			try {
				await svc.createEntity(null, {
					name: "John Doe",
					email: "john.doe@moleculer.services"
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
				expect(err.data).toEqual([
					{
						actual: undefined,
						field: "age",
						message: "The 'age' field is required.",
						type: "required"
					}
				]);
			}
		});

		it("should create entity", async () => {
			entity = await svc.createEntity(null, {
				name: "John Doe",
				email: "john.doe@moleculer.services",
				age: 30
			});

			expect(entity).toEqual({
				id: expectedID,
				name: "John Doe",
				email: "john.doe@moleculer.services",
				age: 30
			});
		});

		it("should update entity", async () => {
			const res = await svc.updateEntity(null, {
				id: entity.id,
				name: "Dr. John Doe",
				age: 33
			});

			expect(res).toEqual({
				id: entity.id,
				name: "Dr. John Doe",
				email: "john.doe@moleculer.services",
				age: 33
			});

			entity = res;
		});

		it("should find entities", async () => {
			const rows = await svc.findEntities(null, {});
			expect(rows).toEqual([
				{
					id: entity.id,
					name: "Dr. John Doe",
					email: "john.doe@moleculer.services",
					age: 33
				}
			]);
		});

		it("should count entities", async () => {
			const rows = await svc.countEntities(null, {});
			expect(rows).toBe(1);
		});

		it("should replace entity", async () => {
			const res = await svc.replaceEntity(null, {
				id: entity.id,
				name: "Mr. John Doe",
				email: "john.doe@moleculer.services",
				age: 44
			});

			expect(res).toEqual({
				id: entity.id,
				name: "Mr. John Doe",
				email: "john.doe@moleculer.services",
				age: 44
			});

			entity = res;
		});

		it("should remove entity", async () => {
			const res = await svc.removeEntity(null, { id: entity.id });

			expect(res).toEqual(entity.id);
		});
	});
};

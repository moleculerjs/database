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
			mixins: [DbService({ adapter: getAdapter(), createActions: false })],

			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string", trim: true, required: true, columnName: "full_name" },
					age: { type: "number", columnType: "integer", columnName: "ages" },
					dob: {
						type: "number",
						columnType: "bigInteger",
						get: ({ value }) => (typeof value == "string" ? Number(value) : value)
					},
					roles: { type: "array", items: "string", columnType: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					},
					_score: { type: "number", readonly: true, virtual: true }
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				} else if (adapterType == "MongoDB") {
					this.createIndex(adapter, {
						fields: { name: "text", age: "text", roles: "text" }
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
			});

			it("should sort & limit & offset rows", async () => {
				const params = { sort: "age", limit: 2, offset: 2 };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual([docs.kevinJames, docs.bobSmith]);
			});

			// Test MSSQL using offset without sort.
			// https://github.com/knex/knex/issues/1527
			it("should limit & offset rows without sort", async () => {
				const params = { limit: 2, offset: 2 };
				const rows = await svc.findEntities(ctx, params);
				expect(rows.length).toBe(2);
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
				const rows = await svc.findEntities(ctx, { sort: "-status,age" });
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
				const params = { query: { id: docs.bobSmith.id } };
				const row = await svc.findEntity(ctx, params);
				expect(row).toEqual(docs.bobSmith);
			});
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

			it("should return the first row by query & sort", async () => {
				const params = { query: { status: false }, sort: "age" };
				const row = await svc.findEntity(ctx, params);
				expect(row).toEqual(docs.joeDoe);
			});

			it("should return the first row by query & sort desc", async () => {
				const params = { query: { status: false }, sort: "-age" };
				const row = await svc.findEntity(ctx, params);
				expect(row).toEqual(docs.kevinJames);
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
			mixins: [DbService({ adapter: getAdapter(), createActions: false })],

			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string", trim: true, required: true },
					age: { type: "number", columnType: "integer" },
					dob: {
						type: "number",
						columnType: "bigInteger",
						get: ({ value }) => (typeof value == "string" ? Number(value) : value)
					},
					roles: { type: "array", items: "string", columnType: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					}
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
		let docs = {};
		jest.spyOn(ctx, "broadcast");

		it("should return empty array", async () => {
			const rows = await svc.findEntities(ctx);
			expect(rows).toEqual([]);

			const count = await svc.countEntities(ctx);
			expect(count).toEqual(0);
		});

		it("create an entity", async () => {
			ctx.broadcast.mockClear();
			docs.johnDoe = await svc.createEntity(ctx, TEST_DOCS.johnDoe);

			expect(docs.johnDoe).toEqual({ ...TEST_DOCS.johnDoe, id: expectedID });

			expect(ctx.broadcast).toBeCalledTimes(2);
			expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
				type: "create",
				data: docs.johnDoe,
				opts: {}
			});
			expect(ctx.broadcast).toBeCalledWith("users.created", {
				type: "create",
				data: docs.johnDoe,
				opts: {}
			});
		});

		it("create multiple entities", async () => {
			ctx.broadcast.mockClear();
			const res = await svc.createEntities(
				ctx,
				[TEST_DOCS.janeDoe, TEST_DOCS.bobSmith, TEST_DOCS.kevinJames],
				{ returnEntities: true }
			);

			expect(res.length).toBe(3);
			docs.janeDoe = res.find(e => e.name == "Jane Doe");
			docs.bobSmith = res.find(e => e.name == "Bob Smith");
			docs.kevinJames = res.find(e => e.name == "Kevin James");

			expect(docs.janeDoe).toEqual({ ...TEST_DOCS.janeDoe, id: expectedID });
			expect(docs.bobSmith).toEqual({ ...TEST_DOCS.bobSmith, id: expectedID });
			expect(docs.kevinJames).toEqual({
				...TEST_DOCS.kevinJames,
				id: expectedID
			});

			expect(ctx.broadcast).toBeCalledTimes(2);
			expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
				type: "create",
				data: res,
				opts: { batch: true, returnEntities: true }
			});
			expect(ctx.broadcast).toBeCalledWith("users.created", {
				type: "create",
				data: res,
				opts: { batch: true, returnEntities: true }
			});
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

			it("resolve entities by IDs with reordering", async () => {
				const res = await svc.resolveEntities(
					ctx,
					{
						id: [
							docs.johnDoe.id,
							docs.bobSmith.id,
							docs.kevinJames.id,
							null,
							docs.janeDoe.id,
							"123456879"
						]
					},
					{ reorderResult: true }
				);
				expect(res).toEqual([
					docs.johnDoe,
					docs.bobSmith,
					docs.kevinJames,
					null,
					docs.janeDoe,
					null
				]);

				const res2 = await svc.resolveEntities(
					ctx,
					{
						id: [
							"123456879",
							docs.janeDoe.id,
							null,
							docs.kevinJames.id,
							docs.bobSmith.id,
							docs.johnDoe.id
						]
					},
					{ reorderResult: true }
				);
				expect(res2).toEqual([
					null,
					docs.janeDoe,
					null,
					docs.kevinJames,
					docs.bobSmith,
					docs.johnDoe
				]);
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
				const res = await svc.resolveEntities(ctx, { id: "123456879" });
				expect(res == null).toBeTruthy();

				const res2 = await svc.resolveEntities(ctx, {
					id: ["123456879", "234567890"]
				});
				expect(res2).toEqual([]);
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.resolveEntities(ctx, { id: "123456879" }, { throwIfNotExist: true });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456879" });
				}
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.resolveEntities(
						ctx,
						{
							id: ["123456879", "234567890"]
						},
						{ throwIfNotExist: true }
					);
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({
						id: ["123456879", "234567890"]
					});
				}
			});
		});
	});

	describe("Test updateEntity & replaceEntity method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter: getAdapter(), createActions: false })],

			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					},
					name: { type: "string", trim: true, required: true },
					age: { type: "number", columnType: "integer" },
					dob: {
						type: "number",
						columnType: "bigInteger",
						get: ({ value }) => (typeof value == "string" ? Number(value) : value)
					},
					height: { type: "number", columnType: "integer" },
					roles: { type: "array", items: "string", columnType: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					}
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
		let docs = {};
		jest.spyOn(ctx, "broadcast");

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
				ctx.broadcast.mockClear();
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

				expect(ctx.broadcast).toBeCalledTimes(2);
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "update",
					data: row,
					opts: {}
				});
				expect(ctx.broadcast).toBeCalledWith("users.updated", {
					type: "update",
					data: row,
					opts: {}
				});
			});

			if (adapterType == "MongoDB" || adapterType == "NeDB") {
				it("should raw update an entity", async () => {
					ctx.broadcast.mockClear();
					const row = await svc.updateEntity(
						ctx,
						{
							id: docs.johnDoe.id,

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
						},
						{ raw: true }
					);
					expect(row).toEqual({
						id: docs.johnDoe.id,
						name: "John Doe",
						age: 43,
						height: 192,
						roles: ["admin", "user"],
						status: false
					});

					expect(ctx.broadcast).toBeCalledTimes(2);
					expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
						type: "update",
						data: row,
						opts: { raw: true }
					});
					expect(ctx.broadcast).toBeCalledWith("users.updated", {
						type: "update",
						data: row,
						opts: { raw: true }
					});
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
					await svc.updateEntity(ctx, { id: "123456789" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456789" });
				}
			});
		});

		describe("Test replaceEntity method", () => {
			if (adapterType == "MongoDB" || adapterType == "NeDB") {
				it("should replace an entity", async () => {
					ctx.broadcast.mockClear();
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

					expect(ctx.broadcast).toBeCalledTimes(2);
					expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
						type: "replace",
						data: row,
						opts: {}
					});
					expect(ctx.broadcast).toBeCalledWith("users.replaced", {
						type: "replace",
						data: row,
						opts: {}
					});
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
					await svc.replaceEntity(ctx, { id: "123456789" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456789" });
				}
			});
		});
	});

	describe("Test removeEntity method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter: getAdapter(), createActions: false })],

			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,

						columnName: "_id",
						columnType: "integer"
					},
					name: { type: "string", trim: true, required: true },
					age: { type: "number", columnType: "integer" },
					dob: {
						type: "number",
						columnType: "bigInteger",
						get: ({ value }) => (typeof value == "string" ? Number(value) : value)
					},
					height: { type: "number", columnType: "integer" },
					roles: { type: "array", items: "string", columnType: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					}
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
		let docs = {};
		jest.spyOn(ctx, "broadcast");

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
				ctx.broadcast.mockClear();

				const res = await svc.removeEntity(ctx, { id: docs.janeDoe.id });
				expect(res).toBe(docs.janeDoe.id);

				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.bobSmith, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(3);

				expect(ctx.broadcast).toBeCalledTimes(2);
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.janeDoe,
					opts: { softDelete: false }
				});
				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.janeDoe,
					opts: { softDelete: false }
				});
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
					await svc.removeEntity(ctx, { id: "123456789" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456789" });
				}
			});
		});
	});

	describe("Test updateMany & removeMany methods", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter: getAdapter(), createActions: false })],

			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						secure: true,
						columnName: "_id",
						columnType: "integer"
					},
					name: { type: "string", trim: true, required: true },
					age: { type: "number", columnType: "integer" },
					dob: {
						type: "number",
						columnType: "bigInteger",
						get: ({ value }) => (typeof value == "string" ? Number(value) : value)
					},
					height: { type: "number", columnType: "integer" },
					roles: { type: "array", items: "string", columnType: "string" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					}
				}
			},

			methods: {
				encodeID(id) {
					return "secured-" + id;
				},

				decodeID(id) {
					return id.slice(8);
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
		let docs = {};
		jest.spyOn(ctx, "broadcast");

		describe("Test updateEntities method", () => {
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

			it("should update multiple entities", async () => {
				ctx.broadcast.mockClear();
				const rows = await svc.updateEntities(ctx, {
					query: {
						status: true,
						age: { $gt: 40 }
					},
					changes: {
						status: false,
						age: 88
					}
				});
				expect(rows).toEqual(
					expect.arrayContaining([
						{
							...docs.bobSmith,
							age: 88,
							status: false
						},
						{
							...docs.johnDoe,
							age: 88,
							status: false
						}
					])
				);

				expect(ctx.broadcast).toBeCalledTimes(4);

				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "update",
					data: rows[0],
					opts: {}
				});
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "update",
					data: rows[1],
					opts: {}
				});

				expect(ctx.broadcast).toBeCalledWith("users.updated", {
					type: "update",
					data: rows[0],
					opts: {}
				});
				expect(ctx.broadcast).toBeCalledWith("users.updated", {
					type: "update",
					data: rows[1],
					opts: {}
				});
			});

			it("should return the updated entities", async () => {
				const rows = await svc.findEntities(ctx, {
					query: {
						status: false,
						age: 88
					},
					sort: "name"
				});

				expect(rows).toEqual([
					{
						...docs.bobSmith,
						age: 88,
						status: false
					},
					{
						...docs.johnDoe,
						age: 88,
						status: false
					}
				]);
			});

			if (adapterType == "MongoDB" || adapterType == "NeDB") {
				it("should raw update an entity", async () => {
					ctx.broadcast.mockClear();
					const rows = await svc.updateEntities(
						ctx,
						{
							query: {
								age: 88
							},
							changes: {
								$inc: {
									age: 1
								}
							}
						},
						{ raw: true }
					);
					expect(rows).toEqual(
						expect.arrayContaining([
							{
								...docs.bobSmith,
								age: 89,
								status: false
							},
							{
								...docs.johnDoe,
								age: 89,
								status: false
							}
						])
					);

					expect(ctx.broadcast).toBeCalledTimes(4);

					expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
						type: "update",
						data: rows[0],
						opts: { raw: true }
					});
					expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
						type: "update",
						data: rows[1],
						opts: { raw: true }
					});

					expect(ctx.broadcast).toBeCalledWith("users.updated", {
						type: "update",
						data: rows[0],
						opts: { raw: true }
					});
					expect(ctx.broadcast).toBeCalledWith("users.updated", {
						type: "update",
						data: rows[1],
						opts: { raw: true }
					});
				});
			}

			it("should return empty if no updated entities", async () => {
				ctx.broadcast.mockClear();
				const rows = await svc.updateEntities(ctx, {
					query: {
						status: false,
						age: { $lt: 10 }
					},
					changes: {
						status: true,
						age: 33
					}
				});
				expect(rows).toEqual([]);

				expect(ctx.broadcast).toBeCalledTimes(0);
			});
		});

		describe("Test removeEntities method", () => {
			it("should return empty array", async () => {
				await svc.clearEntities();

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

			it("should remove multiple entities", async () => {
				ctx.broadcast.mockClear();
				const rows = await svc.removeEntities(ctx, {
					query: {
						status: true,
						age: { $gt: 40 }
					}
				});
				expect(rows).toEqual(expect.arrayContaining([docs.bobSmith.id, docs.johnDoe.id]));
				expect(rows[0].startsWith("secured-")).toBeTruthy();

				expect(ctx.broadcast).toBeCalledTimes(4);

				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.bobSmith,
					opts: { softDelete: false }
				});
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.johnDoe,
					opts: { softDelete: false }
				});

				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.bobSmith,
					opts: { softDelete: false }
				});
				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.johnDoe,
					opts: { softDelete: false }
				});
			});

			it("should return the remaining entities", async () => {
				const rows = await svc.findEntities(ctx, { sort: "name" });
				expect(rows).toEqual([docs.janeDoe, docs.kevinJames]);
			});

			it("should return empty if no updated entities", async () => {
				ctx.broadcast.mockClear();
				const rows = await svc.removeEntities(ctx, {
					query: {
						status: false,
						age: { $lt: 10 }
					}
				});
				expect(rows).toEqual([]);

				expect(ctx.broadcast).toBeCalledTimes(0);
			});
		});
	});

	describe("Test soft delete feature", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter: getAdapter(), createActions: false })],

			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,

						columnName: "_id",
						columnType: "integer"
					},
					name: { type: "string", trim: true, required: true },
					age: { type: "number", columnType: "integer" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					},
					createdAt: {
						type: "number",
						readonly: true,
						columnType: "bigInteger",
						onCreate: () => Date.now()
					},
					updatedAt: {
						type: "number",
						readonly: true,
						columnType: "bigInteger",
						onUpdate: () => Date.now()
					},
					deletedAt: {
						type: "number",
						readonly: true,
						columnType: "bigInteger",
						hidden: "byDefault",
						default: null,
						onRemove: () => Date.now()
					}
				},

				scopes: {
					notDeleted: { deletedAt: null }
				},

				defaultScopes: ["notDeleted"]
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
		let docs = {};
		jest.spyOn(ctx, "broadcast");

		describe("Set up", () => {
			it("should return empty array", async () => {
				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);

				expect(svc.$softDelete).toBe(true);
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

			it("should soft delete a record", async () => {
				ctx.broadcast.mockClear();

				const res = await svc.removeEntity(ctx, { id: docs.janeDoe.id });
				expect(res).toBe(docs.janeDoe.id);

				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.bobSmith, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(3);

				expect(ctx.broadcast).toBeCalledTimes(2);
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.janeDoe,
					opts: { softDelete: true }
				});
				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.janeDoe,
					opts: { softDelete: true }
				});
			});

			it("should find the deleted record if scope is disabled", async () => {
				const rows = await svc.findEntities(ctx, { scope: false });
				expect(rows).toEqual(
					expect.arrayContaining([
						docs.johnDoe,
						docs.janeDoe,
						docs.bobSmith,
						docs.kevinJames
					])
				);

				const count = await svc.countEntities(ctx, { scope: false });
				expect(count).toEqual(4);
			});
		});

		describe("Test removeEntities", () => {
			it("should soft delete multiple records", async () => {
				ctx.broadcast.mockClear();

				const res = await svc.removeEntities(ctx, { query: { status: true } });
				expect(res).toEqual(expect.arrayContaining([docs.johnDoe.id, docs.bobSmith.id]));

				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(expect.arrayContaining([docs.kevinJames]));

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(1);

				expect(ctx.broadcast).toBeCalledTimes(4);
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.johnDoe,
					opts: { softDelete: true }
				});
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.bobSmith,
					opts: { softDelete: true }
				});

				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.johnDoe,
					opts: { softDelete: true }
				});
				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.bobSmith,
					opts: { softDelete: true }
				});
			});

			it("should find the deleted record if scope is disabled", async () => {
				const rows = await svc.findEntities(ctx, { scope: false });
				expect(rows).toEqual(
					expect.arrayContaining([
						docs.johnDoe,
						docs.janeDoe,
						docs.bobSmith,
						docs.kevinJames
					])
				);

				const count = await svc.countEntities(ctx, { scope: false });
				expect(count).toEqual(4);
			});
		});

		describe("Test softDelete disabling", () => {
			it("should real delete a record", async () => {
				ctx.broadcast.mockClear();

				const res = await svc.removeEntity(
					ctx,
					{ id: docs.janeDoe.id },
					{ softDelete: false, scope: false }
				);
				expect(res).toBe(docs.janeDoe.id);

				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(expect.arrayContaining([docs.kevinJames]));

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(1);

				expect(ctx.broadcast).toBeCalledTimes(2);
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.janeDoe,
					opts: { scope: false, softDelete: false }
				});
				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.janeDoe,
					opts: { scope: false, softDelete: false }
				});
			});

			it("should not find the deleted record if scope is disabled", async () => {
				const rows = await svc.findEntities(ctx, { scope: false });
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.bobSmith, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx, { scope: false });
				expect(count).toEqual(3);
			});

			it("should real delete multiple records", async () => {
				ctx.broadcast.mockClear();

				const res = await svc.removeEntities(
					ctx,
					{ query: { status: true }, scope: false },
					{ softDelete: false }
				);
				expect(res).toEqual(expect.arrayContaining([docs.johnDoe.id, docs.bobSmith.id]));

				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(expect.arrayContaining([docs.kevinJames]));

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(1);

				expect(ctx.broadcast).toBeCalledTimes(4);
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.johnDoe,
					opts: { scope: false, softDelete: false }
				});
				expect(ctx.broadcast).toBeCalledWith("cache.clean.users", {
					type: "remove",
					data: docs.bobSmith,
					opts: { scope: false, softDelete: false }
				});

				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.johnDoe,
					opts: { scope: false, softDelete: false }
				});
				expect(ctx.broadcast).toBeCalledWith("users.removed", {
					type: "remove",
					data: docs.bobSmith,
					opts: { scope: false, softDelete: false }
				});
			});

			it("should find the deleted record if scope is disabled", async () => {
				const rows = await svc.findEntities(ctx, { scope: false });
				expect(rows).toEqual(expect.arrayContaining([docs.kevinJames]));

				const count = await svc.countEntities(ctx, { scope: false });
				expect(count).toEqual(1);
			});
		});
	});

	describe("Test methods withouth 'ctx' (and entityChangedOldEntity)", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: false,
					entityChangedEventType: "emit",
					entityChangedOldEntity: true
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
					name: { type: "string", required: true },
					email: { type: "string", required: true },
					age: {
						type: "number",
						integer: true,
						positive: true,
						required: true,
						columnType: "integer"
					}
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

		jest.spyOn(broker, "emit");

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
			broker.emit.mockClear();

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

			expect(broker.emit).toBeCalledTimes(1);
			expect(broker.emit).toBeCalledWith("users.created", {
				type: "create",
				data: entity,
				oldData: null,
				opts: {}
			});
		});

		it("should update entity", async () => {
			broker.emit.mockClear();

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

			expect(broker.emit).toBeCalledTimes(1);
			expect(broker.emit).toBeCalledWith("users.updated", {
				type: "update",
				data: res,
				oldData: {
					id: entity.id,
					name: "John Doe",
					email: "john.doe@moleculer.services",
					age: 30
				},
				opts: {}
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
			broker.emit.mockClear();

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

			expect(broker.emit).toBeCalledTimes(1);
			expect(broker.emit).toBeCalledWith("users.replaced", {
				type: "replace",
				data: res,
				oldData: {
					id: entity.id,
					name: "Dr. John Doe",
					email: "john.doe@moleculer.services",
					age: 33
				},
				opts: {}
			});

			entity = res;
		});

		it("should remove entity", async () => {
			broker.emit.mockClear();

			const res = await svc.removeEntity(null, { id: entity.id });

			expect(res).toEqual(entity.id);

			expect(broker.emit).toBeCalledTimes(1);
			expect(broker.emit).toBeCalledWith("users.removed", {
				type: "remove",
				data: entity,
				oldData: null,
				opts: { softDelete: false }
			});
		});

		it("should clear entities", async () => {
			broker.emit.mockClear();

			const res = await svc.clearEntities();

			expect(res).toEqual(0);

			expect(broker.emit).toBeCalledTimes(1);
			expect(broker.emit).toBeCalledWith("users.cleared", {
				type: "clear",
				data: null,
				oldData: null,
				opts: {}
			});
		});
	});

	describe("Test custom service hooks", () => {
		const broker = new ServiceBroker({ logger: false });

		const adapterConnected = jest.fn();
		const adapterDisconnected = jest.fn();
		const afterResolveEntities1 = jest.fn();
		const afterResolveEntities2 = jest.fn();

		const DbServiceAdapterDef = getAdapter();

		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter: DbServiceAdapterDef })],

			hooks: {
				customs: {
					adapterConnected,
					adapterDisconnected,
					afterResolveEntities: [afterResolveEntities1, afterResolveEntities2]
				}
			},

			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string", trim: true, required: true, columnName: "full_name" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					}
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

		let docs = {};

		describe("Set up", () => {
			it("create test entities", async () => {
				for (const [key, value] of Object.entries(TEST_DOCS)) {
					docs[key] = await broker.call("users.create", Object.assign({}, value));
				}
			});
		});

		describe("Test hooks", () => {
			it("should called adapterConnected", async () => {
				const adapter = await svc.getAdapter();

				expect(adapterConnected).toBeCalledTimes(1);
				expect(adapterConnected).toBeCalledWith(adapter, "default", DbServiceAdapterDef);
			});

			it("should call both afterResolveEntities", async () => {
				const rawEntity = await svc.resolveEntities(
					null,
					{ id: docs.janeDoe.id },
					{ transform: false }
				);
				afterResolveEntities1.mockClear();
				afterResolveEntities2.mockClear();

				const res = await broker.call("users.resolve", { id: docs.janeDoe.id });
				expect(res).toEqual(docs.janeDoe);

				expect(afterResolveEntities1).toBeCalledTimes(1);
				expect(afterResolveEntities1).toBeCalledWith(
					expect.any(Context),
					"" + docs.janeDoe.id,
					rawEntity,
					{ id: "" + docs.janeDoe.id },
					{ throwIfNotExist: undefined }
				);

				expect(afterResolveEntities2).toBeCalledTimes(1);
				expect(afterResolveEntities2).toBeCalledWith(
					expect.any(Context),
					"" + docs.janeDoe.id,
					rawEntity,
					{ id: "" + docs.janeDoe.id },
					{ throwIfNotExist: undefined }
				);
			});

			it("should call both afterResolveEntities with multi ID", async () => {
				const rawEntities = await svc.resolveEntities(
					null,
					{ id: [docs.janeDoe.id, docs.kevinJames.id] },
					{ transform: false }
				);
				afterResolveEntities1.mockClear();
				afterResolveEntities2.mockClear();

				const res = await broker.call("users.resolve", {
					id: [docs.janeDoe.id, docs.kevinJames.id]
				});
				expect(res).toEqual(expect.arrayContaining([docs.janeDoe, docs.kevinJames]));

				expect(afterResolveEntities1).toBeCalledTimes(1);
				expect(afterResolveEntities1).toBeCalledWith(
					expect.any(Context),
					["" + docs.janeDoe.id, "" + docs.kevinJames.id],
					expect.arrayContaining(rawEntities),
					{ id: ["" + docs.janeDoe.id, "" + docs.kevinJames.id] },
					{ throwIfNotExist: undefined }
				);

				expect(afterResolveEntities2).toBeCalledTimes(1);
				expect(afterResolveEntities2).toBeCalledWith(
					expect.any(Context),
					["" + docs.janeDoe.id, "" + docs.kevinJames.id],
					expect.arrayContaining(rawEntities),
					{ id: ["" + docs.janeDoe.id, "" + docs.kevinJames.id] },
					{ throwIfNotExist: undefined }
				);
			});

			it("should called adapterDisconnected", async () => {
				const adapter = await svc.getAdapter();

				await svc._disconnectAll();

				expect(adapterDisconnected).toBeCalledTimes(1);
				expect(adapterDisconnected).toBeCalledWith(adapter, "default");
			});
		});
	});
};

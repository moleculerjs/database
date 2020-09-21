"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { MoleculerClientError } = require("moleculer").Errors;
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
	describe("Test findEntity, findEntities & countEntities method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter: getAdapter("users"), createActions: false })]
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		describe("Set up", () => {
			it("should return empty array", async () => {
				await svc.clearEntities();

				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});

			it("Adapter specific setups", async () => {
				if (adapterType == "MongoDB") {
					svc.adapter.collection.createIndex({
						name: "text",
						age: "text",
						roles: "text"
					});
				}
			});

			it("create test entities", async () => {
				for (const [key, value] of Object.entries(TEST_DOCS)) {
					docs[key] = await svc.createEntity(ctx, Object.assign({}, value));
				}
				expect(docs.johnDoe).toEqual({ ...TEST_DOCS.johnDoe, _id: expect.any(String) });
				expect(docs.janeDoe).toEqual({ ...TEST_DOCS.janeDoe, _id: expect.any(String) });
				expect(docs.bobSmith).toEqual({ ...TEST_DOCS.bobSmith, _id: expect.any(String) });
				expect(docs.kevinJames).toEqual({
					...TEST_DOCS.kevinJames,
					_id: expect.any(String)
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
				const params = { search: "Doe" };
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
				const params = { search: "user" };
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
					search: "Doe"
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
				expect(row).toBe(null);
			});
		});

		if (["MongoDB"].indexOf(adapterType) !== -1) {
			describe("Test streamEntities", () => {
				it("should return all rows", async () => {
					const rows = [];
					const stream = await svc.streamEntities(ctx, {});

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
			mixins: [DbService({ adapter: getAdapter("users"), createActions: false })]
		});
		svc.entityChanged = jest.fn();

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		it("should return empty array", async () => {
			await svc.clearEntities();

			const rows = await svc.findEntities(ctx);
			expect(rows).toEqual([]);

			const count = await svc.countEntities(ctx);
			expect(count).toEqual(0);
		});

		it("create an entity", async () => {
			svc.entityChanged.mockClear();
			docs.johnDoe = await svc.createEntity(ctx, TEST_DOCS.johnDoe);

			expect(docs.johnDoe).toEqual({ ...TEST_DOCS.johnDoe, _id: expect.any(String) });

			expect(svc.entityChanged).toBeCalledTimes(1);
			expect(svc.entityChanged).toBeCalledWith(docs.johnDoe, ctx, {
				type: "create"
			});
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

			expect(docs.janeDoe).toEqual({ ...TEST_DOCS.janeDoe, _id: expect.any(String) });
			expect(docs.bobSmith).toEqual({ ...TEST_DOCS.bobSmith, _id: expect.any(String) });
			expect(docs.kevinJames).toEqual({
				...TEST_DOCS.kevinJames,
				_id: expect.any(String)
			});

			expect(svc.entityChanged).toBeCalledTimes(1);
			expect(svc.entityChanged).toBeCalledWith(res, ctx, {
				type: "create",
				batch: true
			});
		});

		describe("Test resolveEntities method", () => {
			it("resolve entities by IDs", async () => {
				const res = await svc.resolveEntities(ctx, { id: docs.janeDoe._id });
				expect(res).toEqual(docs.janeDoe);

				const res2 = await svc.resolveEntities(ctx, {
					id: [docs.johnDoe._id, docs.bobSmith._id]
				});
				expect(res2).toEqual([docs.johnDoe, docs.bobSmith]);
			});

			it("resolve entities by IDs with mapping", async () => {
				const res = await svc.resolveEntities(ctx, { id: docs.janeDoe._id, mapping: true });
				expect(res).toEqual({ [docs.janeDoe._id]: docs.janeDoe });

				const res2 = await svc.resolveEntities(ctx, {
					id: [docs.johnDoe._id, docs.bobSmith._id],
					mapping: true
				});
				expect(res2).toEqual({
					[docs.johnDoe._id]: docs.johnDoe,
					[docs.bobSmith._id]: docs.bobSmith
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
				expect(res).toEqual();

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
			mixins: [DbService({ adapter: getAdapter("users"), createActions: false })]
		});
		svc.entityChanged = jest.fn();

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		describe("Set up", () => {
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
		});

		describe("Test updateEntity method", () => {
			it("should update an entity", async () => {
				svc.entityChanged.mockClear();
				const row = await svc.updateEntity(ctx, {
					id: docs.janeDoe._id,
					status: true,
					age: 28,
					height: 168
				});
				expect(row).toEqual({
					_id: docs.janeDoe._id,
					name: "Jane Doe",
					age: 28,
					dob: docs.janeDoe.dob,
					height: 168,
					roles: ["moderator"],
					status: true
				});

				expect(svc.entityChanged).toBeCalledTimes(1);
				expect(svc.entityChanged).toBeCalledWith(row, ctx, {
					type: "update"
				});
			});

			it("should raw update an entity", async () => {
				svc.entityChanged.mockClear();
				const row = await svc.updateEntity(ctx, {
					id: docs.johnDoe._id,
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
					_id: docs.johnDoe._id,
					name: "John Doe",
					age: 43,
					height: 192,
					roles: ["admin", "user"],
					status: false
				});

				expect(svc.entityChanged).toBeCalledTimes(1);
				expect(svc.entityChanged).toBeCalledWith(row, ctx, {
					type: "update"
				});
			});

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
			it("should replace an entity", async () => {
				svc.entityChanged.mockClear();
				const row = await svc.replaceEntity(ctx, {
					id: docs.kevinJames._id,
					name: "Kevin",
					age: 72,
					height: 185
				});
				expect(row).toEqual({
					_id: docs.kevinJames._id,
					name: "Kevin",
					age: 72,
					height: 185
				});

				expect(svc.entityChanged).toBeCalledTimes(1);
				expect(svc.entityChanged).toBeCalledWith(row, ctx, {
					type: "replace"
				});
			});

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
			mixins: [DbService({ adapter: getAdapter("users"), createActions: false })]
		});

		svc.entityChanged = jest.fn();

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		describe("Set up", () => {
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

				const res = await svc.removeEntity(ctx, { id: docs.janeDoe._id });
				expect(res).toBe(docs.janeDoe._id);

				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.bobSmith, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(3);

				expect(svc.entityChanged).toBeCalledTimes(1);
				expect(svc.entityChanged).toBeCalledWith(docs.janeDoe, ctx, {
					type: "remove",
					softDelete: false
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
					await svc.removeEntity(ctx, { id: "1234567890abcdef12345678" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "1234567890abcdef12345678" });
				}
			});
		});
	});
};

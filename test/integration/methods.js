"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { MoleculerClientError } = require("moleculer").Errors;
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
		status: false,
		dob: Date.parse("1976-12-10T00:00:00"),
		roles: ["guest"]
	}
};

module.exports = adapter => {
	describe("Test findEntities & countEntities method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter, createActions: false })]
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		describe("Set up", () => {
			it("should return empty rows", async () => {
				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});

			it("create test entities", async () => {
				for (const [key, value] of Object.entries(TEST_DOCS)) {
					docs[key] = await svc.createEntity(ctx, value);
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
				expect(rows).toEqual(expect.arrayContaining([docs.janeDoe, docs.johnDoe]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});

			it("should filter by searchText", async () => {
				const params = { search: "user" };
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual(expect.arrayContaining([docs.johnDoe, docs.bobSmith]));

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});

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

			it("should filter by searchText & sort", async () => {
				const params = {
					search: "user",
					searchFields: ["name", "roles"],
					sort: "-age"
				};
				const rows = await svc.findEntities(ctx, params);
				expect(rows).toEqual([docs.bobSmith, docs.johnDoe]);

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
				expect(rows).toEqual([docs.janeDoe]);

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
				expect(rows).toEqual([docs.joeDoe]);

				const count = await svc.countEntities(ctx, params);
				expect(count).toEqual(2);
			});
		});

		/*
		it("should return the new row", async () => {
			const rows = await svc.findEntities(ctx, {});
			expect(rows).toEqual([docs[0]]);
		});

		it("should return zero count", async () => {
			const count = await svc.countEntities(ctx, {});
			expect(count).toEqual(1);
		});

		it("should create multi entity", async () => {
			const res = await svc.createEntities(ctx, {
				entities: [
					{
						name: "Jane Doe",
						age: 35,
						status: false,
						dob
					},
					{
						name: "Bob Smith",
						age: 51,
						status: true,
						dob
					}
				]
			});
			expect(res.length).toBe(2);
			docs.push(...res);

			expect(res).toEqual([
				{
					_id: expect.any(String),
					name: "Jane Doe",
					age: 35,
					status: false,
					dob
				},
				{
					_id: expect.any(String),
					name: "Bob Smith",
					age: 51,
					status: true,
					dob
				}
			]);
		});

		it("should return all rows", async () => {
			const rows = await svc.findEntities(ctx, {});
			expect(rows).toEqual(expect.arrayContaining(docs));
		});

		it("should return zero count", async () => {
			const count = await svc.countEntities(ctx, {});
			expect(count).toEqual(3);
		});

		it("should filter rows", async () => {
			const rows = await svc.findEntities(ctx, { query: { status: true } });
			expect(rows).toEqual(expect.arrayContaining([docs[0], docs[2]]));
		});

		it("should return count of filtered rows", async () => {
			const count = await svc.countEntities(ctx, { query: { status: true } });
			expect(count).toEqual(2);
		});

		it("should update row", async () => {
					const doc = await svc.updateEntity(ctx, {
						id: docs[2]._id,
						name: "Adam Smith",
						age: 49
					});
					expect(doc).toEqual({
						_id: docs[2]._id,
						name: "Adam Smith",
						age: 49,
						status: true,
						dob
					});
				});

		it("should remove first row", async () => {
			const res = await svc.removeEntity(ctx, { id: docs[0]._id });
			expect(res).toBe(docs[0]._id);
		});

		it("should return only 2 rows", async () => {
			const rows = await svc.findEntities(ctx, {});
			expect(rows).toEqual(expect.arrayContaining([docs[1], docs[2]]));
		});

		it("should return count of filtered rows", async () => {
			const count = await svc.countEntities(ctx, {});
			expect(count).toEqual(2);
		});
		*/
	});

	describe("Test createEntity & createEntities & getEntity & getEntities & resolveEntities method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter, createActions: false })]
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		it("should return empty rows", async () => {
			const rows = await svc.findEntities(ctx);
			expect(rows).toEqual([]);

			const count = await svc.countEntities(ctx);
			expect(count).toEqual(0);
		});

		it("create an entity", async () => {
			docs.johnDoe = await svc.createEntity(ctx, TEST_DOCS.johnDoe);

			expect(docs.johnDoe).toEqual({ ...TEST_DOCS.johnDoe, _id: expect.any(String) });
		});

		it("create multiple entities", async () => {
			for (const [key, value] of Object.entries(TEST_DOCS)) {
				if (key == "johnDoe") continue;
				docs[key] = await svc.createEntity(ctx, value);
			}

			expect(docs.janeDoe).toEqual({ ...TEST_DOCS.janeDoe, _id: expect.any(String) });
			expect(docs.bobSmith).toEqual({ ...TEST_DOCS.bobSmith, _id: expect.any(String) });
			expect(docs.kevinJames).toEqual({
				...TEST_DOCS.kevinJames,
				_id: expect.any(String)
			});
		});

		describe("Test getEntity method", () => {
			it("get entity by ID", async () => {
				const res = await svc.getEntity(ctx, { id: docs.janeDoe._id });
				expect(res).toEqual(docs.janeDoe);

				const res2 = await svc.getEntity(ctx, { id: docs.bobSmith._id });
				expect(res2).toEqual(docs.bobSmith);
			});

			it("throw Missing ID", async () => {
				expect.assertions(4);
				try {
					await svc.getEntity(ctx, { a: 5 });
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
					await svc.getEntity(ctx, { id: "123456" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456" });
				}
			});
		});

		describe("Test getEntities method", () => {
			it("get entity by IDs", async () => {
				const res = await svc.getEntities(ctx, { id: docs.janeDoe._id });
				expect(res).toEqual([docs.janeDoe]);

				const res2 = await svc.getEntities(ctx, {
					id: [docs.johnDoe._id, docs.bobSmith._id]
				});
				expect(res2).toEqual([docs.johnDoe, docs.bobSmith]);
			});

			it("throw Missing ID", async () => {
				expect.assertions(4);
				try {
					await svc.getEntities(ctx, { a: 5 });
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
					await svc.getEntities(ctx, { id: "123456" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: ["123456"] });
				}
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.getEntities(ctx, { id: ["123456", "234567"] });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: ["123456", "234567"] });
				}
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

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.resolveEntities(ctx, { id: "123456" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456" });
				}
			});

			it("throw EntityNotFound", async () => {
				expect.assertions(2);
				try {
					await svc.resolveEntities(ctx, { id: ["123456", "234567"] });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: ["123456", "234567"] });
				}
			});
		});
	});

	describe("Test updateEntity & replaceEntity method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter, createActions: false })]
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		describe("Set up", () => {
			it("should return empty rows", async () => {
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
			});

			it("should raw update an entity", async () => {
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
					await svc.updateEntity(ctx, { id: "123456" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456" });
				}
			});
		});

		describe("Test replaceEntity method", () => {
			it("should replace an entity", async () => {
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
					await svc.replaceEntity(ctx, { id: "123456" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456" });
				}
			});
		});
	});

	describe("Test removeEntity method", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter, createActions: false })]
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		let docs = {};

		describe("Set up", () => {
			it("should return empty rows", async () => {
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
				const res = await svc.removeEntity(ctx, { id: docs.janeDoe._id });
				expect(res).toBe(docs.janeDoe._id);

				const rows = await svc.findEntities(ctx, {});
				expect(rows).toEqual(
					expect.arrayContaining([docs.johnDoe, docs.bobSmith, docs.kevinJames])
				);

				const count = await svc.countEntities(ctx, {});
				expect(count).toEqual(3);
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
					await svc.removeEntity(ctx, { id: "123456" });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.data).toEqual({ id: "123456" });
				}
			});
		});
	});
};

"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const { EntityNotFoundError } = require("../../src/errors");
const Fakerator = require("fakerator");
const { Stream } = require("stream");
const DbService = require("../..").Service;

const fakerator = new Fakerator();

module.exports = (getAdapter, adapterType) => {
	describe("Test a common flow", () => {
		const entityChanged = jest.fn();

		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "posts",
			mixins: [DbService({ adapter: getAdapter({ collection: "posts" }) })],
			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					title: { type: "string", trim: true, required: true },
					content: { type: "string" },
					author: { type: "string" },
					votes: { type: "number", default: 0 },
					status: { type: "boolean", default: true },
					createdAt: { type: "number", onCreate: Date.now },
					updatedAt: { type: "number", onUpdate: Date.now }
				}
			},

			methods: {
				entityChanged
			},

			async started() {
				await this.clearEntities();
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		let docs = [];

		describe("Set up", () => {
			it("should return empty array", async () => {
				const rows = await broker.call("posts.find");
				expect(rows).toEqual([]);

				const list = await broker.call("posts.list");
				expect(list).toEqual({
					rows: [],
					page: 1,
					pageSize: 10,
					total: 0,
					totalPages: 0
				});

				const count = await broker.call("posts.count");
				expect(count).toEqual(0);
			});
		});

		describe("Create & get entity", () => {
			it("should create a new entity", async () => {
				const doc = await broker.call("posts.create", {
					title: "First post",
					content: "Content of first post",
					author: "John Doe"
				});
				docs.push(doc);

				expect(doc).toEqual({
					id: expect.any(String),
					title: "First post",
					content: "Content of first post",
					author: "John Doe",
					votes: 0,
					status: true,
					createdAt: expect.any(Number)
				});

				expect(entityChanged).toBeCalledTimes(1);
				expect(entityChanged).toBeCalledWith("create", doc, expect.any(Context));
			});

			it("should get the newly created entity", async () => {
				const doc = await broker.call("posts.get", { id: docs[0].id });
				expect(doc).toEqual(docs[0]);
			});

			it("should resolve the newly created entity", async () => {
				const doc = await broker.call("posts.resolve", { id: docs[0].id });
				expect(doc).toEqual(docs[0]);
			});

			it("should find the newly created entity", async () => {
				const res = await broker.call("posts.find");

				expect(res).toEqual(docs);
			});

			it("should list the newly created entity", async () => {
				const res = await broker.call("posts.list");

				expect(res).toEqual({
					rows: docs,
					page: 1,
					pageSize: 10,
					total: 1,
					totalPages: 1
				});
			});

			it("should throw validation error", async () => {
				expect.assertions(5);
				try {
					await broker.call("posts.create", {});
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.message).toEqual("The 'title' field is required");
					expect(err.type).toEqual("REQUIRED_FIELD");
					expect(err.code).toEqual(422);
					expect(err.data).toEqual({ field: "title", value: undefined });
				}
			});
		});

		describe("Update & remove entity", () => {
			it("should update entity", async () => {
				entityChanged.mockClear();

				const doc = await broker.call("posts.update", {
					id: docs[0].id,
					title: "Modified title",
					content: "Modified content of first title",
					votes: 3,
					status: 0
				});
				docs[0] = doc;

				expect(doc).toEqual({
					id: expect.any(String),
					title: "Modified title",
					content: "Modified content of first title",
					author: "John Doe",
					votes: 3,
					status: false,
					createdAt: expect.any(Number),
					updatedAt: expect.any(Number)
				});

				expect(entityChanged).toBeCalledTimes(1);
				expect(entityChanged).toBeCalledWith("update", doc, expect.any(Context));
			});

			it("should get the newly created entity", async () => {
				const doc = await broker.call("posts.get", { id: docs[0].id });
				expect(doc).toEqual(docs[0]);
			});

			it("should resolve the newly created entity", async () => {
				const doc = await broker.call("posts.resolve", { id: docs[0].id, mapping: true });
				expect(doc).toEqual({
					[docs[0].id]: docs[0]
				});
			});

			it("should find the newly created entity", async () => {
				const res = await broker.call("posts.find");

				expect(res).toEqual(docs);
			});

			it("should remove entity", async () => {
				entityChanged.mockClear();
				const res = await broker.call("posts.remove", {
					id: docs[0].id,
					title: "Unused removed title"
				});

				expect(res).toEqual(docs[0].id);

				expect(entityChanged).toBeCalledTimes(1);
				expect(entityChanged).toBeCalledWith("remove", docs[0], expect.any(Context));
			});

			it("should throw EntityNotFound error", async () => {
				expect.assertions(5);
				try {
					await broker.call("posts.get", { id: docs[0].id });
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.message).toEqual("Entity not found");
					expect(err.type).toEqual("ENTITY_NOT_FOUND");
					expect(err.code).toEqual(404);
					expect(err.data).toEqual({ id: docs[0].id });
				}
			});

			it("should throw EntityNotFound error", async () => {
				expect.assertions(5);
				try {
					await broker.call("posts.resolve", {
						id: docs[0].id,
						mapping: true,
						throwIfNotExist: true
					});
				} catch (err) {
					expect(err).toBeInstanceOf(EntityNotFoundError);
					expect(err.message).toEqual("Entity not found");
					expect(err.type).toEqual("ENTITY_NOT_FOUND");
					expect(err.code).toEqual(404);
					expect(err.data).toEqual({ id: docs[0].id });
				}
			});

			it("should not throw EntityNotFound error", async () => {
				const res = (await broker.call("posts.resolve", { id: docs[0].id, mapping: true }))
					.data;
				expect(res).toEqual();
			});

			it("should return empty list", async () => {
				const res = await broker.call("posts.find");
				expect(res).toEqual([]);
			});

			it("should return empty list", async () => {
				const res = await broker.call("posts.list");

				expect(res).toEqual({
					rows: [],
					page: 1,
					pageSize: 10,
					total: 0,
					totalPages: 0
				});
			});
		});
	});

	describe("Test a secure ID flow", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "products",
			mixins: [DbService({ adapter: getAdapter({ collection: "products" }) })],
			settings: {
				fields: {
					id: { type: "string", secure: true, primaryKey: true, columnName: "_id" },
					name: { type: "string", trim: true, required: true }
				}
			},

			methods: {
				encodeID(id) {
					return "secured-" + id;
				},

				decodeID(id) {
					if (id.startsWith("secured-")) return id.slice(8);
				}
			},

			async started() {
				await svc.clearEntities();
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		let docs = [];

		it("should create a new entity", async () => {
			for (let i = 0; i < 10; i++) {
				const doc = await broker.call("products.create", {
					name: `Product ${i + 1}`
				});
				docs.push(doc);
				expect(doc.id.startsWith("secured-")).toBe(true);
			}
		});

		it("should get the newly created entity", async () => {
			const doc = await broker.call("products.get", { id: docs[5].id });
			expect(doc).toEqual(docs[5]);
		});

		it("should resolve the newly created entity", async () => {
			const doc = await broker.call("products.resolve", { id: docs[5].id });
			expect(doc).toEqual(docs[5]);
		});

		it("should find the newly created entity", async () => {
			const res = await broker.call("products.find");

			expect(res).toEqual(expect.arrayContaining(docs));
		});

		it("should list the newly created entity", async () => {
			const res = await broker.call("products.list");

			expect(res).toEqual({
				rows: expect.arrayContaining(docs),
				page: 1,
				pageSize: 10,
				total: 10,
				totalPages: 1
			});
		});

		it("should throw validation error", async () => {
			expect.assertions(5);
			try {
				await broker.call("products.create", {});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
				expect(err.message).toEqual("The 'name' field is required");
				expect(err.type).toEqual("REQUIRED_FIELD");
				expect(err.code).toEqual(422);
				expect(err.data).toEqual({ field: "name", value: undefined });
			}
		});

		it("should update entity", async () => {
			const doc = await broker.call("products.update", {
				id: docs[5].id,
				name: "Modified product"
			});
			docs[5] = doc;

			expect(doc).toEqual({
				id: expect.any(String),
				name: "Modified product"
			});
		});

		it("should get the modified entity", async () => {
			const doc = await broker.call("products.get", { id: docs[5].id });
			expect(doc).toEqual(docs[5]);
		});

		it("should resolve the modified entity", async () => {
			const doc = await broker.call("products.resolve", { id: docs[5].id, mapping: true });
			expect(doc).toEqual({
				[docs[5].id]: docs[5]
			});
		});

		it("should find the modified entity", async () => {
			const res = await broker.call("products.find");
			expect(res).toEqual(expect.arrayContaining(docs));
		});

		it("should remove entity", async () => {
			const res = await broker.call("products.remove", {
				id: docs[5].id
			});

			expect(res).toEqual(docs[5].id);
		});

		it("should throw EntityNotFound error", async () => {
			expect.assertions(5);
			try {
				await broker.call("products.get", { id: docs[5].id });
			} catch (err) {
				expect(err).toBeInstanceOf(EntityNotFoundError);
				expect(err.message).toEqual("Entity not found");
				expect(err.type).toEqual("ENTITY_NOT_FOUND");
				expect(err.code).toEqual(404);
				expect(err.data).toEqual({ id: docs[5].id });
			}
		});

		it("should throw EntityNotFound error", async () => {
			expect.assertions(5);
			try {
				await broker.call("products.resolve", {
					id: docs[5].id,
					mapping: true,
					throwIfNotExist: true
				});
			} catch (err) {
				expect(err).toBeInstanceOf(EntityNotFoundError);
				expect(err.message).toEqual("Entity not found");
				expect(err.type).toEqual("ENTITY_NOT_FOUND");
				expect(err.code).toEqual(404);
				expect(err.data).toEqual({ id: docs[5].id });
			}
		});
	});

	describe("Test pagination", () => {
		let docs = [];
		let emailOrderedDocs = [];
		let activeDocs = [];

		const broker = new ServiceBroker({ logger: false });
		broker.createService({
			name: "users",
			mixins: [DbService({ adapter: getAdapter({ collection: "users" }) })],
			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					firstName: { type: "string", trim: true, required: true },
					lastName: { type: "string", trim: true, required: true },
					fullName: {
						type: "string",
						readonly: true,
						get: (v, entity) => entity.firstName + " " + entity.lastName
					},
					userName: { type: "string", trim: true, required: true },
					email: { type: "string", trim: true, required: true },
					password: { type: "string", hidden: true },
					dob: { type: "string", trim: true, required: true },
					age: { type: "number", required: true },
					status: { type: "boolean", trim: true, default: true }
				}
			},

			methods: {},

			async started() {
				await this.clearEntities();
				const users = fakerator.times(fakerator.entity.user, 20);
				users.forEach(user => {
					user.age = fakerator.random.number(18, 90);
				});

				docs = await this.createEntities(null, users);

				emailOrderedDocs = Array.from(docs).sort((a, b) => a.email.localeCompare(b.email));

				activeDocs = emailOrderedDocs.filter(doc => doc.status);
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		it("should find all entities", async () => {
			const rows = await broker.call("users.find");
			expect(rows.length).toBe(20);
			expect(rows).toEqual(expect.arrayContaining(docs));

			expect(rows[0].password).toBeUndefined();
			expect(rows[0].fullName).toBe(rows[0].firstName + " " + rows[0].lastName);
		});

		it("should list first page 10", async () => {
			const rows = await broker.call("users.list", { sort: "email" });
			expect(rows).toEqual({
				rows: emailOrderedDocs.slice(0, 10),
				page: 1,
				pageSize: 10,
				total: 20,
				totalPages: 2
			});
		});

		it("should list the second page 5", async () => {
			const rows = await broker.call("users.list", {
				sort: "email",
				page: 2,
				pageSize: 5
			});
			expect(rows).toEqual({
				rows: emailOrderedDocs.slice(5, 10),
				page: 2,
				pageSize: 5,
				total: 20,
				totalPages: 4
			});
		});

		it("should list the second page 5 with descendent sort", async () => {
			const rows = await broker.call("users.list", {
				sort: "-email",
				page: 2,
				pageSize: 5
			});
			expect(rows).toEqual({
				rows: emailOrderedDocs.slice(10, 15).reverse(),
				page: 2,
				pageSize: 5,
				total: 20,
				totalPages: 4
			});
		});

		it("should list first page 5 with query", async () => {
			const rows = await broker.call("users.list", {
				sort: "email",
				pageSize: 5,
				query: { status: true }
			});
			expect(rows).toEqual({
				rows: activeDocs.slice(0, 5),
				page: 1,
				pageSize: 5,
				total: activeDocs.length,
				totalPages: Math.floor((activeDocs.length + 5 - 1) / 5)
			});
		});
	});

	if (["MongoDB"].indexOf(adapterType) !== -1) {
		describe("Test streaming", () => {
			let docs = [];

			const broker = new ServiceBroker({ logger: false });
			broker.createService({
				name: "users",
				mixins: [DbService({ adapter: getAdapter({ collection: "users" }) })],
				settings: {
					fields: {
						id: { type: "string", primaryKey: true, columnName: "_id" },
						firstName: { type: "string", trim: true, required: true },
						lastName: { type: "string", trim: true, required: true },
						fullName: {
							type: "string",
							readonly: true,
							get: (v, entity) => entity.firstName + " " + entity.lastName
						},
						userName: { type: "string", trim: true, required: true },
						email: { type: "string", trim: true, required: true },
						password: { type: "string", hidden: true },
						status: { type: "boolean", trim: true, default: true }
					}
				},

				actions: {
					findStream: {
						handler(ctx) {
							return this.streamEntities(ctx, ctx.params);
						}
					}
				},

				async started() {
					await this.clearEntities();
					const users = fakerator.times(fakerator.entity.user, 10);
					docs = await this.createEntities(null, users);
				}
			});

			beforeAll(() => broker.start());
			afterAll(() => broker.stop());

			it("should find all entities as stream", async () => {
				const rows = [];

				const res = await broker.call("users.findStream");

				expect.assertions(2);
				return new Promise((resolve, reject) => {
					expect(res).toBeInstanceOf(Stream);
					res.on("data", row => rows.push(row));

					res.on("error", reject);
					res.on("end", () => {
						expect(rows).toEqual(expect.arrayContaining(docs));
						resolve();
					});
				});
			});
		});
	}
};

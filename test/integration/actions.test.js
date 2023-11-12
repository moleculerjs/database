"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { ValidationError, ServiceNotFoundError } = require("moleculer").Errors;
const { EntityNotFoundError } = require("../../src/errors");
const Fakerator = require("fakerator");
const { Stream } = require("stream");
const DbService = require("../..").Service;

const fakerator = new Fakerator();

module.exports = (getAdapter, adapterType) => {
	const expectedID = expect.any(String);

	describe("Test a common flow", () => {
		const entityChanged = jest.fn();

		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "posts",
			mixins: [DbService({ adapter: getAdapter() })],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						get: adapterType == "Knex" ? ({ value }) => String(value) : undefined
					},
					title: { type: "string", trim: true, required: true },
					content: { type: "string" },
					author: { type: "string" },
					votes: { type: "number", default: 0, columnType: "integer" },
					status: {
						type: "boolean",
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					},
					createdAt: {
						type: "number",
						readonly: true,
						onCreate: Date.now,
						columnType: "bigInteger",
						columnName: "created_at",
						get: ({ value }) => (value != null ? Number(value) : value)
					},
					updatedAt: {
						type: "number",
						readonly: true,
						onUpdate: Date.now,
						columnType: "bigInteger",
						columnName: "updated_at",
						get: ({ value }) => (value != null ? Number(value) : value)
					}
				}
			},

			actions: {
				updateRaw(ctx) {
					return this.updateEntity(ctx, ctx.params, { raw: true });
				}
			},

			methods: {
				entityChanged
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
				entityChanged.mockClear();

				const doc = await broker.call("posts.create", {
					title: "First post",
					content: "Content of first post",
					author: "John Doe"
				});
				docs.push(doc);

				expect(doc).toEqual({
					id: expectedID,
					title: "First post",
					content: "Content of first post",
					author: "John Doe",
					votes: 0,
					status: true,
					createdAt: expect.any(Number),
					...(adapterType == "Knex" ? { updatedAt: null } : {})
				});

				expect(entityChanged).toBeCalledTimes(1);
				expect(entityChanged).toBeCalledWith("create", doc, null, expect.any(Context), {});
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
					expect(err.message).toBe("Parameters validation error!");
					expect(err.type).toBe("VALIDATION_ERROR");
					expect(err.code).toEqual(422);
					expect(err.data).toEqual([
						{
							actual: undefined,
							field: "title",
							message: "The 'title' field is required.",
							type: "required",
							action: "posts.create",
							nodeID: broker.nodeID
						}
					]);
				}
			});

			it("should create multiple entities", async () => {
				const res = await broker.call("posts.createMany", [
					{
						title: "Second post",
						content: "Content of second post",
						author: "John Doe"
					},
					{
						title: "Third post",
						content: "Content of third post",
						author: "Jane Doe"
					}
				]);
				expect(res.length).toBe(2);
				docs.push(...res);
			});

			// --- CREATE MANY ---
			it("should throw Validation error if one entity is wrong", async () => {
				expect.assertions(5);
				try {
					await broker.call("posts.createMany", [
						{ title: "New post with many" },
						{ content: "New post content with many" }
					]);
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.message).toBe("Parameters validation error!");
					expect(err.type).toBe("VALIDATION_ERROR");
					expect(err.code).toEqual(422);
					expect(err.data).toEqual([
						{
							actual: undefined,
							field: "[1].title",
							message: "The '[1].title' field is required.",
							type: "required",
							action: "posts.createMany",
							nodeID: broker.nodeID
						}
					]);
				}
			});
		});

		if (adapterType == "MongoDB" || adapterType == "NeDB") {
			describe("Update with modifiers", () => {
				it("should update entity", async () => {
					entityChanged.mockClear();

					const doc = await broker.call("posts.updateRaw", {
						id: docs[0].id,
						$set: {
							title: "Updated title",
							content: "Updated content of first title"
						},
						$inc: {
							votes: 1
						}
					});
					docs[0] = doc;

					expect(doc).toEqual({
						id: expectedID,
						title: "Updated title",
						content: "Updated content of first title",
						author: "John Doe",
						votes: 1,
						status: true,
						createdAt: expect.any(Number)
						// updatedAt: expect.any(Number)
					});

					expect(entityChanged).toBeCalledTimes(1);
					expect(entityChanged).toBeCalledWith(
						"update",
						doc,
						{
							id: expectedID,
							title: "First post",
							content: "Content of first post",
							author: "John Doe",
							votes: 0,
							status: true,
							createdAt: expect.any(Number)
						},
						expect.any(Context),
						{
							raw: true
						}
					);
				});

				it("should get the newly created entity", async () => {
					const doc = await broker.call("posts.get", { id: docs[0].id });
					expect(doc).toEqual(docs[0]);
				});

				it("should resolve the newly created entity", async () => {
					const doc = await broker.call("posts.resolve", {
						id: docs[0].id,
						mapping: true
					});
					expect(doc).toEqual({
						[docs[0].id]: docs[0]
					});
				});

				it("should find the newly created entity", async () => {
					const res = await broker.call("posts.find");

					expect(res).toEqual(expect.arrayContaining(docs));
				});
			});
		}

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
					id: expectedID,
					title: "Modified title",
					content: "Modified content of first title",
					author: "John Doe",
					votes: 3,
					status: false,
					createdAt: expect.any(Number),
					updatedAt: expect.any(Number)
				});

				expect(entityChanged).toBeCalledTimes(1);
				expect(entityChanged).toBeCalledWith(
					"update",
					doc,
					adapterType == "MongoDB" || adapterType == "NeDB"
						? {
								id: expectedID,
								author: "John Doe",
								content: "Updated content of first title",
								createdAt: expect.any(Number),
								status: true,
								title: "Updated title",
								votes: 1
						  }
						: {
								id: expectedID,
								author: "John Doe",
								content: "Content of first post",
								createdAt: expect.any(Number),
								updatedAt: null,
								status: true,
								title: "First post",
								votes: 0
						  },
					expect.any(Context),
					{}
				);
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

				expect(res).toEqual(expect.arrayContaining(docs));
			});

			it("should remove entity", async () => {
				entityChanged.mockClear();
				const res = await broker.call("posts.remove", {
					id: docs[0].id,
					title: "Unused removed title"
				});

				expect(res).toEqual(docs[0].id);

				expect(entityChanged).toBeCalledTimes(1);
				expect(entityChanged).toBeCalledWith("remove", docs[0], null, expect.any(Context), {
					softDelete: false
				});
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

			// TODO: removeMany

			it.skip("should return empty list", async () => {
				const res = await broker.call("posts.find");
				expect(res).toEqual([]);
			});

			it.skip("should return empty list", async () => {
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
			mixins: [
				DbService({
					adapter: getAdapter()
				})
			],
			settings: {
				fields: {
					key: {
						type: "string",
						secure: true,
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					},
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
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}

				await svc.clearEntities();
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		let docs = [];

		it("should create a new entity", async () => {
			expect.assertions(10);
			for (let i = 0; i < 10; i++) {
				const doc = await broker.call("products.create", {
					name: `Product ${i + 1}`
				});
				docs.push(doc);
				expect(doc.key.startsWith("secured-")).toBe(true);
			}
		});

		it("should get the newly created entity", async () => {
			const doc = await broker.call("products.get", { key: docs[5].key });
			expect(doc).toEqual(docs[5]);
		});

		it("should resolve the newly created entity", async () => {
			const doc = await broker.call("products.resolve", { key: docs[5].key });
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
				expect(err.message).toBe("Parameters validation error!");
				expect(err.type).toBe("VALIDATION_ERROR");
				expect(err.code).toEqual(422);
				expect(err.data).toEqual([
					{
						actual: undefined,
						field: "name",
						message: "The 'name' field is required.",
						type: "required",
						action: "products.create",
						nodeID: broker.nodeID
					}
				]);
			}
		});

		it("should update entity", async () => {
			const doc = await broker.call("products.update", {
				key: docs[5].key,
				name: "Modified product"
			});
			docs[5] = doc;

			expect(doc).toEqual({
				key: expect.any(String),
				name: "Modified product"
			});
		});

		it("should get the modified entity", async () => {
			const doc = await broker.call("products.get", { key: docs[5].key });
			expect(doc).toEqual(docs[5]);
		});

		it("should resolve the modified entity", async () => {
			const doc = await broker.call("products.resolve", { key: docs[5].key, mapping: true });
			expect(doc).toEqual({
				[docs[5].key]: docs[5]
			});
		});

		it("should find the modified entity", async () => {
			const res = await broker.call("products.find");
			expect(res).toEqual(expect.arrayContaining(docs));
		});

		it("should remove entity", async () => {
			const res = await broker.call("products.remove", {
				key: docs[5].key
			});

			expect(res).toEqual(docs[5].key);
		});

		it("should throw EntityNotFound error", async () => {
			expect.assertions(5);
			try {
				await broker.call("products.get", { key: docs[5].key });
			} catch (err) {
				expect(err).toBeInstanceOf(EntityNotFoundError);
				expect(err.message).toEqual("Entity not found");
				expect(err.type).toEqual("ENTITY_NOT_FOUND");
				expect(err.code).toEqual(404);
				expect(err.data).toEqual({ id: docs[5].key });
			}
		});

		it("should throw EntityNotFound error", async () => {
			expect.assertions(5);
			try {
				await broker.call("products.resolve", {
					key: docs[5].key,
					mapping: true,
					throwIfNotExist: true
				});
			} catch (err) {
				expect(err).toBeInstanceOf(EntityNotFoundError);
				expect(err.message).toEqual("Entity not found");
				expect(err.type).toEqual("ENTITY_NOT_FOUND");
				expect(err.code).toEqual(404);
				expect(err.data).toEqual({ id: docs[5].key });
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
			mixins: [DbService({ adapter: getAdapter() })],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					},
					firstName: { type: "string", trim: true, required: true },
					lastName: { type: "string", trim: true, required: true },
					fullName: {
						type: "string",
						virtual: true,
						get: ({ entity }) => entity.firstName + " " + entity.lastName
					},
					userName: { type: "string", trim: true, required: true },
					email: {
						type: "string",
						trim: true,
						required: true,
						columnName: "email_address"
					},
					password: { type: "string", hidden: true },
					dob: { type: "string", trim: true, required: true },
					age: { type: "number", required: true, columnType: "integer" },
					status: {
						type: "boolean",
						trim: true,
						default: true,
						get: adapterType == "Knex" ? ({ value }) => !!value : undefined
					}
				}
			},

			methods: {},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}

				await this.clearEntities();
				const users = fakerator.times(fakerator.entity.user, 20);
				users.forEach(user => {
					user.age = fakerator.random.number(18, 90);
					user.email = user.email.replace(/\./g, ""); // the dot in email adddress can cause different sorting
				});

				docs = await this.createEntities(null, users, { returnEntities: true });

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
				sort: ["-email"],
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

	describe("Test user-defined ID", () => {
		const broker = new ServiceBroker({ logger: false });
		broker.createService({
			name: "posts",
			mixins: [DbService({ adapter: getAdapter() })],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						generated: "user",
						columnName: "_id"
					},
					title: { type: "string", trim: true, required: true },
					content: { type: "string", trim: true }
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

		it("should create entity with custom ID", async () => {
			const row = await broker.call("posts.create", {
				id: "ID-001",
				title: "First post",
				content: "First content"
			});
			expect(row).toEqual({
				id: "ID-001",
				title: "First post",
				content: "First content"
			});
		});

		it("should get entity with custom ID", async () => {
			expect(await broker.call("posts.get", { id: "ID-001" })).toEqual({
				id: "ID-001",
				title: "First post",
				content: "First content"
			});

			expect(await broker.call("posts.resolve", { id: "ID-001" })).toEqual({
				id: "ID-001",
				title: "First post",
				content: "First content"
			});

			expect(await broker.call("posts.find")).toEqual([
				{
					id: "ID-001",
					title: "First post",
					content: "First content"
				}
			]);

			expect(await broker.call("posts.list")).toEqual({
				rows: [
					{
						id: "ID-001",
						title: "First post",
						content: "First content"
					}
				],
				total: 1,
				totalPages: 1,
				page: 1,
				pageSize: 10
			});
		});
	});

	if (["MongoDB"].indexOf(adapterType) !== -1) {
		describe("Test streaming", () => {
			let docs = [];

			const broker = new ServiceBroker({ logger: false });
			broker.createService({
				name: "users",
				mixins: [DbService({ adapter: getAdapter() })],
				settings: {
					fields: {
						id: { type: "string", primaryKey: true, columnName: "_id" },
						firstName: { type: "string", trim: true, required: true },
						lastName: { type: "string", trim: true, required: true },
						fullName: {
							type: "string",
							readonly: true,
							get: ({ entity }) => entity.firstName + " " + entity.lastName
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
					docs = await this.createEntities(null, users, { returnEntities: true });
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

	describe("Test caching with eventName", () => {
		const broker = new ServiceBroker({ logger: false, cacher: "Memory" });
		const svc = broker.createService({
			name: "posts",
			mixins: [DbService({ adapter: getAdapter() })],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					},
					title: { type: "string", trim: true, required: true },
					content: { type: "string", trim: true }
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}

				await this.clearEntities();

				jest.spyOn(broker, "broadcast");
				jest.spyOn(broker.cacher, "clean");
				jest.spyOn(svc, "resolveEntities");
				jest.spyOn(svc, "findEntities");
				jest.spyOn(svc, "countEntities");
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		let row;
		it("should create entity", async () => {
			broker.broadcast.mockClear();
			broker.cacher.clean.mockClear();

			row = await broker.call("posts.create", {
				title: "First post",
				content: "First content"
			});

			expect(broker.broadcast).toBeCalledTimes(2);
			expect(broker.broadcast).toBeCalledWith(
				"cache.clean.posts",
				{
					type: "create",
					data: row,
					opts: {}
				},
				{
					parentCtx: expect.any(Context)
				}
			);
			expect(broker.broadcast).toBeCalledWith(
				"posts.created",
				{
					type: "create",
					data: row,
					opts: {}
				},
				{ parentCtx: expect.any(Context) }
			);
		});

		it("should get the entity from the DB", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.get", { id: row.id });
			expect(res).toEqual(row);

			expect(svc.resolveEntities).toBeCalledTimes(1);
			expect(svc.resolveEntities).toBeCalledWith(
				expect.any(Context),
				{ id: "" + row.id },
				{ throwIfNotExist: true }
			);
		});

		it("should get the entity from the cache", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.get", { id: row.id });
			expect(res).toEqual(row);

			expect(svc.resolveEntities).toBeCalledTimes(0);
		});

		it("should resolve the entity from the DB", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.resolve", { id: row.id });
			expect(res).toEqual(row);

			expect(svc.resolveEntities).toBeCalledTimes(1);
			expect(svc.resolveEntities).toBeCalledWith(
				expect.any(Context),
				{ id: "" + row.id },
				{ throwIfNotExist: undefined }
			);
		});

		it("should resolve the entity from the cache", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.resolve", { id: row.id });
			expect(res).toEqual(row);

			expect(svc.resolveEntities).toBeCalledTimes(0);
		});

		it("should find entities from the DB", async () => {
			svc.findEntities.mockClear();

			const res = await broker.call("posts.find");
			expect(res).toEqual([row]);

			expect(svc.findEntities).toBeCalledTimes(1);
			expect(svc.findEntities).toBeCalledWith(expect.any(Context));
		});

		it("should find entities from the cache", async () => {
			svc.findEntities.mockClear();

			const res = await broker.call("posts.find");
			expect(res).toEqual([row]);

			expect(svc.findEntities).toBeCalledTimes(0);
		});

		it("should count entities from the DB", async () => {
			svc.countEntities.mockClear();

			const res = await broker.call("posts.count");
			expect(res).toEqual(1);

			expect(svc.countEntities).toBeCalledTimes(1);
			expect(svc.countEntities).toBeCalledWith(expect.any(Context));
		});

		it("should count entities from the cache", async () => {
			svc.countEntities.mockClear();

			const res = await broker.call("posts.count");
			expect(res).toEqual(1);

			expect(svc.countEntities).toBeCalledTimes(0);
		});

		it("should list entities from the DB", async () => {
			svc.findEntities.mockClear();
			svc.countEntities.mockClear();

			const res = await broker.call("posts.list");
			expect(res).toEqual({ page: 1, pageSize: 10, rows: [row], total: 1, totalPages: 1 });

			expect(svc.findEntities).toBeCalledTimes(1);
			expect(svc.findEntities).toBeCalledWith(expect.any(Context), {
				limit: 10,
				offset: 0,
				page: 1,
				pageSize: 10
			});

			expect(svc.countEntities).toBeCalledTimes(1);
			expect(svc.countEntities).toBeCalledWith(expect.any(Context), {
				limit: 10,
				offset: 0,
				page: 1,
				pageSize: 10
			});
		});

		it("should list entities from the cache", async () => {
			svc.findEntities.mockClear();
			svc.countEntities.mockClear();

			const res = await broker.call("posts.list");
			expect(res).toEqual({ page: 1, pageSize: 10, rows: [row], total: 1, totalPages: 1 });

			expect(svc.findEntities).toBeCalledTimes(0);
			expect(svc.countEntities).toBeCalledTimes(0);
		});

		it("should clear cache after update", async () => {
			broker.broadcast.mockClear();
			broker.cacher.clean.mockClear();

			row = await broker.call("posts.update", {
				id: row.id,
				title: "Update post"
			});

			expect(broker.broadcast).toBeCalledTimes(2);
			expect(broker.broadcast).toBeCalledWith(
				"cache.clean.posts",
				{
					type: "update",
					data: row,
					opts: {}
				},
				{
					parentCtx: expect.any(Context)
				}
			);
			expect(broker.broadcast).toBeCalledWith(
				"posts.updated",
				{
					type: "update",
					data: row,
					opts: {}
				},
				{ parentCtx: expect.any(Context) }
			);
		});

		it("should get the entity from the DB (again)", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.get", { id: row.id });
			expect(res).toEqual(row);

			expect(svc.resolveEntities).toBeCalledTimes(1);
			expect(svc.resolveEntities).toBeCalledWith(
				expect.any(Context),
				{ id: "" + row.id },
				{ throwIfNotExist: true }
			);
		});

		it("should get the entity from the cache (again)", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.get", { id: row.id });
			expect(res).toEqual(row);

			expect(svc.resolveEntities).toBeCalledTimes(0);
		});
	});

	describe("Test caching without eventName", () => {
		const broker = new ServiceBroker({ logger: false, cacher: "Memory" });
		const svc = broker.createService({
			name: "posts",
			mixins: [
				DbService({
					adapter: getAdapter(),
					cache: {
						// In this case no cache cleaner event broadcasting
						eventType: false
					}
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
					title: { type: "string", trim: true, required: true },
					content: { type: "string", trim: true }
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}

				await this.clearEntities();

				jest.spyOn(broker, "broadcast");
				jest.spyOn(broker.cacher, "clean");
				jest.spyOn(svc, "resolveEntities");
				jest.spyOn(svc, "findEntities");
				jest.spyOn(svc, "countEntities");
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		let row;
		it("should create entity", async () => {
			broker.broadcast.mockClear();
			broker.cacher.clean.mockClear();

			row = await broker.call("posts.create", {
				title: "First post",
				content: "First content"
			});

			expect(broker.broadcast).toBeCalledTimes(1);
			expect(broker.broadcast).toBeCalledWith(
				"posts.created",
				{
					type: "create",
					data: row,
					opts: {}
				},
				{ parentCtx: expect.any(Context) }
			);
		});

		it("should get the entity from the DB", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.get", { id: row.id });
			expect(res).toEqual(row);

			expect(svc.resolveEntities).toBeCalledTimes(1);
			expect(svc.resolveEntities).toBeCalledWith(
				expect.any(Context),
				{ id: "" + row.id },
				{ throwIfNotExist: true }
			);
		});

		it("should get the entity from the cache", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.get", { id: row.id });
			expect(res).toEqual(row);

			expect(svc.resolveEntities).toBeCalledTimes(0);
		});

		it("should not clear cache after update", async () => {
			broker.broadcast.mockClear();
			broker.cacher.clean.mockClear();

			row = await broker.call("posts.update", {
				id: row.id,
				title: "Update post"
			});

			expect(broker.broadcast).toBeCalledTimes(1);
			expect(broker.broadcast).toBeCalledWith(
				"posts.updated",
				{
					type: "update",
					data: row,
					opts: {}
				},
				{ parentCtx: expect.any(Context) }
			);
		});

		it("should get the old entity from the cache (again)", async () => {
			svc.resolveEntities.mockClear();

			const res = await broker.call("posts.get", { id: row.id });
			expect(res).toEqual({
				id: row.id,
				title: "First post",
				content: "First content"
			});

			expect(svc.resolveEntities).toBeCalledTimes(0);
		});
	});

	describe("Test caching with dependencies", () => {
		const broker = new ServiceBroker({ logger: false, cacher: "Memory" });
		const svc = broker.createService({
			name: "posts",
			mixins: [
				DbService({
					adapter: getAdapter()
				})
			],
			dependencies: ["users", { name: "comments" }],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					},
					title: { type: "string", trim: true, required: true },
					content: { type: "string", trim: true }
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}

				await this.clearEntities();

				jest.spyOn(broker, "broadcast");
				jest.spyOn(broker.cacher, "clean");
			}
		});

		broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter()
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					}
				}
			},
			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}
			}
		});

		broker.createService({
			name: "comments",
			mixins: [
				DbService({
					adapter: getAdapter()
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					}
				}
			},
			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		it("should clear posts cached entities if user created", async () => {
			broker.broadcast.mockClear();
			broker.cacher.clean.mockClear();

			const row = await broker.call("users.create", { name: "John Doe" });

			expect(broker.broadcast).toBeCalledTimes(2);
			expect(broker.broadcast).toBeCalledWith(
				"cache.clean.users",
				{
					type: "create",
					data: row,
					opts: {}
				},
				{
					parentCtx: expect.any(Context)
				}
			);
			expect(broker.cacher.clean).toBeCalledTimes(2);
			expect(broker.cacher.clean).toBeCalledWith("users.**");
			expect(broker.cacher.clean).toBeCalledWith("posts.**");
		});

		it("should clear posts cached entities if comment created", async () => {
			broker.broadcast.mockClear();
			broker.cacher.clean.mockClear();

			const row = await broker.call("comments.create", { title: "New comment" });

			expect(broker.broadcast).toBeCalledTimes(2);
			expect(broker.broadcast).toBeCalledWith(
				"cache.clean.comments",
				{
					type: "create",
					data: row,
					opts: {}
				},
				{
					parentCtx: expect.any(Context)
				}
			);
			expect(broker.cacher.clean).toBeCalledTimes(2);
			expect(broker.cacher.clean).toBeCalledWith("comments.**");
			expect(broker.cacher.clean).toBeCalledWith("posts.**");
		});
	});

	describe("Test caching with additional events", () => {
		const broker = new ServiceBroker({
			logger: false,
			cacher: "Memory",
			metrics: { enabled: true },
			tracing: { enabled: true }
		});
		const svc = broker.createService({
			name: "posts",
			mixins: [
				DbService({
					adapter: getAdapter(),
					cache: {
						cacheCleanOnDeps: ["something.created"]
					}
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
					title: { type: "string", trim: true, required: true },
					content: { type: "string", trim: true }
				}
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}

				await this.clearEntities();

				jest.spyOn(broker.cacher, "clean");
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		it("should clear posts cached entities if 'something.created' fired", async () => {
			broker.cacher.clean.mockClear();

			await broker.broadcast("something.created", { name: "John Doe" });

			expect(broker.cacher.clean).toBeCalledTimes(1);
			expect(broker.cacher.clean).toBeCalledWith("posts.**");
		});
	});

	describe("Test action disabling", () => {
		const broker = new ServiceBroker({
			logger: false
		});
		const svc = broker.createService({
			name: "posts",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: {
						find: false,
						count: false,
						list: false,
						get: false,
						resolve: false,
						create: false,
						createMany: false,
						update: false,
						replace: false,
						remove: false
					}
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
					title: { type: "string", trim: true, required: true },
					content: { type: "string", trim: true }
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

		it("should throw service not found error", async () => {
			await expect(broker.call("posts.find", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.count", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.list", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.get", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.resolve", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.create", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.createMany", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.update", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.replace", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.remove", {})).rejects.toThrow(ServiceNotFoundError);
		});
	});

	describe("Test all action disabling", () => {
		const broker = new ServiceBroker({
			logger: false
		});
		const svc = broker.createService({
			name: "posts",
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
					title: { type: "string", trim: true, required: true },
					content: { type: "string", trim: true }
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

		it("should throw service not found error", async () => {
			await expect(broker.call("posts.find", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.count", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.list", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.get", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.resolve", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.create", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.createMany", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.update", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.replace", {})).rejects.toThrow(ServiceNotFoundError);
			await expect(broker.call("posts.remove", {})).rejects.toThrow(ServiceNotFoundError);
		});
	});
};

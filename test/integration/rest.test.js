"use strict";

const { ServiceBroker } = require("moleculer");
const ApiGateway = require("moleculer-web");
const axios = require("axios");
const DbService = require("../..").Service;

module.exports = (getAdapter, adapterType) => {
	describe("Test REST API with populates", () => {
		const env = createEnvironment(getAdapter, adapterType);
		const docs = [];

		beforeAll(() => env.start());
		afterAll(() => env.stop());

		describe("Common flow", () => {
			it("should return empty array", async () => {
				const res = await axios.get(`${env.baseURL}/posts`);
				const data = res.data;

				expect(data).toEqual({
					rows: [],
					page: 1,
					pageSize: 10,
					total: 0,
					totalPages: 0
				});
			});

			it("should throw validation error", async () => {
				expect.assertions(5);
				try {
					await axios.post(`${env.baseURL}/posts`, { votes: 3 });
				} catch (error) {
					const err = error.response.data;
					expect(err.name).toBe("ValidationError");
					expect(err.message).toEqual("Parameters validation error!");
					expect(err.type).toEqual("VALIDATION_ERROR");
					expect(err.code).toEqual(422);
					expect(err.data).toEqual([
						{
							field: "title",
							message: "The 'title' field is required.",
							type: "required",
							action: "posts.create",
							nodeID: env.brokers[0].nodeID
						}
					]);
				}
			});

			it("should create posts", async () => {
				const doc = (
					await axios.post(`${env.baseURL}/posts`, {
						title: "First post",
						content: "Content of first post",
						author: env.authors.johnDoe.id
					})
				).data;
				docs.push(doc);

				expect(doc).toEqual({
					id: expect.any(String),
					title: "First post",
					content: "Content of first post",
					author: {
						name: "John Doe",
						age: 42
					},
					votes: 0,
					status: true,
					createdAt: expect.any(Number),
					...(adapterType == "Knex" ? { updatedAt: null } : {})
				});

				docs.push(
					(
						await axios.post(`${env.baseURL}/posts`, {
							title: "Second post",
							content: "Content of second post",
							author: env.authors.janeDoe.id,
							status: false
						})
					).data
				);

				docs.push(
					(
						await axios.post(`${env.baseURL}/posts`, {
							title: "Third post",
							content: "Content of third post",
							author: env.authors.bobSmith.id,
							votes: 3
						})
					).data
				);

				// Can't resolve the author because it's inactive
				expect(docs[2]).toEqual({
					id: expect.any(String),
					title: "Third post",
					content: "Content of third post",
					author: env.authors.bobSmith.id,
					votes: 3,
					status: true,
					createdAt: expect.any(Number),
					...(adapterType == "Knex" ? { updatedAt: null } : {})
				});
			});

			it("should return all docs (list)", async () => {
				const data = (await axios.get(`${env.baseURL}/posts`)).data;
				expect(data).toEqual({
					rows: expect.arrayContaining(docs),
					page: 1,
					pageSize: 10,
					total: 3,
					totalPages: 1
				});
			});

			it("should return all docs (find)", async () => {
				const data = (await axios.get(`${env.baseURL}/posts/all`)).data;
				expect(data).toEqual(expect.arrayContaining(docs));
			});

			it("should return a doc (GET)", async () => {
				const data = (await axios.get(`${env.baseURL}/posts/${docs[0].id}`)).data;
				expect(data).toEqual(docs[0]);
			});

			it("should update entity", async () => {
				const doc = (
					await axios.patch(`${env.baseURL}/posts/${docs[1].id}`, {
						title: "Modified post"
					})
				).data;
				docs[1] = doc;

				expect(doc).toEqual({
					id: expect.any(String),
					title: "Modified post",
					content: "Content of second post",
					author: {
						name: "Jane Doe",
						age: 35
					},
					votes: 0,
					status: false,
					createdAt: expect.any(Number),
					updatedAt: expect.any(Number)
				});
			});

			it("should return the modified doc (GET)", async () => {
				const data = (await axios.get(`${env.baseURL}/posts/${docs[1].id}`)).data;
				expect(data).toEqual(docs[1]);
			});

			it("should remove a doc (DELETE)", async () => {
				const data = (await axios.delete(`${env.baseURL}/posts/${docs[1].id}`)).data;
				expect(data).toEqual(docs[1].id);
			});

			it("should throw error while getting the removed doc", async () => {
				expect.assertions(6);
				try {
					await axios.get(`${env.baseURL}/posts/${docs[1].id}`);
				} catch (error) {
					const err = error.response.data;
					expect(error.response.status).toBe(404);
					expect(err.name).toBe("EntityNotFoundError");
					expect(err.message).toEqual("Entity not found");
					expect(err.type).toEqual("ENTITY_NOT_FOUND");
					expect(err.code).toEqual(404);
					expect(err.data).toEqual({ id: docs[1].id });
				}
			});

			it("should return all docs (list)", async () => {
				const data = (await axios.get(`${env.baseURL}/posts`)).data;
				expect(data).toEqual({
					rows: expect.arrayContaining([docs[0], docs[2]]),
					page: 1,
					pageSize: 10,
					total: 2,
					totalPages: 1
				});
			});
		});

		describe("Authors with scopes & softDelete", () => {
			it("should return all authors (list)", async () => {
				const data = (await axios.get(`${env.baseURL}/authors`)).data;
				expect(data).toEqual({
					rows: expect.arrayContaining(Object.values(env.authors)),
					page: 1,
					pageSize: 10,
					total: 4,
					totalPages: 1
				});
			});

			it("should return with postCount populate values", async () => {
				const data = (
					await axios.get(
						`${env.baseURL}/authors?fields=name,postCount&populate=postCount&sort=name`
					)
				).data;
				expect(data).toEqual({
					rows: [
						{ name: "Bob Smith", postCount: 1 },
						{ name: "Jane Doe", postCount: 0 },
						{ name: "John Doe", postCount: 1 },
						{ name: "Kevin James", postCount: 0 }
					],
					page: 1,
					pageSize: 10,
					total: 4,
					totalPages: 1
				});
			});

			it("should return only active authors", async () => {
				const data = (await axios.get(`${env.baseURL}/authors?scope=onlyActive`)).data;
				expect(data).toEqual({
					rows: expect.arrayContaining([
						env.authors.johnDoe,
						env.authors.janeDoe,
						env.authors.kevinJames
					]),
					page: 1,
					pageSize: 10,
					total: 3,
					totalPages: 1
				});
			});

			it("should soft remove an author (DELETE)", async () => {
				const data = (
					await axios.delete(`${env.baseURL}/authors/${env.authors.kevinJames.id}`)
				).data;
				expect(data).toEqual(env.authors.kevinJames.id);
			});

			it("should return not deleted authors", async () => {
				const data = (await axios.get(`${env.baseURL}/authors`)).data;
				expect(data).toEqual({
					rows: expect.arrayContaining([
						env.authors.johnDoe,
						env.authors.janeDoe,
						env.authors.bobSmith
					]),
					page: 1,
					pageSize: 10,
					total: 3,
					totalPages: 1
				});
			});

			it("should return all (including deleted) authors (list)", async () => {
				const data = (await axios.get(`${env.baseURL}/authors?scope=false`)).data;
				expect(data).toEqual({
					rows: expect.arrayContaining([
						env.authors.johnDoe,
						env.authors.janeDoe,
						env.authors.bobSmith,
						Object.assign({}, env.authors.kevinJames, { deletedAt: expect.any(Number) })
					]),
					page: 1,
					pageSize: 10,
					total: 4,
					totalPages: 1
				});
			});

			it("should return only active & not deleted authors", async () => {
				const data = (await axios.get(`${env.baseURL}/authors?scope=onlyActive,notDeleted`))
					.data;
				expect(data).toEqual({
					rows: expect.arrayContaining([env.authors.johnDoe, env.authors.janeDoe]),
					page: 1,
					pageSize: 10,
					total: 2,
					totalPages: 1
				});
			});

			it("should throw error accessing deleted author", async () => {
				expect.assertions(6);
				try {
					await axios.get(`${env.baseURL}/authors/${env.authors.kevinJames.id}`);
				} catch (error) {
					const err = error.response.data;
					expect(error.response.status).toBe(404);
					expect(err.name).toBe("EntityNotFoundError");
					expect(err.message).toEqual("Entity not found");
					expect(err.type).toEqual("ENTITY_NOT_FOUND");
					expect(err.code).toEqual(404);
					expect(err.data).toEqual({ id: env.authors.kevinJames.id });
				}
			});
		});
	});

	/*if (["MongoDB"].indexOf(adapterType) !== -1) {
		describe("Test REST API with streams", () => {
			const env = createEnvironment(getAdapter, adapterType);
			let docs = [];

			beforeAll(() => env.start());
			afterAll(() => env.stop());

			it("should return empty array", async () => {
				const res = await axios.get(`${env.baseURL}/posts`);
				const data = res.data;

				expect(data).toEqual({
					rows: [],
					page: 1,
					pageSize: 10,
					total: 0,
					totalPages: 0
				});
			});

			it("should seed table", async () => {
				const posts = fakerator.times(fakerator.entity.post, 10);

				docs = await Promise.all(
					posts.map(async post => (await axios.post(`${env.baseURL}/posts`, post)).data)
				);
			});

			it("should return rows as stream", async () => {
				const res = await axios.get(`${env.baseURL}/posts/stream`, {
					responseType: "stream"
				});

				expect.assertions(1);
				const rows = [];
				await new Promise((resolve, reject) => {
					const stream = new Readable();
					stream.on("data", row => rows.push(row));
					stream.on("error", reject);
					stream.on("end", resolve);

					res.data.pipe(stream);
				});

				expect(rows).toEqual(expect.arrayContaining(docs));
			});
		});
	}*/

	describe("Test REST API with secure ID and 'key' ID field", () => {
		const env = createEnvironment(getAdapter, adapterType, {
			fields: {
				key: { type: "string", primaryKey: true, secure: true, columnName: "_id" },
				title: { type: "string", trim: true, required: true },
				content: { type: "string" }
			},
			methods: {
				encodeID(id) {
					return "secured-" + id;
				},

				decodeID(id) {
					if (id.startsWith("secured-")) return id.slice(8);
				}
			}
		});
		const docs = [];

		beforeAll(() => env.start());
		afterAll(() => env.stop());

		it("should return empty array", async () => {
			const res = await axios.get(`${env.baseURL}/posts`);
			const data = res.data;

			expect(data).toEqual({
				rows: [],
				page: 1,
				pageSize: 10,
				total: 0,
				totalPages: 0
			});
		});

		it("should create posts", async () => {
			const doc = (
				await axios.post(`${env.baseURL}/posts`, {
					title: "First post",
					content: "Content of first post"
				})
			).data;
			docs.push(doc);

			expect(doc).toEqual({
				key: expect.any(String),
				title: "First post",
				content: "Content of first post"
			});
			expect(doc.key.startsWith("secured-")).toBe(true);
		});

		it("should return all docs (list)", async () => {
			const data = (await axios.get(`${env.baseURL}/posts`)).data;
			expect(data).toEqual({
				rows: expect.arrayContaining(docs),
				page: 1,
				pageSize: 10,
				total: 1,
				totalPages: 1
			});
		});

		it("should return all docs (find)", async () => {
			const data = (await axios.get(`${env.baseURL}/posts/all`)).data;
			expect(data).toEqual(expect.arrayContaining(docs));
		});

		it("should return a doc (GET)", async () => {
			const data = (await axios.get(`${env.baseURL}/posts/${docs[0].key}`)).data;
			expect(data).toEqual(docs[0]);
		});

		it("should update entity", async () => {
			const doc = (
				await axios.patch(`${env.baseURL}/posts/${docs[0].key}`, {
					title: "Modified post"
				})
			).data;

			expect(doc).toEqual({
				key: docs[0].key,
				title: "Modified post",
				content: "Content of first post"
			});

			docs[0] = doc;
		});

		it("should return the modified doc (GET)", async () => {
			const data = (await axios.get(`${env.baseURL}/posts/${docs[0].key}`)).data;
			expect(data).toEqual(docs[0]);
		});

		it("should replace entity", async () => {
			const doc = (
				await axios.put(`${env.baseURL}/posts/${docs[0].key}`, {
					title: "Replaced post",
					content: "Replaced content"
				})
			).data;

			expect(doc).toEqual({
				key: docs[0].key,
				title: "Replaced post",
				content: "Replaced content"
			});

			docs[0] = doc;
		});

		it("should return the modified doc (GET)", async () => {
			const data = (await axios.get(`${env.baseURL}/posts/${docs[0].key}`)).data;
			expect(data).toEqual(docs[0]);
		});

		it("should remove a doc (DELETE)", async () => {
			const data = (await axios.delete(`${env.baseURL}/posts/${docs[0].key}`)).data;
			expect(data).toEqual(docs[0].key);
		});
	});
};

function createEnvironment(getAdapter, adapterType, opts = {}) {
	const env = {
		brokers: [],
		port: null,
		baseURL: null,
		authors: {}
	};

	// --- BROKER FOR API GATEWAY
	const apiBroker = new ServiceBroker({
		nodeID: "api-gw",
		transporter: "Fake",
		logger: false
	});

	apiBroker.createService({
		name: "api",
		mixins: [ApiGateway],
		settings: {
			port: 0,
			routes: [
				{
					path: "/api",
					autoAliases: true,
					mappingPolicy: "restrict"
				}
			]
		},

		dependencies: ["posts", "authors"],

		started() {
			const addr = this.server.address();
			env.port = addr.port;
			env.baseURL = `http://127.0.0.1:${env.port}/api`;
		}
	});
	env.brokers.push(apiBroker);

	// --- BROKER FOR POSTS SERVICE
	const postBroker = new ServiceBroker({
		nodeID: "broker-1",
		transporter: "Fake",
		logger: false
	});

	postBroker.createService({
		name: "posts",
		mixins: [DbService({ adapter: getAdapter() })],
		settings: {
			fields: opts.fields
				? opts.fields
				: {
						id: {
							type: "string",
							primaryKey: true,
							columnName: "_id",
							columnType: "integer",
							get: adapterType == "Knex" ? ({ value }) => String(value) : undefined
						},
						title: { type: "string", trim: true, required: true },
						content: { type: "string" },
						author: {
							type: "string",
							populate: {
								action: "authors.resolve",
								params: {
									fields: ["name", "age"],
									scope: "onlyActive"
								}
							}
						},
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
							get: ({ value }) => (value != null ? Number(value) : value)
						},
						updatedAt: {
							type: "number",
							readonly: true,
							onUpdate: Date.now,
							columnType: "bigInteger",
							get: ({ value }) => (value != null ? Number(value) : value)
						}
				  },

			defaultPopulates: ["author"]
		},

		actions: {
			findStream: {
				rest: "/stream",
				handler(ctx) {
					return this.streamEntities(ctx, ctx.params);
				}
			}
		},

		methods: {
			...(opts.methods || {})
		},

		async started() {
			const adapter = await this.getAdapter();

			if (adapterType == "Knex") {
				await adapter.createTable();
			}

			await this.clearEntities();
		}
	});
	env.brokers.push(postBroker);

	// --- BROKER FOR AUTHORS SERVICE
	const authorBroker = new ServiceBroker({
		nodeID: "broker-2",
		transporter: "Fake",
		logger: false
	});

	authorBroker.createService({
		name: "authors",
		mixins: [DbService({ adapter: getAdapter() })],
		settings: {
			fields: {
				id: {
					type: "string",
					primaryKey: true,
					columnName: "_id",
					columnType: "integer",
					get: adapterType == "Knex" ? ({ value }) => String(value) : undefined
				},
				name: { type: "string", trim: true, required: true },
				age: { type: "number", columnType: "integer", columnName: "ages" },
				status: {
					type: "boolean",
					default: true,
					get: adapterType == "Knex" ? ({ value }) => !!value : undefined
				},
				postCount: {
					type: "number",
					readonly: true,
					virtual: true,
					populate(ctx, values, docs) {
						return Promise.all(
							docs.map(doc => ctx.call("posts.count", { query: { author: doc._id } }))
						);
					}
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
				},
				deletedAt: {
					type: "number",
					readonly: true,
					onRemove: Date.now,
					columnType: "bigInteger",
					columnName: "deleted_at",
					get: ({ value }) => (value != null ? Number(value) : value)
				}
			},

			scopes: {
				notDeleted: { deletedAt: { $exists: false } },
				onlyActive: async q => {
					q.status = true;
					return q;
				}
			},
			defaultScopes: ["notDeleted"]
		},

		methods: {},

		async started() {
			const adapter = await this.getAdapter();

			if (adapterType == "Knex") {
				await adapter.createTable();
			}

			await this.clearEntities();

			env.authors.johnDoe = await this.createEntity(null, {
				name: "John Doe",
				age: 42,
				status: true
			});
			env.authors.janeDoe = await this.createEntity(null, {
				name: "Jane Doe",
				age: 35,
				status: true
			});
			env.authors.bobSmith = await this.createEntity(null, {
				name: "Bob Smith",
				age: 58,
				status: false
			});
			env.authors.kevinJames = await this.createEntity(null, {
				name: "Kevin James",
				age: 48,
				status: true
			});
		}
	});
	env.brokers.push(authorBroker);

	env.start = () => apiBroker.Promise.all(env.brokers.map(broker => broker.start())).delay(1000);
	env.stop = () => Promise.all(env.brokers.map(broker => broker.stop()));

	return env;
}

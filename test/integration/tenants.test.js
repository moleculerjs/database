"use strict";

const _ = require("lodash");
const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

module.exports = (getAdapter, adapterType) => {
	const tenant0Meta = { meta: { tenantId: 1000 } };
	const tenant1Meta = { meta: { tenantId: 1001 } };
	const tenant2Meta = { meta: { tenantId: 1002 } };
	const tenant3Meta = { meta: { tenantId: 1003 } };

	const baseServiceSchema = {
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
				title: { type: "string", required: true, min: 5 },
				content: { type: "string", required: true }
			}
		},

		actions: {
			stream: {
				handler(ctx) {
					return this.streamEntities(ctx, ctx.params);
				}
			},
			clear: {
				handler(ctx) {
					return this.clearEntities(ctx, ctx.params);
				}
			}
		}
	};

	function runTenantTestcases(broker, svc, tenantStrategy) {
		const posts = {};

		describe("Set up", () => {
			it("should clear all entities", async () => {
				const ctx = Context.create(broker, null, {});

				ctx.meta = tenant1Meta.meta;
				await svc.clearEntities(ctx);

				let rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);
				let count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});

			it("Set up posts entities", async () => {
				posts.post1 = await broker.call(
					"posts.create",
					{
						id: "post-1",
						title: "Post #1",
						content: "Content of post #1"
					},
					tenant1Meta
				);
				posts.post2 = await broker.call(
					"posts.create",
					{
						id: "post-2",
						title: "Post #2",
						content: "Content of post #2"
					},
					tenant3Meta
				);
				posts.post3 = await broker.call(
					"posts.create",
					{
						id: "post-3",
						title: "Post #3",
						content: "Content of post #3"
					},
					tenant1Meta
				);
				posts.post4 = await broker.call(
					"posts.create",
					{
						id: "post-4",
						title: "Post #4",
						content: "Content of post #4"
					},
					tenant2Meta
				);
				posts.post5 = await broker.call(
					"posts.create",
					{
						id: "post-5",
						title: "Post #5",
						content: "Content of post #5"
					},
					tenant2Meta
				);
				posts.post6 = await broker.call(
					"posts.create",
					{
						id: "post-6",
						title: "Post #6",
						content: "Content of post #6"
					},
					tenant1Meta
				);
			});

			if (tenantStrategy == "record") {
				it("should throw error if tenantId is missing", async () => {
					expect.assertions(4);
					try {
						await broker.call("posts.create", {
							id: "post-7",
							title: "Post #7",
							content: "Content of post #7"
						});
					} catch (err) {
						expect(err.name).toBe("ValidationError");
						expect(err.message).toBe("Parameters validation error!");
						expect(err.code).toBe(422);
						expect(err.data).toEqual([
							{
								actual: undefined,
								field: "tenantId",
								message: "The 'tenantId' field is required.",
								type: "required"
							}
						]);
					}
				});
			} else {
				it("should throw error if tenantId is missing", async () => {
					expect.assertions(1);
					try {
						await broker.call("posts.create", {
							id: "post-7",
							title: "Post #7",
							content: "Content of post #7"
						});
					} catch (err) {
						expect(err.message).toBe("Missing tenantId!");
					}
				});
			}
		});

		describe("Count posts by", () => {
			it("tenant #1", async () => {
				const res = await broker.call("posts.count", null, tenant1Meta);
				expect(res).toBe(3);
			});

			it("tenant #2", async () => {
				const res = await broker.call("posts.count", null, tenant2Meta);
				expect(res).toBe(2);
			});

			it("tenant #3", async () => {
				const res = await broker.call("posts.count", null, tenant3Meta);
				expect(res).toBe(1);
			});

			it("tenant #0", async () => {
				const res = await broker.call("posts.count", null, tenant0Meta);
				expect(res).toBe(0);
			});

			it("should throw error if tenantId is missing", async () => {
				await expect(broker.call("posts.count")).rejects.toThrow("Missing tenantId!");
			});
		});

		describe("Find all posts by", () => {
			it("tenant #1", async () => {
				const res = await broker.call("posts.find", null, tenant1Meta);
				expect(res.length).toBe(3);
				expect(res).toEqual(
					expect.arrayContaining([posts.post1, posts.post3, posts.post6])
				);
			});

			it("tenant #2", async () => {
				const res = await broker.call("posts.find", null, tenant2Meta);
				expect(res.length).toBe(2);
				expect(res).toEqual(expect.arrayContaining([posts.post4, posts.post5]));
			});

			it("tenant #3", async () => {
				const res = await broker.call("posts.find", null, tenant3Meta);
				expect(res.length).toBe(1);
				expect(res).toEqual([posts.post2]);
			});

			it("tenant #0", async () => {
				const res = await broker.call("posts.find", null, tenant0Meta);
				expect(res.length).toBe(0);
			});

			it("should throw error if tenantId is missing", async () => {
				await expect(broker.call("posts.find")).rejects.toThrow("Missing tenantId!");
			});
		});

		describe("List posts by", () => {
			it("tenant #1", async () => {
				const res = await broker.call("posts.list", null, tenant1Meta);
				expect(res.total).toBe(3);
				expect(res.rows).toEqual(
					expect.arrayContaining([posts.post1, posts.post3, posts.post6])
				);
			});

			it("tenant #2", async () => {
				const res = await broker.call("posts.list", null, tenant2Meta);
				expect(res.total).toBe(2);
				expect(res.rows).toEqual(expect.arrayContaining([posts.post4, posts.post5]));
			});

			it("tenant #3", async () => {
				const res = await broker.call("posts.list", null, tenant3Meta);
				expect(res.total).toBe(1);
				expect(res.rows).toEqual([posts.post2]);
			});

			it("tenant #0", async () => {
				const res = await broker.call("posts.list", null, tenant0Meta);
				expect(res.total).toBe(0);
			});

			it("should throw error if tenantId is missing", async () => {
				await expect(broker.call("posts.list")).rejects.toThrow("Missing tenantId!");
			});
		});

		if (["MongoDB"].indexOf(adapterType) !== -1) {
			describe("Stream all posts by", () => {
				it("tenant #1", async () => {
					const rows = [];
					const res = await broker.call("posts.stream", null, tenant1Meta);
					expect.assertions(2);
					return new Promise((resolve, reject) => {
						res.on("data", row => rows.push(row));

						res.on("error", reject);
						res.on("end", () => {
							expect(rows.length).toBe(3);
							expect(rows).toEqual(
								expect.arrayContaining([posts.post1, posts.post3, posts.post6])
							);
							resolve();
						});
					});
				});

				it("tenant #1", async () => {
					const rows = [];
					const res = await broker.call("posts.stream", null, tenant2Meta);
					expect.assertions(2);
					return new Promise((resolve, reject) => {
						res.on("data", row => rows.push(row));

						res.on("error", reject);
						res.on("end", () => {
							expect(rows.length).toBe(2);
							expect(rows).toEqual(
								expect.arrayContaining([posts.post4, posts.post5])
							);
							resolve();
						});
					});
				});

				it("tenant #3", async () => {
					const rows = [];
					const res = await broker.call("posts.stream", null, tenant3Meta);
					expect.assertions(2);
					return new Promise((resolve, reject) => {
						res.on("data", row => rows.push(row));

						res.on("error", reject);
						res.on("end", () => {
							expect(rows.length).toBe(1);
							expect(rows).toEqual(expect.arrayContaining([posts.post2]));
							resolve();
						});
					});
				});

				it("tenant #0", async () => {
					const rows = [];
					const res = await broker.call("posts.stream", null, tenant0Meta);
					expect.assertions(1);
					return new Promise((resolve, reject) => {
						res.on("data", row => rows.push(row));

						res.on("error", reject);
						res.on("end", () => {
							expect(rows.length).toBe(0);
							resolve();
						});
					});
				});

				it("should throw error if tenantId is missing", async () => {
					await expect(broker.call("posts.stream")).rejects.toThrow("Missing tenantId!");
				});
			});
		}

		describe("Get post by", () => {
			const getPosts = async function (tenantMeta) {
				return Promise.all(
					Object.values(posts).map(post =>
						broker.call("posts.get", { id: post.id }, tenantMeta).catch(err => err.name)
					)
				);
			};
			it("tenant #1", async () => {
				const res = await getPosts(tenant1Meta);
				expect(res).toEqual([
					posts.post1,
					"EntityNotFoundError",
					posts.post3,
					"EntityNotFoundError",
					"EntityNotFoundError",
					posts.post6
				]);
			});

			it("tenant #2", async () => {
				const res = await getPosts(tenant2Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					posts.post4,
					posts.post5,
					"EntityNotFoundError"
				]);
			});

			it("tenant #3", async () => {
				const res = await getPosts(tenant3Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					posts.post2,
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("tenant #0", async () => {
				const res = await getPosts(tenant0Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("should throw error if tenantId is missing", async () => {
				await expect(broker.call("posts.get", { id: posts.post1.id })).rejects.toThrow(
					"Missing tenantId!"
				);
			});
		});

		describe("Resolve post by tenant", () => {
			const resolvePosts = async function (tenantMeta) {
				return Promise.all(
					Object.values(posts).map(post =>
						broker
							.call("posts.resolve", { id: post.id }, tenantMeta)
							.catch(err => err.name)
					)
				);
			};
			it("tenant #1", async () => {
				const res = await resolvePosts(tenant1Meta);
				expect(res).toEqual([posts.post1, null, posts.post3, null, null, posts.post6]);
			});

			it("tenant #2", async () => {
				const res = await resolvePosts(tenant2Meta);
				expect(res).toEqual([null, null, null, posts.post4, posts.post5, null]);
			});

			it("tenant #3", async () => {
				const res = await resolvePosts(tenant3Meta);
				expect(res).toEqual([null, posts.post2, null, null, null, null]);
			});

			it("tenant #0", async () => {
				const res = await resolvePosts(tenant0Meta);
				expect(res).toEqual([null, null, null, null, null, null]);
			});

			it("should throw error if tenantId is missing", async () => {
				await expect(broker.call("posts.resolve", { id: posts.post1.id })).rejects.toThrow(
					"Missing tenantId!"
				);
			});
		});

		describe("Update post by", () => {
			const updatePosts = async function (tenantMeta) {
				return Promise.all(
					Object.values(posts).map(post =>
						broker
							.call(
								"posts.update",
								{ id: post.id, content: "Updated content" },
								tenantMeta
							)
							.then(res => Object.assign(post, res))
							.catch(err => err.name)
					)
				);
			};

			it("tenant #1", async () => {
				const res = await updatePosts(tenant1Meta);
				expect(res).toEqual([
					posts.post1,
					"EntityNotFoundError",
					posts.post3,
					"EntityNotFoundError",
					"EntityNotFoundError",
					posts.post6
				]);
			});

			it("tenant #2", async () => {
				const res = await updatePosts(tenant2Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					posts.post4,
					posts.post5,
					"EntityNotFoundError"
				]);
			});

			it("tenant #3", async () => {
				const res = await updatePosts(tenant3Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					posts.post2,
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("tenant #0", async () => {
				const res = await updatePosts(tenant0Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("should throw error if tenantId is missing", async () => {
				await expect(
					broker.call("posts.update", { id: posts.post1.id, content: "Updated content" })
				).rejects.toThrow("Missing tenantId!");
			});
		});

		describe("Replace post by", () => {
			const replacePosts = async function (tenantMeta) {
				return Promise.all(
					Object.values(posts).map(post =>
						broker
							.call(
								"posts.update",
								{ ...post, content: "Replaced content" },
								tenantMeta
							)
							.then(res => Object.assign(post, res))
							.catch(err => err.name)
					)
				);
			};

			it("tenant #1", async () => {
				const res = await replacePosts(tenant1Meta);
				expect(res).toEqual([
					posts.post1,
					"EntityNotFoundError",
					posts.post3,
					"EntityNotFoundError",
					"EntityNotFoundError",
					posts.post6
				]);
			});

			it("tenant #2", async () => {
				const res = await replacePosts(tenant2Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					posts.post4,
					posts.post5,
					"EntityNotFoundError"
				]);
			});

			it("tenant #3", async () => {
				const res = await replacePosts(tenant3Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					posts.post2,
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("tenant #0", async () => {
				const res = await replacePosts(tenant0Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("should throw error if tenantId is missing", async () => {
				expect.assertions(1);
				try {
					await broker.call("posts.replace", {
						id: posts.post1.id,
						title: "Replaced title",
						content: "Replaced content"
					});
				} catch (err) {
					expect(err.message).toBe("Missing tenantId!");
				}
			});
		});

		describe("Remove post", () => {
			const removePosts = async function (posts, tenantMeta) {
				return Promise.all(
					posts.map(post =>
						broker
							.call("posts.remove", { id: post.id }, tenantMeta)
							.then(res => res)
							.catch(err => err.name)
					)
				);
			};

			it("should throw error if tenantId is missing", async () => {
				expect.assertions(1);
				try {
					await broker.call("posts.remove", { id: posts.post1.id });
				} catch (err) {
					expect(err.message).toBe("Missing tenantId!");
				}
			});

			it("should not remove other tenant's posts by Tenant #0", async () => {
				const res = await removePosts(Object.values(posts), tenant0Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("should not remove other tenant's posts by Tenant #1", async () => {
				const res = await removePosts([posts.post2, posts.post4, posts.post5], tenant1Meta);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("should not remove other tenant's posts by Tenant #2", async () => {
				const res = await removePosts(
					[posts.post1, posts.post2, posts.post3, posts.post6],
					tenant2Meta
				);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("should not remove other tenant's posts by Tenant #3", async () => {
				const res = await removePosts(
					[posts.post1, posts.post3, posts.post4, posts.post5, posts.post6],
					tenant3Meta
				);
				expect(res).toEqual([
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError",
					"EntityNotFoundError"
				]);
			});

			it("should remove own tenant's posts by Tenant #1", async () => {
				const res = await removePosts([posts.post1, posts.post3, posts.post6], tenant1Meta);
				expect(res).toEqual([posts.post1.id, posts.post3.id, posts.post6.id]);
			});

			it("should remove own tenant's posts by Tenant #2", async () => {
				const res = await removePosts([posts.post4, posts.post5], tenant2Meta);
				expect(res).toEqual([posts.post4.id, posts.post5.id]);
			});

			it("should remove own tenant's posts by Tenant #3", async () => {
				const res = await removePosts([posts.post2], tenant3Meta);
				expect(res).toEqual([posts.post2.id]);
			});
		});

		describe("Count posts after removing by", () => {
			it("tenant #1", async () => {
				const res = await broker.call("posts.count", null, tenant1Meta);
				expect(res).toBe(0);
			});

			it("tenant #2", async () => {
				const res = await broker.call("posts.count", null, tenant2Meta);
				expect(res).toBe(0);
			});

			it("tenant #3", async () => {
				const res = await broker.call("posts.count", null, tenant3Meta);
				expect(res).toBe(0);
			});

			it("tenant #0", async () => {
				const res = await broker.call("posts.count", null, tenant0Meta);
				expect(res).toBe(0);
			});
		});

		// TODO: test clearEntities by tenants
	}

	describe("Test record-level tenancy", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			mixins: [baseServiceSchema],
			settings: {
				fields: {
					tenantId: {
						type: "number",
						required: true,
						columnType: "integer",
						set: ({ ctx }) => ctx.meta.tenantId
					}
				},
				scopes: {
					tenant(q, ctx) {
						const tenantId = ctx.meta.tenantId;
						if (!tenantId) throw new Error("Missing tenantId!");

						q.tenantId = tenantId;
						return q;
					}
				},
				defaultScopes: ["tenant"]
			},

			hooks: {
				customs: {
					async adapterConnected(adapter) {
						if (adapterType == "Knex") {
							await adapter.createTable();
						}
					}
				}
			}
		});

		beforeAll(() => {
			return broker.start();
		});
		afterAll(() => broker.stop());

		runTenantTestcases(broker, svc, "record");
	});

	describe("Test collection-level tenancy", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			mixins: [baseServiceSchema],
			methods: {
				getAdapterByContext(ctx, adapterDef) {
					const tenantId = ctx && ctx.meta.tenantId;
					if (!tenantId) throw new Error("Missing tenantId!");

					return [
						tenantId,
						{
							type: adapterType,
							options: {
								...(adapterDef.options || {}),
								collection: `posts-${tenantId}`,
								tableName: `posts-${tenantId}`
							}
						}
					];
				}
			},

			hooks: {
				customs: {
					async adapterConnected(adapter) {
						if (adapterType == "Knex") {
							await adapter.createTable();
						}
					}
				}
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		runTenantTestcases(broker, svc, "collection");
	});

	if (adapterType == "Knex" && getAdapter.adapterName != "Knex-SQLite") {
		describe("Test schema-level tenancy", () => {
			const broker = new ServiceBroker({ logger: false });
			const svc = broker.createService({
				mixins: [baseServiceSchema],
				methods: {
					getAdapterByContext(ctx, adapterDef) {
						const tenantId = ctx.meta.tenantId;
						if (!tenantId) throw new Error("Missing tenantId!");

						return [
							tenantId,
							{
								type: adapterType,
								options: _.defaultsDeep(
									{
										schema: "tenant_" + tenantId
									},
									adapterDef.options
								)
							}
						];
					}
				},

				hooks: {
					customs: {
						async adapterConnected(adapter) {
							if (getAdapter.adapterName == "Knex-MSSQL") {
								await adapter.client.schema.raw(`
								IF NOT EXISTS ( SELECT  * FROM sys.schemas WHERE name = N'${adapter.opts.schema}' )
								EXEC('CREATE SCHEMA [${adapter.opts.schema}]');
							`);
							} else {
								await adapter.client.schema.raw(
									`CREATE SCHEMA IF NOT EXISTS ${adapter.opts.schema}`
								);
							}

							await adapter.createTable();
						}
					}
				}
			});

			beforeAll(() => broker.start());
			afterAll(() => broker.stop());

			runTenantTestcases(broker, svc, "schema");
		});
	}

	describe("Test database-level tenancy", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			mixins: [baseServiceSchema],
			methods: {
				getAdapterByContext(ctx, adapterDef) {
					const tenantId = ctx.meta.tenantId;
					if (!tenantId) throw new Error("Missing tenantId!");

					return [
						tenantId,
						{
							type: adapterType,
							options: _.defaultsDeep(
								{
									dbName: `db_int_posts_${tenantId}`, // For Mongo

									knex: {
										connection: {
											database: `db_int_posts_${tenantId}` // for Pg
										}
									}
								},
								adapterDef.options
							)
						}
					];
				}
			},

			hooks: {
				customs: {
					async adapterConnected(adapter) {
						if (adapterType == "Knex") {
							await adapter.createTable();
						}
					}
				}
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		runTenantTestcases(broker, svc, "database");
	});

	if (getAdapter.adapterName != "Knex-SQLite") {
		describe("Test adapter limit with tenancy", () => {
			const broker = new ServiceBroker({
				logger: false,
				errorHandler: err => {
					console.log(err);
					throw err;
				}
			});
			const svc = broker.createService({
				name: "posts",
				mixins: [DbService({ adapter: getAdapter(), maximumAdapters: 5 })],
				settings: {
					fields: {
						id: {
							type: "string",
							primaryKey: true,
							columnName: "_id",
							columnType: "integer"
						},
						title: { type: "string", required: true, min: 5 },
						content: { type: "string", required: true }
					}
				},

				methods: {
					getAdapterByContext(ctx, adapterDef) {
						const tenantId = ctx && ctx.meta.tenantId;
						if (!tenantId) throw new Error("Missing tenantId!");

						const tableName = `posts_${tenantId}`;

						return [
							tenantId,
							{
								type: adapterType,
								options: {
									...(adapterDef.options || {}),
									collection: tableName,
									tableName
								}
							}
						];
					}
				},

				actions: {
					countAdapters() {
						return this.adapters.size;
					}
				},

				hooks: {
					customs: {
						async adapterConnected(adapter) {
							if (adapterType == "Knex") {
								await adapter.createTable();
							}
						}
					}
				}
			});

			beforeAll(() => broker.start());
			afterAll(() => broker.stop());

			it("should work properly with limited adapters", async () => {
				for (let i = 1; i <= 10; i++) {
					await broker.call(
						"posts.create",
						{
							title: `Post #${i}`,
							content: `Post content #${i}`
						},
						{ meta: { tenantId: i } }
					);
				}

				expect(await broker.call("posts.countAdapters")).toBe(5);
			});
		});
	}
};

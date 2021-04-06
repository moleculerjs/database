"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

module.exports = (getAdapter, adapterType) => {
	describe("Test multi populating", () => {
		const broker = new ServiceBroker({ logger: false });
		const postSvc = broker.createService({
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
					title: { type: "string", required: true, min: 5 },
					content: { type: "string", required: true },
					authorID: { type: "string", required: true },
					author: {
						type: "object",
						readonly: true,
						virtual: true,
						populate: {
							action: "users.resolve",
							keyField: "authorID",
							fields: ["name", "postCount", "email"]
						}
					},
					createdAt: {
						type: "number",
						onCreate: Date.now,
						columnType: "bigInteger",
						get: v => (v != null ? Number(v) : v)
					},
					updatedAt: {
						type: "number",
						onUpdate: Date.now,
						columnType: "bigInteger",
						get: v => (v != null ? Number(v) : v)
					}
				},
				defaultPopulates: ["author"]
			},

			async started() {
				const adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable();
				}
			}
		});

		const userSvc = broker.createService({
			name: "users",
			mixins: [
				DbService({ adapter: getAdapter({ collection: "users", tableName: "users" }) })
			],
			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string" },
					email: { type: "string", readPermission: ["admin"] },
					password: { type: "string", hidden: true },
					favoritePosts: {
						type: "array",
						items: "string",
						populate: "posts.resolve",
						columnType: "string"
					},
					postCount: {
						type: "number",
						virtual: true,
						populate: (ctx, values, docs) => {
							return Promise.all(
								docs.map(doc =>
									ctx.call("posts.count", { query: { authorID: doc._id } })
								)
							);
						}
					}
				},
				defaultPopulates: ["postCount"]
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
		const ctx = Context.create(broker, null, {});

		const users = {};
		const posts = {};

		describe("Set up", () => {
			it("should return empty array", async () => {
				await postSvc.clearEntities();
				await userSvc.clearEntities();

				let rows = await postSvc.findEntities(ctx);
				expect(rows).toEqual([]);
				rows = await userSvc.findEntities(ctx);
				expect(rows).toEqual([]);

				let count = await postSvc.countEntities(ctx);
				expect(count).toEqual(0);
				count = await userSvc.countEntities(ctx);
				expect(count).toEqual(0);
			});

			it("Setup user entities", async () => {
				users.johnDoe = await userSvc.createEntity(ctx, {
					name: "John Doe",
					email: "john.doe@moleculer.services",
					password: "J0hnD03"
				});
				users.janeDoe = await userSvc.createEntity(ctx, {
					name: "Jane Doe",
					email: "jane.doe@moleculer.services",
					password: "J4n3D03"
				});
				users.bobSmith = await userSvc.createEntity(ctx, {
					name: "Bob Smith",
					email: "bob.smith@moleculer.services",
					password: "B0b5m1th"
				});
			});

			it("Setup posts entities", async () => {
				posts.post1 = await postSvc.createEntity(ctx, {
					title: "Post #1",
					content: "Content of post #1",
					authorID: users.johnDoe.id
				});
				posts.post2 = await postSvc.createEntity(ctx, {
					title: "Post #2",
					content: "Content of post #2",
					authorID: users.janeDoe.id
				});
				posts.post3 = await postSvc.createEntity(ctx, {
					title: "Post #3",
					content: "Content of post #3",
					authorID: users.bobSmith.id
				});
				posts.post4 = await postSvc.createEntity(ctx, {
					title: "Post #4",
					content: "Content of post #4",
					authorID: users.johnDoe.id
				});
				posts.post5 = await postSvc.createEntity(ctx, {
					title: "Post #5",
					content: "Content of post #5",
					authorID: users.janeDoe.id
				});
				posts.post6 = await postSvc.createEntity(ctx, {
					title: "Post #6",
					content: "Content of post #6",
					authorID: users.johnDoe.id
				});
				posts.post7 = await postSvc.createEntity(ctx, {
					title: "Post #7",
					content: "Content of post #7",
					authorID: users.janeDoe.id
				});
				posts.post8 = await postSvc.createEntity(ctx, {
					title: "Post #8",
					content: "Content of post #8",
					authorID: users.janeDoe.id
				});
				posts.post9 = await postSvc.createEntity(ctx, {
					title: "Post #9",
					content: "Content of post #9",
					authorID: users.bobSmith.id
				});
				posts.post10 = await postSvc.createEntity(ctx, {
					title: "Post #10",
					content: "Content of post #10",
					authorID: users.janeDoe.id
				});
			});

			it("Update user entities", async () => {
				users.johnDoe = await userSvc.updateEntity(ctx, {
					id: users.johnDoe.id,
					favoritePosts: [posts.post5.id, posts.post2.id, posts.post10.id, posts.post8.id]
				});
				users.janeDoe = await userSvc.updateEntity(ctx, {
					id: users.janeDoe.id,
					favoritePosts: [
						posts.post1.id,
						posts.post2.id,
						posts.post4.id,
						posts.post7.id,
						posts.post9.id,
						posts.post10.id
					]
				});
				users.bobSmith = await userSvc.updateEntity(ctx, {
					id: users.bobSmith.id,
					favoritePosts: [posts.post2.id, posts.post3.id, posts.post6.id]
				});

				// console.log("Users", users);
				// console.log("Posts", posts);
			});
		});

		describe("Test populates", () => {
			it("should list users without populate", async () => {
				const res = await userSvc.findEntities(ctx);
				expect(res).toEqual(
					expect.arrayContaining([
						{
							id: users.johnDoe.id,
							email: "john.doe@moleculer.services",
							favoritePosts: [
								posts.post5.id,
								posts.post2.id,
								posts.post10.id,
								posts.post8.id
							],
							name: "John Doe",
							postCount: 3
						},
						{
							id: users.janeDoe.id,
							email: "jane.doe@moleculer.services",
							favoritePosts: [
								posts.post1.id,
								posts.post2.id,
								posts.post4.id,
								posts.post7.id,
								posts.post9.id,
								posts.post10.id
							],
							name: "Jane Doe",
							postCount: 5
						},
						{
							id: users.bobSmith.id,
							email: "bob.smith@moleculer.services",
							favoritePosts: [posts.post2.id, posts.post3.id, posts.post6.id],
							name: "Bob Smith",
							postCount: 2
						}
					])
				);
			});

			it("should list users with 'favoritePosts' populate (3-level populating)", async () => {
				const res = await userSvc.findEntities(ctx, { populate: ["favoritePosts"] });
				expect(res).toEqual(
					expect.arrayContaining([
						{
							id: users.johnDoe.id,
							email: "john.doe@moleculer.services",
							favoritePosts: [
								{
									author: {
										email: "jane.doe@moleculer.services",
										name: "Jane Doe",
										postCount: 5
									},
									authorID: "" + users.janeDoe.id,
									content: "Content of post #5",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post5.id,
									title: "Post #5"
								},
								{
									author: {
										email: "jane.doe@moleculer.services",
										name: "Jane Doe",
										postCount: 5
									},
									authorID: "" + users.janeDoe.id,
									content: "Content of post #2",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post2.id,
									title: "Post #2"
								},
								{
									author: {
										email: "jane.doe@moleculer.services",
										name: "Jane Doe",
										postCount: 5
									},
									authorID: "" + users.janeDoe.id,
									content: "Content of post #10",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post10.id,
									title: "Post #10"
								},
								{
									author: {
										email: "jane.doe@moleculer.services",
										name: "Jane Doe",
										postCount: 5
									},
									authorID: "" + users.janeDoe.id,
									content: "Content of post #8",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post8.id,
									title: "Post #8"
								}
							],
							name: "John Doe"
						},
						{
							id: users.janeDoe.id,
							email: "jane.doe@moleculer.services",
							favoritePosts: [
								{
									author: {
										email: "john.doe@moleculer.services",
										name: "John Doe",
										postCount: 3
									},
									authorID: "" + users.johnDoe.id,
									content: "Content of post #1",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post1.id,
									title: "Post #1"
								},
								{
									author: {
										email: "jane.doe@moleculer.services",
										name: "Jane Doe",
										postCount: 5
									},
									authorID: "" + users.janeDoe.id,
									content: "Content of post #2",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post2.id,
									title: "Post #2"
								},
								{
									author: {
										email: "john.doe@moleculer.services",
										name: "John Doe",
										postCount: 3
									},
									authorID: "" + users.johnDoe.id,
									content: "Content of post #4",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post4.id,
									title: "Post #4"
								},
								{
									author: {
										email: "jane.doe@moleculer.services",
										name: "Jane Doe",
										postCount: 5
									},
									authorID: "" + users.janeDoe.id,
									content: "Content of post #7",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post7.id,
									title: "Post #7"
								},
								{
									author: {
										email: "bob.smith@moleculer.services",
										name: "Bob Smith",
										postCount: 2
									},
									authorID: "" + users.bobSmith.id,
									content: "Content of post #9",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post9.id,
									title: "Post #9"
								},
								{
									author: {
										email: "jane.doe@moleculer.services",
										name: "Jane Doe",
										postCount: 5
									},
									authorID: "" + users.janeDoe.id,
									content: "Content of post #10",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post10.id,
									title: "Post #10"
								}
							],
							name: "Jane Doe"
						},
						{
							id: users.bobSmith.id,
							email: "bob.smith@moleculer.services",
							favoritePosts: [
								{
									author: {
										email: "jane.doe@moleculer.services",
										name: "Jane Doe",
										postCount: 5
									},
									authorID: "" + users.janeDoe.id,
									content: "Content of post #2",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post2.id,
									title: "Post #2"
								},
								{
									author: {
										email: "bob.smith@moleculer.services",
										name: "Bob Smith",
										postCount: 2
									},
									authorID: "" + users.bobSmith.id,
									content: "Content of post #3",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post3.id,
									title: "Post #3"
								},
								{
									author: {
										email: "john.doe@moleculer.services",
										name: "John Doe",
										postCount: 3
									},
									authorID: "" + users.johnDoe.id,
									content: "Content of post #6",
									createdAt: expect.any(Number),
									...(adapterType == "Knex" ? { updatedAt: null } : {}),
									id: posts.post6.id,
									title: "Post #6"
								}
							],
							name: "Bob Smith"
						}
					])
				);
			});

			it("should list users with 'postCount' populate", async () => {
				const res = await userSvc.findEntities(ctx, {
					populate: ["postCount"],
					fields: ["name", "postCount"]
				});
				expect(res).toEqual(
					expect.arrayContaining([
						{
							name: "John Doe",
							postCount: 3
						},
						{
							name: "Jane Doe",
							postCount: 5
						},
						{
							name: "Bob Smith",
							postCount: 2
						}
					])
				);
			});

			it("should get user with populates and without permission (no email also in populated data)", async () => {
				userSvc.checkAuthority = jest.fn(async () => false);

				const res = await userSvc.resolveEntities(ctx, {
					id: users.bobSmith.id,
					populate: ["favoritePosts", "postCount"]
				});
				expect(res).toEqual({
					id: users.bobSmith.id,
					name: "Bob Smith",
					postCount: 2,
					favoritePosts: [
						{
							author: {
								name: "Jane Doe",
								postCount: 5
							},
							authorID: "" + users.janeDoe.id,
							content: "Content of post #2",
							createdAt: expect.any(Number),
							id: posts.post2.id,
							title: "Post #2",
							...(adapterType == "Knex" ? { updatedAt: null } : {})
						},
						{
							author: {
								name: "Bob Smith",
								postCount: 2
							},
							authorID: "" + users.bobSmith.id,
							content: "Content of post #3",
							createdAt: expect.any(Number),
							id: posts.post3.id,
							title: "Post #3",
							...(adapterType == "Knex" ? { updatedAt: null } : {})
						},
						{
							author: {
								name: "John Doe",
								postCount: 3
							},
							authorID: "" + users.johnDoe.id,
							content: "Content of post #6",
							createdAt: expect.any(Number),
							id: posts.post6.id,
							title: "Post #6",
							...(adapterType == "Knex" ? { updatedAt: null } : {})
						}
					]
				});
			});
		});
	});
};

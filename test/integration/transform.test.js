"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

module.exports = getAdapter => {
	describe("Test transformations", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter("users")
				})
			],
			settings: {
				fields: {
					myID: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string" },
					upperName: {
						type: "string",
						readonly: true,
						get: (v, entity) => (entity.name ? entity.name.toUpperCase() : entity.name)
					},
					password: { type: "string", hidden: true },
					token: { type: "string", hidden: "byDefault" },
					email: { type: "string", readPermission: "admin" },
					phone: { type: "string", permission: "admin" }
				}
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		const docs = {};

		describe("Set up", () => {
			it("should return empty array", async () => {
				await svc.clearEntities();

				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});
		});

		describe("Test hidden fields, getter, readPermission", () => {
			it("create test entity", async () => {
				const res = await svc.createEntity(ctx, {
					name: "John Doe",
					upperName: "Nothing",
					email: "john.doe@moleculer.services",
					phone: "+1-555-1234",
					password: "johnDoe1234",
					token: "token1234"
				});
				docs.johnDoe = res;

				expect(res).toEqual({
					myID: expect.any(String),
					name: "John Doe",
					upperName: "JOHN DOE",
					email: "john.doe@moleculer.services",
					phone: "+1-555-1234"
				});
			});

			it("should hide e-mail address", async () => {
				svc.checkAuthority = jest.fn(async () => false);
				const res = await svc.resolveEntities(ctx, { myID: docs.johnDoe.myID });
				expect(res).toEqual({
					myID: expect.any(String),
					name: "John Doe",
					upperName: "JOHN DOE"
				});
			});

			it("should not transform the entity", async () => {
				const res2 = await svc.resolveEntities(
					ctx,
					{ myID: docs.johnDoe.myID },
					{ transform: false }
				);
				expect(res2).toEqual({
					_id: expect.anything(),
					name: "John Doe",
					email: "john.doe@moleculer.services",
					phone: "+1-555-1234",
					password: "johnDoe1234",
					token: "token1234"
				});
			});

			it("should filter fields", async () => {
				const res = await svc.resolveEntities(ctx, {
					myID: docs.johnDoe.myID,
					fields: ["upperName", "asdasdasd", "password", "email", "token"]
				});
				expect(res).toEqual({
					upperName: "JOHN DOE",
					token: "token1234"
				});
			});

			it("should filter all fields", async () => {
				const res = await svc.resolveEntities(ctx, {
					myID: docs.johnDoe.myID,
					fields: []
				});
				expect(res).toEqual({});
			});
		});
	});

	describe("Test transformations", () => {
		const friendCountFn = jest.fn(async (ctx, idList, docs /*, field*/) =>
			docs.map(doc => (doc.friends ? doc.friends.length : 0))
		);
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter("users")
				})
			],
			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string" },
					email: { type: "string" },
					referer: {
						type: "string",
						populate: {
							action: "users.resolve",
							fields: ["name", "upperName", "password", "email"]
						}
					},
					friends: {
						type: "array",
						items: "string",
						populate: "users.resolve"
					},

					friendCount: {
						type: "number",
						populate: friendCountFn
					}
				},

				defaultPopulates: ["referer", "friends"]
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});
		const docs = {};

		describe("Set up", () => {
			it("should return empty array", async () => {
				await svc.clearEntities();

				const rows = await svc.findEntities(ctx);
				expect(rows).toEqual([]);

				const count = await svc.countEntities(ctx);
				expect(count).toEqual(0);
			});
		});

		describe("Test populates", () => {
			it("create entities", async () => {
				// --- JOHN DOE ---
				const res = await svc.createEntity(ctx, {
					name: "John Doe",
					email: "john.doe@moleculer.services"
				});
				docs.johnDoe = res;

				expect(res).toEqual({
					id: expect.any(String),
					name: "John Doe",
					email: "john.doe@moleculer.services"
				});

				// --- JANE DOE ---
				const res2 = await svc.createEntity(ctx, {
					name: "Jane Doe",
					email: "jane.doe@moleculer.services",
					referer: docs.johnDoe.id
				});
				docs.janeDoe = res2;

				expect(res2).toEqual({
					id: expect.any(String),
					name: "Jane Doe",
					email: "jane.doe@moleculer.services",
					referer: {
						name: "John Doe",
						email: "john.doe@moleculer.services"
					}
				});

				// --- BOB SMITH ---
				const res3 = await svc.createEntity(ctx, {
					name: "Bob Smith",
					email: "bob.smith@moleculer.services",
					referer: docs.johnDoe.id,
					friends: [docs.johnDoe.id, docs.janeDoe.id]
				});
				docs.bobSmith = res3;

				expect(res3).toEqual({
					id: expect.any(String),
					name: "Bob Smith",
					email: "bob.smith@moleculer.services",
					referer: {
						name: "John Doe",
						email: "john.doe@moleculer.services"
					},
					friends: [
						{
							id: docs.johnDoe.id,
							name: "John Doe",
							email: "john.doe@moleculer.services"
						},
						{
							id: docs.janeDoe.id,
							name: "Jane Doe",
							email: "jane.doe@moleculer.services",
							referer: {
								name: "John Doe",
								email: "john.doe@moleculer.services"
							}
						}
					]
				});
			});

			it("should call custom populate", async () => {
				friendCountFn.mockClear();

				const res = await svc.resolveEntities(ctx, {
					id: docs.bobSmith.id,
					populate: ["friendCount"]
				});
				expect(res).toEqual({
					id: docs.bobSmith.id,
					name: "Bob Smith",
					email: "bob.smith@moleculer.services",
					referer: docs.johnDoe.id,
					friends: [docs.johnDoe.id, docs.janeDoe.id],
					friendCount: 2
				});

				expect(friendCountFn).toBeCalledTimes(1);
				expect(friendCountFn).toBeCalledWith(ctx, [], expect.any(Array), svc.$fields[5]);
			});
		});
	});
};

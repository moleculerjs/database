"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

module.exports = getAdapter => {
	describe("Test transformations", () => {
		const friendCountFn = jest.fn(async (ctx, idList, docs, field) =>
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
					myID: { type: "string", primaryKey: true, columnName: "_id" },
					name: { type: "string" },
					upperName: {
						type: "string",
						readonly: true,
						get: (v, entity) => (entity.name ? entity.name.toUpperCase() : entity.name)
					},
					password: { type: "string", hidden: true },
					email: { type: "string", readPermission: "admin" },
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
		let docs = {};

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
					password: "johnDoe1234",
					referer: null
				});
				docs.johnDoe = res;

				expect(res).toEqual({
					email: "john.doe@moleculer.services",
					myID: expect.any(String),
					name: "John Doe",
					upperName: "JOHN DOE",
					referer: null
				});
			});

			it("should hide e-mail address", async () => {
				svc.checkAuthority = jest.fn(async () => false);
				const res = await svc.resolveEntities(ctx, { myID: docs.johnDoe.myID });
				expect(res).toEqual({
					myID: expect.any(String),
					name: "John Doe",
					upperName: "JOHN DOE",
					referer: null
				});

				const res2 = await svc.resolveEntities(
					ctx,
					{ myID: docs.johnDoe.myID },
					{ transform: false }
				);
				expect(res2).toEqual({
					_id: expect.anything(),
					name: "John Doe",
					email: "john.doe@moleculer.services",
					password: "johnDoe1234",
					referer: null
				});
			});
			it("should filter fields", async () => {
				const res = await svc.resolveEntities(ctx, {
					myID: docs.johnDoe.myID,
					fields: ["upperName", "asdasdasd", "password", "email"]
				});
				expect(res).toEqual({
					upperName: "JOHN DOE"
				});
			});

			it("should filter all fields", async () => {
				const res = await svc.resolveEntities(ctx, {
					myID: docs.johnDoe.myID,
					fields: []
				});
				expect(res).toEqual({});
			});

			it("create other entities", async () => {
				const res = await svc.createEntity(ctx, {
					name: "Jane Doe",
					email: "jane.doe@moleculer.services",
					password: "janeDoe1234",
					referer: docs.johnDoe.myID
				});
				docs.janeDoe = res;

				expect(res).toEqual({
					myID: expect.any(String),
					name: "Jane Doe",
					upperName: "JANE DOE",
					referer: {
						name: "John Doe",
						upperName: "JOHN DOE"
					}
				});

				const res2 = await svc.createEntity(ctx, {
					name: "Bob Smith",
					email: "bob.smith@moleculer.services",
					password: "bobby1234",
					referer: docs.johnDoe.myID,
					friends: [docs.johnDoe.myID, docs.janeDoe.myID]
				});
				docs.bobSmith = res2;

				expect(res2).toEqual({
					myID: expect.any(String),
					name: "Bob Smith",
					upperName: "BOB SMITH",
					referer: {
						name: "John Doe",
						upperName: "JOHN DOE"
					},
					friends: [
						{
							myID: docs.johnDoe.myID,
							name: "John Doe",
							upperName: "JOHN DOE",
							referer: null
						},
						{
							myID: docs.janeDoe.myID,
							name: "Jane Doe",
							upperName: "JANE DOE",
							referer: {
								name: "John Doe",
								upperName: "JOHN DOE"
							}
						}
					]
				});
			});

			it("should call custom populate", async () => {
				friendCountFn.mockClear();

				const res = await svc.resolveEntities(ctx, {
					id: docs.bobSmith.myID,
					populate: ["friendCount"]
				});
				expect(res).toEqual({
					myID: docs.bobSmith.myID,
					name: "Bob Smith",
					upperName: "BOB SMITH",
					referer: docs.johnDoe.myID,
					friends: [docs.johnDoe.myID, docs.janeDoe.myID],
					friendCount: 2
				});

				expect(friendCountFn).toBeCalledTimes(1);
				expect(friendCountFn).toBeCalledWith(ctx, [], expect.any(Array), svc.$fields[7]);
			});
		});
	});
};

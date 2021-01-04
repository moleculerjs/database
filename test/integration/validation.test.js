"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { MoleculerClientError } = require("moleculer").Errors;
const { EntityNotFoundError } = require("../../src/errors");
const DbService = require("../..").Service;

module.exports = adapter => {
	describe("Test validation", () => {
		describe("Test field processing without fields", () => {
			const broker = new ServiceBroker({ logger: false });
			const svc = broker.createService({
				name: "users",
				mixins: [
					DbService({
						adapter,
						createActions: true
					})
				],
				settings: {}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, update, replace", () => {
				let entity = {
					username: "John",
					password: "john1234",
					age: 42,
					status: true
				};
				it("should save all fields", async () => {
					const res = await broker.call("users.create", entity);
					expect(res).toStrictEqual({
						...entity,
						_id: expect.any(String)
					});
					entity = res;
				});

				it("should update fields", async () => {
					const res = await broker.call("users.update", {
						id: entity._id,
						username: 123,
						password: true,
						country: "USA"
					});
					expect(res).toStrictEqual({
						_id: entity._id,
						id: entity._id,
						age: 42,
						country: "USA",
						password: true,
						status: true,
						username: 123
					});
				});

				it("should replace fields", async () => {
					const res = await broker.call("users.replace", {
						...entity,
						id: entity._id,
						_id: undefined
					});
					expect(res).toStrictEqual({
						_id: entity._id,
						id: entity._id,
						username: "John",
						password: "john1234",
						age: 42,
						status: true
					});
				});
			});
		});

		let userPermission = "";
		let docWithPerm, docWithReadPerm, docWithoutPerm;

		async function checkResponseByPermission(broker, perm, readPerm) {
			it("should 'get' return non-permission field", async () => {
				userPermission = "";
				const res = await broker.call("users.get", { id: docWithPerm.id });
				expect(res).toStrictEqual(docWithoutPerm);
			});

			it("should 'get' return fields with permission", async () => {
				userPermission = perm;
				const res = await broker.call("users.get", { id: docWithPerm.id });
				expect(res).toStrictEqual(docWithPerm);
			});

			if (readPerm) {
				it("should 'get' return field with read permission", async () => {
					userPermission = readPerm;
					const res = await broker.call("users.get", { id: docWithPerm.id });
					expect(res).toStrictEqual(docWithReadPerm);
				});
			}

			it("should 'resolve' return non-permission fields", async () => {
				userPermission = "";
				const res = await broker.call("users.resolve", { id: docWithPerm.id });
				expect(res).toStrictEqual(docWithoutPerm);
			});

			it("should 'resolve' return fields with permission", async () => {
				userPermission = perm;
				const res = await broker.call("users.resolve", { id: docWithPerm.id });
				expect(res).toStrictEqual(docWithPerm);
			});

			if (readPerm) {
				it("should 'resolve' return field with read permission", async () => {
					userPermission = readPerm;
					const res = await broker.call("users.resolve", { id: docWithPerm.id });
					expect(res).toStrictEqual(docWithReadPerm);
				});
			}

			it("should 'find' return non-permission fields", async () => {
				userPermission = "";
				const res = await broker.call("users.find");
				expect(res).toStrictEqual([docWithoutPerm]);
			});

			it("should 'find' return fields with permission", async () => {
				userPermission = perm;
				const res = await broker.call("users.find");
				expect(res).toStrictEqual([docWithPerm]);
			});

			if (readPerm) {
				it("should 'find' return field with read permission", async () => {
					userPermission = readPerm;
					const res = await broker.call("users.find");
					expect(res).toStrictEqual([docWithReadPerm]);
				});
			}

			it("should 'list' return non-permission fields", async () => {
				userPermission = "";
				const res = await broker.call("users.list");
				expect(res).toStrictEqual({
					rows: [docWithoutPerm],
					total: 1,
					page: 1,
					pageSize: 10,
					totalPages: 1
				});
			});

			it("should 'list' return fields with permission", async () => {
				userPermission = perm;
				const res = await broker.call("users.list");
				expect(res).toStrictEqual({
					rows: [docWithPerm],
					total: 1,
					page: 1,
					pageSize: 10,
					totalPages: 1
				});
			});

			if (readPerm) {
				it("should 'list' return fields with read permission", async () => {
					userPermission = perm;
					const res = await broker.call("users.list");
					expect(res).toStrictEqual({
						rows: [docWithReadPerm],
						total: 1,
						page: 1,
						pageSize: 10,
						totalPages: 1
					});
				});
			}
		}

		describe("Test field permission", () => {
			const broker = new ServiceBroker({ logger: false });
			const svc = broker.createService({
				name: "users",
				mixins: [
					DbService({
						adapter,
						createActions: true
					})
				],
				settings: {
					fields: {
						id: { type: "string", primaryKey: true, columnName: "_id" },
						name: "string",
						password: { type: "string", permission: "admin" }
					}
				},
				methods: {
					checkAuthority(ctx, permission, params, field) {
						if (typeof permission == "string")
							return this.Promise.resolve(permission == userPermission);
						return this.Promise.resolve(permission.includes(userPermission));
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test if no permission for action", () => {
				describe("create", () => {
					it("should create entity with 'name' only", async () => {
						userPermission = "";
						const res = await broker.call("users.create", {
							name: "John",
							password: "john1234"
						});
						expect(res).toStrictEqual({
							id: expect.any(String),
							name: "John"
						});
						docWithPerm = res;
						docWithoutPerm = res;
					});

					checkResponseByPermission(broker, "admin");
				});

				describe("update", () => {
					it("should update only name field", async () => {
						userPermission = "";
						const res = await broker.call("users.update", {
							id: docWithPerm.id,
							name: "John Doe",
							password: "john123456"
						});
						expect(res).toStrictEqual({
							id: expect.any(String),
							name: "John Doe"
						});
						docWithPerm = res;
						docWithoutPerm = res;
					});
					checkResponseByPermission(broker, "admin");
				});

				describe("replace", () => {
					it("should replace only name field", async () => {
						userPermission = "";
						const res = await broker.call("users.replace", {
							id: docWithPerm.id,
							name: "Replaced",
							password: "john123456"
						});
						expect(res).toStrictEqual({
							id: expect.any(String),
							name: "Replaced"
						});
						docWithPerm = res;
						docWithoutPerm = res;
					});
					checkResponseByPermission(broker, "admin");
				});

				it("remove entity", async () => {
					await broker.call("users.remove", { id: docWithPerm.id });
				});
			});

			describe("Test if has permission for action", () => {
				describe("create", () => {
					it("should create entity with all fields", async () => {
						userPermission = "admin";
						const res = await broker.call("users.create", {
							name: "John",
							password: "john1234"
						});
						expect(res).toStrictEqual({
							id: expect.any(String),
							name: "John",
							password: "john1234"
						});
						docWithPerm = res;
						docWithoutPerm = { id: res.id, name: "John" };
					});

					checkResponseByPermission(broker, "admin");
				});

				describe("update", () => {
					it("should update all fields", async () => {
						userPermission = "admin";
						const res = await broker.call("users.update", {
							id: docWithPerm.id,
							name: "John Doe",
							password: "john123456"
						});
						expect(res).toStrictEqual({
							id: expect.any(String),
							name: "John Doe",
							password: "john123456"
						});
						docWithPerm = res;
						docWithoutPerm = { id: res.id, name: "John Doe" };
					});

					checkResponseByPermission(broker, "admin");
				});

				describe("replace", () => {
					it("should replace all fields", async () => {
						userPermission = "admin";
						const res = await broker.call("users.replace", {
							id: docWithPerm.id,
							name: "Replaced",
							password: "john123456"
						});
						expect(res).toStrictEqual({
							id: expect.any(String),
							name: "Replaced",
							password: "john123456"
						});
						docWithPerm = res;
						docWithoutPerm = { id: res.id, name: "Replaced" };
					});

					checkResponseByPermission(broker, "admin");
				});

				it("remove entity", async () => {
					await broker.call("users.remove", { id: docWithPerm.id });
				});
			});
		});

		describe("Test field readPermission", () => {
			const broker = new ServiceBroker({ logger: false });
			const svc = broker.createService({
				name: "users",
				mixins: [
					DbService({
						adapter,
						createActions: true
					})
				],
				settings: {
					fields: {
						id: { type: "string", primaryKey: true, columnName: "_id" },
						name: "string",
						password: {
							type: "string",
							readPermission: ["owner", "admin"],
							permission: "admin"
						}
					}
				},
				methods: {
					checkAuthority(ctx, permission, params, field) {
						if (typeof permission == "string")
							return this.Promise.resolve(permission == userPermission);
						return this.Promise.resolve(permission.includes(userPermission));
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("create", () => {
				it("should create entity", async () => {
					userPermission = "admin";
					const res = await broker.call("users.create", {
						name: "John",
						password: "john1234"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John",
						password: "john1234"
					});
					docWithPerm = res;
					docWithReadPerm = res;
					docWithoutPerm = { id: res.id, name: "John" };
				});

				checkResponseByPermission(broker, "admin", "owner");
			});

			describe("update", () => {
				it("should update all fields", async () => {
					userPermission = "admin";
					const res = await broker.call("users.update", {
						id: docWithPerm.id,
						name: "John Doe",
						password: "john123456"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John Doe",
						password: "john123456"
					});
					docWithPerm = res;
					docWithReadPerm = res;
					docWithoutPerm = { id: res.id, name: "John Doe" };
				});

				checkResponseByPermission(broker, "admin", "owner");
			});

			describe("replace", () => {
				it("should replace all fields", async () => {
					userPermission = "admin";
					const res = await broker.call("users.replace", {
						id: docWithPerm.id,
						name: "Replaced",
						password: "john123456"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "Replaced",
						password: "john123456"
					});
					docWithPerm = res;
					docWithReadPerm = res;
					docWithoutPerm = { id: res.id, name: "Replaced" };
				});

				checkResponseByPermission(broker, "admin", "owner");
			});

			it("remove entity", async () => {
				await broker.call("users.remove", { id: docWithPerm.id });
			});
		});
	});
};

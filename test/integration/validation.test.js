"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
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

		describe("Test required", () => {
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
						name: { type: "string", required: true }
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, update, replace", () => {
				let entity;

				it("should throw error at create", async () => {
					try {
						await broker.call("users.create", {});
					} catch (err) {
						expect(err).toBeInstanceOf(ValidationError);
						expect(err.name).toBe("ValidationError");
						expect(err.message).toBe("The 'name' field is required");
						expect(err.type).toBe("REQUIRED_FIELD");
						expect(err.code).toBe(422);
						expect(err.data).toEqual({
							field: "name",
							value: undefined
						});
					}
				});

				it("should create entity", async () => {
					const res = await broker.call("users.create", { name: "John" });
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John"
					});
					entity = res;
				});

				it("should throw error at update", async () => {
					try {
						await broker.call("users.update", { id: entity.id });
					} catch (err) {
						expect(err).toBeInstanceOf(ValidationError);
						expect(err.name).toBe("ValidationError");
						expect(err.message).toBe("The 'name' field is required");
						expect(err.type).toBe("REQUIRED_FIELD");
						expect(err.code).toBe(422);
						expect(err.data).toEqual({
							field: "name",
							value: undefined
						});
					}
				});

				it("should update entity", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "John Doe"
					});
					expect(res).toStrictEqual({
						id: entity.id,
						name: "John Doe"
					});
					entity = res;
				});

				it("should throw error at replace", async () => {
					try {
						await broker.call("users.replace", {
							id: entity.id
						});
					} catch (err) {
						expect(err).toBeInstanceOf(ValidationError);
						expect(err.name).toBe("ValidationError");
						expect(err.message).toBe("The 'name' field is required");
						expect(err.type).toBe("REQUIRED_FIELD");
						expect(err.code).toBe(422);
						expect(err.data).toEqual({
							field: "name",
							value: undefined
						});
					}
				});

				it("should replace entity", async () => {
					const res = await broker.call("users.replace", {
						id: entity.id,
						name: "Jane Doe"
					});
					expect(res).toStrictEqual({
						id: entity.id,
						name: "Jane Doe"
					});
					entity = res;
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

		describe("Test readonly field", () => {
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
						role: { type: "string", readonly: true }
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, update, replace", () => {
				let entity = {
					name: "John",
					role: "administrator"
				};

				it("should skip role field at create", async () => {
					const res = await broker.call("users.create", entity);
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should skip role field at update", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "John Doe",
						role: "moderator"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John Doe"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should skip role field at replace", async () => {
					const res = await broker.call("users.replace", {
						id: entity.id,
						name: "Jane Doe",
						role: "guest"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "Jane Doe"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});
			});
		});

		describe("Test immutable field", () => {
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
						role: { type: "string", immutable: true }
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, update, replace (set value in create)", () => {
				let entity = {
					name: "John",
					role: "administrator"
				};

				it("should store role field at create", async () => {
					const res = await broker.call("users.create", entity);
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John",
						role: "administrator"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should skip role field at update", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "John Doe",
						role: "moderator"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John Doe",
						role: "administrator"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it.skip("should skip role field at replace", async () => {
					const res = await broker.call("users.replace", {
						id: entity.id,
						name: "Jane Doe",
						role: "guest"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "Jane Doe",
						role: "administrator"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});
			});

			describe("Test create, update, replace (set value in update)", () => {
				let entity = {
					name: "John"
				};

				it("should store role field at create", async () => {
					const res = await broker.call("users.create", entity);
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it.skip("should skip role field at update", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "John Doe",
						role: "moderator"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John Doe",
						role: "moderator"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});
			});

			describe("Test create, update, replace (set value in replace)", () => {
				let entity = {
					name: "John"
				};

				it("should store role field at create", async () => {
					const res = await broker.call("users.create", entity);
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it.skip("should skip role field at replace", async () => {
					const res = await broker.call("users.replace", {
						id: entity.id,
						name: "Jane Doe",
						role: "moderator"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "Jane Doe",
						role: "moderator"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});
			});
		});

		describe("Test hooks", () => {
			const onCreate = jest.fn(async () => "Created now");
			const onUpdate = jest.fn(async () => "Updated now");
			const onReplace = jest.fn(async () => "Replaced now");
			const onRemove = jest.fn(async () => "Removed now");

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
						createdAt: { onCreate },
						createdBy: { onCreate: "Creator" },
						updatedAt: { onUpdate },
						updatedBy: { onUpdate: "Updater" },
						replacedAt: { onReplace },
						replacedBy: { onReplace: "Replacer" },
						removedAt: { onRemove },
						removedBy: { onRemove: "Remover" }
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, update, replace, remove", () => {
				let entity = {
					name: "John"
				};

				it("should call onCreate hook", async () => {
					const res = await broker.call("users.create", entity);
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John",
						createdAt: "Created now",
						createdBy: "Creator"
					});
					entity = res;

					expect(onCreate).toBeCalledTimes(1);
					expect(onCreate).toBeCalledWith(
						undefined,
						{ name: "John" },
						expect.any(Context)
					);

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should call onUpdate hook", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "John Doe",
						updatedAt: "Past"
					});
					expect(res).toStrictEqual({
						id: entity.id,
						name: "John Doe",
						createdAt: "Created now",
						createdBy: "Creator",
						updatedAt: "Updated now",
						updatedBy: "Updater"
					});
					entity = res;

					expect(onUpdate).toBeCalledTimes(1);
					expect(onUpdate).toBeCalledWith(
						"Past",
						{ id: entity.id, name: "John Doe", updatedAt: "Past" },
						expect.any(Context)
					);

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should call onReplace hook", async () => {
					const res = await broker.call("users.replace", {
						...entity,
						name: "Jane Doe"
					});
					expect(res).toStrictEqual({
						id: entity.id,
						name: "Jane Doe",
						createdAt: "Created now",
						createdBy: "Creator",
						updatedAt: "Updated now",
						updatedBy: "Updater",
						replacedAt: "Replaced now",
						replacedBy: "Replacer"
					});
					entity = res;

					expect(onReplace).toBeCalledTimes(1);
					expect(onReplace).toBeCalledWith(
						undefined,
						{
							id: entity.id,
							name: "Jane Doe",
							createdAt: "Created now",
							createdBy: "Creator",
							updatedAt: "Updated now",
							updatedBy: "Updater"
						},
						expect.any(Context)
					);

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should call onRemove hook", async () => {
					const res = await broker.call("users.remove", {
						id: entity.id
					});
					expect(res).toBe(entity.id);

					expect(onRemove).toBeCalledTimes(1);
					expect(onRemove).toBeCalledWith(
						undefined,
						{
							id: entity.id
						},
						expect.any(Context)
					);

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual({
						id: entity.id,
						name: "Jane Doe",
						createdAt: "Created now",
						createdBy: "Creator",
						updatedAt: "Updated now",
						updatedBy: "Updater",
						replacedAt: "Replaced now",
						replacedBy: "Replacer",
						removedAt: "Removed now",
						removedBy: "Remover"
					});
				});
			});
		});

		describe("Test custom validator", () => {
			const customValidate = jest.fn(value => (value.length < 3 ? "Too short" : true));

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
						name: { type: "string", required: true, validate: customValidate }
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, update, replace", () => {
				let entity;

				it("should throw error at create", async () => {
					try {
						await broker.call("users.create", { name: "Al" });
					} catch (err) {
						expect(err).toBeInstanceOf(ValidationError);
						expect(err.name).toBe("ValidationError");
						expect(err.message).toBe("Too short");
						expect(err.type).toBe("VALIDATION_ERROR");
						expect(err.code).toBe(422);
						expect(err.data).toEqual({
							field: "name",
							value: "Al"
						});
					}
				});

				it("should create entity", async () => {
					const res = await broker.call("users.create", { name: "John" });
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John"
					});
					entity = res;
				});

				it("should throw error at update", async () => {
					try {
						await broker.call("users.update", { id: entity.id, name: "Al" });
					} catch (err) {
						expect(err).toBeInstanceOf(ValidationError);
						expect(err.name).toBe("ValidationError");
						expect(err.message).toBe("Too short");
						expect(err.type).toBe("VALIDATION_ERROR");
						expect(err.code).toBe(422);
						expect(err.data).toEqual({
							field: "name",
							value: "Al"
						});
					}
				});

				it("should update entity", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "John Doe"
					});
					expect(res).toStrictEqual({
						id: entity.id,
						name: "John Doe"
					});
					entity = res;
				});

				it("should throw error at replace", async () => {
					try {
						await broker.call("users.replace", {
							...entity,
							name: "Al"
						});
					} catch (err) {
						expect(err).toBeInstanceOf(ValidationError);
						expect(err.name).toBe("ValidationError");
						expect(err.message).toBe("Too short");
						expect(err.type).toBe("VALIDATION_ERROR");
						expect(err.code).toBe(422);
						expect(err.data).toEqual({
							field: "name",
							value: "Al"
						});
					}
				});

				it("should replace entity", async () => {
					const res = await broker.call("users.replace", {
						...entity,
						name: "Jane Doe"
					});
					expect(res).toStrictEqual({
						id: entity.id,
						name: "Jane Doe"
					});
					entity = res;
				});
			});
		});

		describe("Test custom formatters", () => {
			const getter = jest.fn((value, entity) => `${entity.firstName} ${entity.lastName}`);
			const setter = jest.fn((value, entity) => {
				[entity.firstName, entity.lastName] = value.split(" ");
			});

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
						name: { type: "string", set: setter },
						fullName: { type: "string", get: getter, readonly: true },
						firstName: { type: "string" },
						lastName: { type: "string" }
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, update, replace", () => {
				let entity;

				it("should create entity", async () => {
					const res = await broker.call("users.create", { name: "John Doe" });
					expect(res).toStrictEqual({
						id: expect.any(String),
						fullName: "John Doe",
						firstName: "John",
						lastName: "Doe"
					});
					entity = res;

					expect(setter).toBeCalledTimes(1);
					expect(setter).toBeCalledWith(
						"John Doe",
						{ firstName: "John", lastName: "Doe", name: "John Doe" },
						{
							columnName: "name",
							name: "name",
							required: false,
							set: expect.any(Function),
							type: "string"
						},
						expect.any(Context)
					);

					expect(getter).toBeCalledTimes(1);
					expect(getter).toBeCalledWith(
						undefined,
						{ _id: entity.id, firstName: "John", lastName: "Doe" },
						{
							columnName: "fullName",
							get: expect.any(Function),
							name: "fullName",
							required: false,
							type: "string",
							readonly: true
						},
						expect.any(Context)
					);

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should update entity", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "Jane Doe"
					});
					expect(res).toStrictEqual({
						id: entity.id,
						fullName: "Jane Doe",
						firstName: "Jane",
						lastName: "Doe"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should replace entity", async () => {
					const res = await broker.call("users.replace", {
						...entity,
						name: "Adam Smith"
					});
					expect(res).toStrictEqual({
						id: entity.id,
						fullName: "Adam Smith",
						firstName: "Adam",
						lastName: "Smith"
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});
			});
		});

		describe("Test default value", () => {
			const getDefaultRole = jest.fn(() => "member");

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
						name: { type: "string" },
						role: { type: "string", default: getDefaultRole },
						status: { type: "number", default: 5 }
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, replace", () => {
				let entity;
				it("should create entity without default fields", async () => {
					const res = await broker.call("users.create", {
						name: "John Doe",
						role: "admin",
						status: 0
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John Doe",
						role: "admin",
						status: 0
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should replace entity without default fields", async () => {
					const res = await broker.call("users.replace", {
						id: entity.id,
						name: "Jane Doe",
						role: "guest",
						status: 2
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "Jane Doe",
						role: "guest",
						status: 2
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should create entity with default fields", async () => {
					const res = await broker.call("users.create", {
						name: "John Doe"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John Doe",
						role: "member",
						status: 5
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should replace entity with default fields", async () => {
					const res = await broker.call("users.replace", {
						id: entity.id,
						name: "Jane Doe"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "Jane Doe",
						role: "member",
						status: 5
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});
			});
		});
		describe("Test secure field", () => {
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
						id: { type: "string", primaryKey: true, secure: true, columnName: "_id" },
						name: { type: "string" }
					}
				},
				methods: {
					encodeID(id) {
						return `SECURE-${id}`;
					},
					decodeID(id) {
						if (!id.startsWith("SECURE-")) throw new Error("No secured ID");
						return id.substring(7);
					}
				}
			});

			beforeAll(async () => {
				await broker.start();
				await svc.clearEntities();
			});
			afterAll(() => broker.stop());

			describe("Test create, update, replace, remove", () => {
				let entity;
				it("should create entity", async () => {
					const res = await broker.call("users.create", {
						name: "John"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John"
					});
					expect(res.id.startsWith("SECURE-")).toBeTruthy();
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should update entity", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "John Doe"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "John Doe"
					});
					entity = res;

					const res2 = await broker.call("users.resolve", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should replace entity", async () => {
					const res = await broker.call("users.replace", {
						id: entity.id,
						name: "Jane Doe"
					});
					expect(res).toStrictEqual({
						id: expect.any(String),
						name: "Jane Doe"
					});
					entity = res;

					const res2 = await broker.call("users.resolve", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});

				it("should remove entity", async () => {
					const res = await broker.call("users.remove", {
						id: entity.id
					});
					expect(res).toBe(entity.id);
				});
			});
		});
	});
};

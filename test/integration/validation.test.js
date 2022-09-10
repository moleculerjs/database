"use strict";

const { ServiceBroker, Context } = require("moleculer");
const ObjectId = require("mongodb").ObjectId;
const { ValidationError } = require("moleculer").Errors;
const DbService = require("../..").Service;

module.exports = (getAdapter, adapterType) => {
	let expectedID;
	if (getAdapter.IdColumnType == "integer") {
		expectedID = expect.any(Number);
	} else {
		expectedID = expect.any(String);
	}

	if (getAdapter.isNoSQL) {
		describe("Test field processing without fields", () => {
			const broker = new ServiceBroker({ logger: false });
			const svc = broker.createService({
				name: "users",
				mixins: [
					DbService({
						adapter: getAdapter(),
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
						_id: expectedID
					});
					entity = res;
				});

				it("should update fields", async () => {
					const res = await broker.call("users.update", {
						_id: entity._id,
						username: 123,
						password: true,
						country: "USA"
					});
					expect(res).toStrictEqual({
						_id: entity._id,
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
						_id: entity._id
					});
					expect(res).toStrictEqual({
						_id: entity._id,
						username: "John",
						password: "john1234",
						age: 42,
						status: true
					});
				});
			});
		});
	}

	describe("Test required", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: { type: "string", required: true }
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

		describe("Test create, update, replace", () => {
			let entity;

			it("should throw error at create", async () => {
				expect.assertions(6);
				try {
					await broker.call("users.create", {});
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.name).toBe("ValidationError");
					expect(err.message).toBe("Parameters validation error!");
					expect(err.type).toBe("VALIDATION_ERROR");
					expect(err.code).toBe(422);
					expect(err.data).toEqual([
						{
							actual: undefined,
							field: "name",
							message: "The 'name' field is required.",
							type: "required",
							action: "users.create",
							nodeID: broker.nodeID
						}
					]);
				}
			});

			it("should create entity", async () => {
				const res = await broker.call("users.create", { name: "John" });
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John"
				});
				entity = res;
			});

			it("should not throw error at update (all properties optional)", async () => {
				const res = await broker.call("users.update", { id: entity.id });
				expect(res).toStrictEqual({
					id: entity.id,
					name: "John"
				});
				entity = res;
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
				expect.assertions(6);
				try {
					await broker.call("users.replace", {
						id: entity.id
					});
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.name).toBe("ValidationError");
					expect(err.message).toBe("Parameters validation error!");
					expect(err.type).toBe("VALIDATION_ERROR");
					expect(err.code).toBe(422);
					expect(err.data).toEqual([
						{
							actual: undefined,
							field: "name",
							message: "The 'name' field is required.",
							type: "required",
							action: "users.replace",
							nodeID: broker.nodeID
						}
					]);
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
			expect(res).toStrictEqual({
				...(getAdapter.isSQL ? { password: null } : {}),
				...docWithPerm
			});
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
			expect(res).toStrictEqual({
				...(getAdapter.isSQL ? { password: null } : {}),
				...docWithPerm
			});
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
			expect(res).toStrictEqual([
				{
					...(getAdapter.isSQL ? { password: null } : {}),
					...docWithPerm
				}
			]);
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
				rows: [
					{
						...(getAdapter.isSQL ? { password: null } : {}),
						...docWithPerm
					}
				],
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
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: "string",
					password: { type: "string", permission: "admin" }
				}
			},
			methods: {
				checkFieldAuthority(ctx, permission, params, field) {
					if (typeof permission == "string")
						return this.Promise.resolve(permission == userPermission);
					return this.Promise.resolve(permission.includes(userPermission));
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
						id: expectedID,
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
						id: expectedID,
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
						id: expectedID,
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
						id: expectedID,
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
						id: expectedID,
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
						id: expectedID,
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
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: "string",
					password: {
						type: "string",
						readPermission: ["owner", "admin"],
						permission: "admin"
					}
				}
			},
			methods: {
				checkFieldAuthority(ctx, permission, params, field) {
					if (typeof permission == "string")
						return this.Promise.resolve(permission == userPermission);
					return this.Promise.resolve(permission.includes(userPermission));
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
					id: expectedID,
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
					id: expectedID,
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
					id: expectedID,
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
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: "string",
					role: { type: "string", readonly: true }
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
					id: expectedID,
					name: "John",
					...(getAdapter.isSQL ? { role: null } : {})
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should skip role field at update", async () => {
				const res = await broker.call("users.update", {
					id: "" + entity.id,
					name: "John Doe",
					role: "moderator"
				});
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John Doe",
					...(getAdapter.isSQL ? { role: null } : {})
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should skip role field at replace", async () => {
				const res = await broker.call("users.replace", {
					id: "" + entity.id,
					name: "Jane Doe",
					role: "guest"
				});
				expect(res).toStrictEqual({
					id: expectedID,
					name: "Jane Doe",
					...(getAdapter.isSQL ? { role: null } : {})
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});
		});

		describe("Test with permissive option", () => {
			let entity = {
				name: "John",
				role: "administrator"
			};

			it("should update role field at create", async () => {
				const res = await svc.createEntity(null, entity, { permissive: true });
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John",
					role: "administrator"
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should update role field at update", async () => {
				const res = await svc.updateEntity(
					null,
					{
						id: "" + entity.id,
						name: "John Doe",
						role: "moderator"
					},
					{ permissive: true }
				);
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John Doe",
					role: "moderator"
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should update role field at replace", async () => {
				const res = await svc.replaceEntity(
					null,
					{
						id: "" + entity.id,
						name: "Jane Doe",
						role: "guest"
					},
					{ permissive: true }
				);
				expect(res).toStrictEqual({
					id: expectedID,
					name: "Jane Doe",
					role: "guest"
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
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: "string",
					role: { type: "string", immutable: true }
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
					id: expectedID,
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
					id: expectedID,
					name: "John Doe",
					role: "administrator"
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
					id: expectedID,
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
					id: expectedID,
					name: "John",
					...(getAdapter.isSQL ? { role: null } : {})
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should skip role field at update", async () => {
				const res = await broker.call("users.update", {
					id: "" + entity.id,
					name: "John Doe",
					role: "moderator"
				});
				expect(res).toStrictEqual({
					id: expectedID,
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
					id: expectedID,
					name: "John",
					...(getAdapter.isSQL ? { role: null } : {})
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should set role field at replace because it not set yet", async () => {
				const res = await broker.call("users.replace", {
					id: "" + entity.id,
					name: "Jane Doe",
					role: "moderator"
				});
				expect(res).toStrictEqual({
					id: expectedID,
					name: "Jane Doe",
					role: "moderator"
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});
		});

		describe("Test with permissive option", () => {
			let entity = {
				name: "John",
				role: "administrator"
			};

			it("should store role field at create", async () => {
				const res = await broker.call("users.create", entity);
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John",
					role: "administrator"
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should update role field at update", async () => {
				const res = await svc.updateEntity(
					null,
					{
						id: entity.id,
						name: "John Doe",
						role: "moderator"
					},
					{ permissive: true }
				);
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John Doe",
					role: "moderator"
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should replace role field at replace", async () => {
				const res = await svc.replaceEntity(
					null,
					{
						id: entity.id,
						name: "Jane Doe",
						role: "guest"
					},
					{ permissive: true }
				);
				expect(res).toStrictEqual({
					id: expectedID,
					name: "Jane Doe",
					role: "guest"
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
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: "string",
					createdAt: { onCreate, columnType: "string" },
					createdBy: { onCreate: "Creator", columnType: "string" },
					updatedAt: { onUpdate, columnType: "string" },
					updatedBy: { onUpdate: "Updater", columnType: "string" },
					replacedAt: { onReplace, columnType: "string" },
					replacedBy: { onReplace: "Replacer", columnType: "string" },
					removedAt: { onRemove, columnType: "string" },
					removedBy: { onRemove: "Remover", columnType: "string" }
				}
			},

			actions: {
				updateWithoutHooks: {
					handler(ctx) {
						return this.updateEntity(ctx, ctx.params, { skipOnHooks: true });
					}
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
					id: expectedID,
					name: "John",
					createdAt: "Created now",
					createdBy: "Creator",
					...(getAdapter.isSQL
						? {
								updatedAt: null,
								updatedBy: null,
								replacedAt: null,
								replacedBy: null,
								removedAt: null,
								removedBy: null
						  }
						: {})
				});
				entity = res;

				expect(onCreate).toBeCalledTimes(1);
				expect(onCreate).toBeCalledWith({
					operation: "create",
					ctx: expect.any(Context),
					value: undefined,
					params: { name: "John" },
					root: { name: "John" },
					entity: undefined,
					field: svc.$fields[2],
					id: undefined
				});

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should skip calling onUpdate hook", async () => {
				const res = await broker.call("users.updateWithoutHooks", {
					id: entity.id,
					name: "John Doe",
					updatedAt: "Past"
				});
				expect(res).toStrictEqual({
					id: entity.id,
					name: "John Doe",
					createdAt: "Created now",
					createdBy: "Creator",
					updatedAt: "Past",
					...(getAdapter.isSQL
						? {
								updatedBy: null,
								replacedAt: null,
								replacedBy: null,
								removedAt: null,
								removedBy: null
						  }
						: {})
				});
				entity = res;

				expect(onUpdate).toBeCalledTimes(0);

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
					updatedBy: "Updater",
					...(getAdapter.isSQL
						? {
								replacedAt: null,
								replacedBy: null,
								removedAt: null,
								removedBy: null
						  }
						: {})
				});
				entity = res;

				expect(onUpdate).toBeCalledTimes(1);
				expect(onUpdate).toBeCalledWith({
					operation: "update",
					ctx: expect.any(Context),
					value: "Past",
					params: {
						id: "" + entity.id,
						name: "John Doe",
						updatedAt: "Past"
					},
					root: {
						id: "" + entity.id,
						name: "John Doe",
						updatedAt: "Past"
					},
					entity: {
						_id: ["MongoDB"].includes(adapterType) ? expect.any(ObjectId) : entity.id,
						name: "John Doe",
						createdAt: "Created now",
						createdBy: "Creator",
						updatedAt: "Past",
						...(getAdapter.isSQL
							? {
									updatedBy: null,
									replacedAt: null,
									replacedBy: null,
									removedAt: null,
									removedBy: null
							  }
							: {})
					},
					field: svc.$fields[4],
					id: "" + entity.id
				});

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
					replacedBy: "Replacer",
					...(getAdapter.isSQL
						? {
								removedAt: null,
								removedBy: null
						  }
						: {})
				});
				entity = res;

				expect(onReplace).toBeCalledTimes(1);
				expect(onReplace).toBeCalledWith({
					operation: "replace",
					ctx: expect.any(Context),
					value: getAdapter.isSQL ? null : undefined,
					params: {
						id: "" + entity.id,
						name: "Jane Doe",
						createdAt: "Created now",
						createdBy: "Creator",
						updatedAt: "Updated now",
						updatedBy: "Updater",
						...(getAdapter.isSQL
							? {
									replacedAt: null,
									replacedBy: null,
									removedAt: null,
									removedBy: null
							  }
							: {})
					},
					root: {
						id: "" + entity.id,
						name: "Jane Doe",
						createdAt: "Created now",
						createdBy: "Creator",
						updatedAt: "Updated now",
						updatedBy: "Updater",
						...(getAdapter.isSQL
							? {
									replacedAt: null,
									replacedBy: null,
									removedAt: null,
									removedBy: null
							  }
							: {})
					},
					entity: {
						_id: ["MongoDB"].includes(adapterType) ? expect.any(ObjectId) : entity.id,
						name: "John Doe",
						createdAt: "Created now",
						createdBy: "Creator",
						updatedAt: "Updated now",
						updatedBy: "Updater",
						...(getAdapter.isSQL
							? {
									replacedAt: null,
									replacedBy: null,
									removedAt: null,
									removedBy: null
							  }
							: {})
					},
					field: svc.$fields[6],
					id: "" + entity.id
				});

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			it("should call onRemove hook", async () => {
				const res = await broker.call("users.remove", {
					id: entity.id
				});
				expect(res).toBe("" + entity.id);

				expect(onRemove).toBeCalledTimes(1);
				expect(onRemove).toBeCalledWith({
					operation: "remove",
					ctx: expect.any(Context),
					value: undefined,
					params: {
						id: "" + entity.id
					},
					root: {
						id: "" + entity.id
					},
					entity: {
						_id: ["MongoDB"].includes(adapterType) ? expect.any(ObjectId) : entity.id,
						name: "Jane Doe",
						createdAt: "Created now",
						createdBy: "Creator",
						updatedAt: "Updated now",
						updatedBy: "Updater",
						replacedAt: "Replaced now",
						replacedBy: "Replacer",
						...(getAdapter.isSQL
							? {
									removedAt: null,
									removedBy: null
							  }
							: {})
					},
					field: svc.$fields[8],
					id: "" + entity.id
				});

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
		const customValidate = jest.fn(({ value }) => value.length > 2 || "Too short");

		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: { type: "string", required: true, validate: customValidate },
					age: { type: "number", columnType: "integer", validate: "checkAge" }
				}
			},

			methods: {
				checkAge({ value }) {
					return value > 99 ? "Too old" : true;
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

		beforeAll(async () => {
			await broker.start();
			await svc.clearEntities();
		});
		afterAll(() => broker.stop());

		describe("Test with custom function", () => {
			let entity;

			it("should throw error at create", async () => {
				expect.assertions(6);
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
					id: expectedID,
					name: "John",
					...(getAdapter.isSQL
						? {
								age: null
						  }
						: {})
				});
				entity = res;
			});

			it("should throw error at update", async () => {
				expect.assertions(6);
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
					name: "John Doe",
					...(getAdapter.isSQL
						? {
								age: null
						  }
						: {})
				});
				entity = res;
			});

			it("should throw error at replace", async () => {
				expect.assertions(6);
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
					name: "Jane Doe",
					...(getAdapter.isSQL
						? {
								age: null
						  }
						: {})
				});
				entity = res;
			});
		});

		describe("Test with method name", () => {
			let entity;

			it("should throw error at create", async () => {
				expect.assertions(6);
				try {
					await broker.call("users.create", { name: "John", age: 120 });
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.name).toBe("ValidationError");
					expect(err.message).toBe("Too old");
					expect(err.type).toBe("VALIDATION_ERROR");
					expect(err.code).toBe(422);
					expect(err.data).toEqual({
						field: "age",
						value: 120
					});
				}
			});

			it("should create entity", async () => {
				const res = await broker.call("users.create", { name: "John", age: 33 });
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John",
					age: 33
				});
				entity = res;
			});

			it("should throw error at update", async () => {
				expect.assertions(6);
				try {
					await broker.call("users.update", { id: entity.id, age: 130 });
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.name).toBe("ValidationError");
					expect(err.message).toBe("Too old");
					expect(err.type).toBe("VALIDATION_ERROR");
					expect(err.code).toBe(422);
					expect(err.data).toEqual({
						field: "age",
						value: 130
					});
				}
			});

			it("should update entity", async () => {
				const res = await broker.call("users.update", {
					id: entity.id,
					age: 80
				});
				expect(res).toStrictEqual({
					id: entity.id,
					name: "John",
					age: 80
				});
				entity = res;
			});

			it("should throw error at replace", async () => {
				expect.assertions(6);
				try {
					await broker.call("users.replace", {
						...entity,
						name: "John",
						age: 150
					});
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.name).toBe("ValidationError");
					expect(err.message).toBe("Too old");
					expect(err.type).toBe("VALIDATION_ERROR");
					expect(err.code).toBe(422);
					expect(err.data).toEqual({
						field: "age",
						value: 150
					});
				}
			});

			it("should replace entity", async () => {
				const res = await broker.call("users.replace", {
					...entity,
					name: "Jane",
					age: 22
				});
				expect(res).toStrictEqual({
					id: entity.id,
					name: "Jane",
					age: 22
				});
				entity = res;
			});
		});
	});

	describe("Test custom formatters", () => {
		const getter = jest.fn(({ entity }) => `${entity.firstName} ${entity.lastName}`);
		const setter = jest.fn(({ value, params }) => {
			[params.firstName, params.lastName] = value.split(" ");
			return null;
		});

		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: { type: "string", set: setter },
					fullName: { type: "string", get: getter, virtual: true },
					firstName: { type: "string" },
					lastName: { type: "string" }
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
					id: expectedID,
					fullName: "John Doe",
					firstName: "John",
					lastName: "Doe",
					name: null
				});
				entity = res;

				expect(setter).toBeCalledTimes(1);
				expect(setter).toBeCalledWith({
					ctx: expect.any(Context),
					operation: "create",
					id: undefined,
					value: "John Doe",
					params: { firstName: "John", lastName: "Doe", name: "John Doe" },
					root: { firstName: "John", lastName: "Doe", name: "John Doe" },
					field: {
						columnName: "name",
						columnType: "string",
						name: "name",
						required: false,
						set: expect.any(Function),
						type: "string"
					}
				});

				expect(getter).toBeCalledTimes(1);
				expect(getter).toBeCalledWith({
					value: undefined,
					entity: { _id: entity.id, firstName: "John", lastName: "Doe", name: null },
					field: {
						columnName: "fullName",
						columnType: "string",
						get: expect.any(Function),
						name: "fullName",
						required: false,
						type: "string",
						virtual: true
					},
					ctx: expect.any(Context)
				});

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
					lastName: "Doe",
					name: null
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
					lastName: "Smith",
					name: null
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
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: { type: "string" },
					role: { type: "string", default: getDefaultRole },
					status: { type: "number", default: 5, columnType: "integer" }
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
					id: expectedID,
					name: "John Doe",
					role: "admin",
					status: 0
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);

				expect(getDefaultRole).toBeCalledTimes(0);
			});

			it("should replace entity without default fields", async () => {
				const res = await broker.call("users.replace", {
					id: entity.id,
					name: "Jane Doe",
					role: "guest",
					status: 2
				});
				expect(res).toStrictEqual({
					id: expectedID,
					name: "Jane Doe",
					role: "guest",
					status: 2
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);

				expect(getDefaultRole).toBeCalledTimes(0);
			});

			it("should create entity with default fields", async () => {
				const res = await broker.call("users.create", {
					name: "John Doe"
				});
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John Doe",
					role: "member",
					status: 5
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);

				expect(getDefaultRole).toBeCalledTimes(1);
				expect(getDefaultRole).toBeCalledWith({
					operation: "create",
					ctx: expect.any(Context),
					value: undefined,
					params: {
						name: "John Doe",
						status: 5
					},
					root: {
						name: "John Doe",
						status: 5
					},
					id: undefined,
					entity: undefined,
					field: svc.$fields[2]
				});
			});

			it("should replace entity with default fields", async () => {
				getDefaultRole.mockClear();
				const res = await broker.call("users.replace", {
					id: entity.id,
					name: "Jane Doe"
				});
				expect(res).toStrictEqual({
					id: expectedID,
					name: "Jane Doe",
					role: "member",
					status: 5
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);

				expect(getDefaultRole).toBeCalledTimes(1);
				expect(getDefaultRole).toBeCalledWith({
					operation: "replace",
					ctx: expect.any(Context),
					value: undefined,
					params: {
						id: "" + entity.id,
						name: "Jane Doe",
						status: 5
					},
					root: {
						id: "" + entity.id,
						name: "Jane Doe",
						status: 5
					},
					id: "" + entity.id,
					entity: {
						_id: ["MongoDB"].includes(adapterType) ? expect.any(ObjectId) : entity.id,
						name: "John Doe",
						role: "member",
						status: 5
					},
					field: svc.$fields[2]
				});
			});
		});
	});

	describe("Test secure field", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						secure: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
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
			},

			async started() {
				const adapter = await this.getAdapter();
				if (adapterType == "Knex") {
					await adapter.createTable();
				}

				await this.clearEntities();
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

	describe("Test with nested fields", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: { type: "string" },
					email: { type: "string" },
					address: {
						type: "object",
						columnType: "string",
						columnLength: 1000,
						properties: {
							zip: { type: "number" },
							street: { type: "string" },
							state: { type: "string", optional: true },
							city: { type: "string", required: true },
							country: { type: "string" },
							primary: { type: "boolean", default: true }
						}
					},
					roles: {
						type: "array",
						columnType: "string",
						columnLength: 1000,
						max: 3,
						items: { type: "string" }
					},

					phones: {
						type: "array",
						columnType: "string",
						columnLength: 1000,
						items: {
							type: "object",
							properties: {
								type: "string",
								number: { type: "string", required: true },
								primary: { type: "boolean", default: false }
							}
						}
					}
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

		beforeAll(async () => {
			await broker.start();
			await svc.clearEntities();
		});
		afterAll(() => broker.stop());

		describe("Test nested object", () => {
			let entity;

			it("should throw error if a nested field is missing", async () => {
				expect.assertions(2);
				try {
					await broker.call("users.create", {
						name: "John Doe",
						email: "john.doe@moleculer.services",
						address: {
							zip: "1234"
						}
					});
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.data).toEqual([
						{
							actual: undefined,
							field: "address.city",
							message: "The 'address.city' field is required.",
							type: "required",
							action: "users.create",
							nodeID: broker.nodeID
						}
					]);
				}
			});

			it("should throw error if an array is not array", async () => {
				expect.assertions(2);
				try {
					await broker.call("users.create", {
						name: "John Doe",
						email: "john.doe@moleculer.services",
						roles: "admin"
					});
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.data).toEqual([
						{
							actual: "admin",
							field: "roles",
							message: "The 'roles' field must be an array.",
							type: "array",
							action: "users.create",
							nodeID: broker.nodeID
						}
					]);
				}
			});

			it("should throw error if an object is not valid in the array", async () => {
				expect.assertions(2);
				try {
					await broker.call("users.create", {
						name: "John Doe",
						email: "john.doe@moleculer.services",
						phones: [{ type: "home" }]
					});
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.data).toEqual([
						{
							actual: undefined,
							field: "phones[0].number",
							message: "The 'phones[0].number' field is required.",
							type: "required",
							action: "users.create",
							nodeID: broker.nodeID
						}
					]);
				}
			});

			it("create test entity", async () => {
				const res = await broker.call("users.create", {
					name: "John Doe",
					email: "john.doe@moleculer.services",
					address: {
						zip: "1234",
						street: "Main Street 15",
						city: "London",
						country: "England",
						extra: "some"
					},
					roles: ["admin", 1234],
					phones: [
						{ type: "home", number: "+1-555-1234", primary: true },
						{ type: "mobile", number: "+1-555-9999" }
					]
				});
				expect(res).toStrictEqual({
					id: expectedID,
					name: "John Doe",
					email: "john.doe@moleculer.services",
					address: {
						zip: 1234,
						street: "Main Street 15",
						city: "London",
						country: "England",
						primary: true
					},
					roles: ["admin", "1234"],
					phones: [
						{ type: "home", number: "+1-555-1234", primary: true },
						{ type: "mobile", number: "+1-555-9999", primary: false }
					]
				});
				entity = res;

				const res2 = await broker.call("users.get", { id: entity.id });
				expect(res2).toStrictEqual(entity);
			});

			if (getAdapter.isNoSQL) {
				it("update a nested property in the entity", async () => {
					const res = await broker.call("users.update", {
						id: entity.id,
						name: "Dr. John Doe",
						address: {
							zip: "9999"
						}
					});

					expect(res).toStrictEqual({
						id: expectedID,
						name: "Dr. John Doe",
						email: "john.doe@moleculer.services",
						address: {
							zip: 9999,
							street: "Main Street 15",
							city: "London",
							country: "England",
							primary: true
						},
						roles: ["admin", "1234"],
						phones: [
							{ type: "home", number: "+1-555-1234", primary: true },
							{ type: "mobile", number: "+1-555-9999", primary: false }
						]
					});
					entity = res;

					const res2 = await broker.call("users.get", { id: entity.id });
					expect(res2).toStrictEqual(entity);
				});
			}
		});
	});

	describe("Test with very strict schema", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: true,
					strict: true
				})
			],
			settings: {
				fields: {
					id: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: { type: "string" },
					email: { type: "string" }
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

		beforeAll(async () => {
			await broker.start();
			await svc.clearEntities();
		});
		afterAll(() => broker.stop());

		let entity;

		it("should throw error if it contains extra field", async () => {
			expect.assertions(2);
			try {
				await broker.call("users.create", {
					name: "John Doe",
					email: "john.doe@moleculer.services",
					age: 30
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
				expect(err.data).toEqual([
					{
						actual: "age",
						expected: "name, email",
						field: undefined,
						message: "The object '' contains forbidden keys: 'age'.",
						type: "objectStrict",
						action: "users.create",
						nodeID: broker.nodeID
					}
				]);
			}
		});

		it("create test entity", async () => {
			const res = await broker.call("users.create", {
				name: "John Doe",
				email: "john.doe@moleculer.services"
			});
			expect(res).toStrictEqual({
				id: expectedID,
				name: "John Doe",
				email: "john.doe@moleculer.services"
			});
			entity = res;

			const res2 = await broker.call("users.get", { id: entity.id });
			expect(res2).toStrictEqual(entity);
		});

		it("should throw error when update with an extra property", async () => {
			expect.assertions(2);
			try {
				await broker.call("users.update", {
					id: entity.id,
					name: "Dr. John Doe",
					age: 30
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
				expect(err.data).toEqual([
					{
						actual: "age",
						expected: "id, name, email",
						field: undefined,
						message: "The object '' contains forbidden keys: 'age'.",
						type: "objectStrict",
						action: "users.update",
						nodeID: broker.nodeID
					}
				]);
			}
		});

		it("update entity", async () => {
			const res = await broker.call("users.update", {
				id: entity.id,
				name: "Dr. John Doe"
			});

			expect(res).toStrictEqual({
				id: expectedID,
				name: "Dr. John Doe",
				email: "john.doe@moleculer.services"
			});
			entity = res;

			const res2 = await broker.call("users.get", { id: entity.id });
			expect(res2).toStrictEqual(entity);
		});

		it("should throw error when replace with an extra property", async () => {
			expect.assertions(2);
			try {
				await broker.call("users.replace", {
					id: entity.id,
					name: "Mr. John Doe",
					email: "john.doe@moleculer.services",
					age: 30
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
				expect(err.data).toEqual([
					{
						actual: "age",
						expected: "id, name, email",
						field: undefined,
						message: "The object '' contains forbidden keys: 'age'.",
						type: "objectStrict",
						action: "users.replace",
						nodeID: broker.nodeID
					}
				]);
			}
		});

		it("replace entity", async () => {
			const res = await broker.call("users.replace", {
				id: entity.id,
				name: "Mr. John Doe",
				email: "john.doe@moleculer.services"
			});

			expect(res).toStrictEqual({
				id: expectedID,
				name: "Mr. John Doe",
				email: "john.doe@moleculer.services"
			});
			entity = res;

			const res2 = await broker.call("users.get", { id: entity.id });
			expect(res2).toStrictEqual(entity);
		});
	});

	describe("Test generated validator schemas in action definitions", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [
				DbService({
					adapter: getAdapter(),
					createActions: true,
					cache: {
						additionalKeys: ["#userID"]
					}
				})
			],
			settings: {
				fields: {
					key: {
						type: "string",
						primaryKey: true,
						columnName: "_id",
						columnType: getAdapter.IdColumnType
					},
					name: "string|required",
					email: "email|columnType:string",
					address: {
						type: "object",
						columnType: "string",
						strict: true,
						properties: {
							zip: { type: "number" },
							street: { type: "string" },
							state: { type: "string", optional: true },
							city: { type: "string", required: true },
							country: { type: "string" },
							primary: { type: "boolean", default: true }
						}
					},
					roles: {
						type: "array",
						columnType: "string",
						max: 3,
						items: { type: "string" }
					},

					phones: {
						type: "array",
						columnType: "string",
						items: {
							type: "object",
							properties: {
								type: "string",
								number: { type: "string", required: true },
								primary: { type: "boolean", default: false }
							}
						}
					},

					status: { type: "boolean", default: true }
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

		beforeAll(async () => {
			await broker.start();
			await svc.clearEntities();
		});
		afterAll(() => broker.stop());

		it("check 'create' action", async () => {
			expect(svc.schema.actions.create).toEqual({
				handler: expect.any(Function),
				rest: "POST /",
				visibility: "published",
				params: {
					$$strict: "remove",
					name: { convert: true, type: "string" },
					email: { optional: true, type: "email", columnType: "string" },
					address: {
						optional: true,
						columnType: "string",
						properties: {
							city: { convert: true, type: "string" },
							country: { convert: true, optional: true, type: "string" },
							primary: {
								convert: true,
								default: true,
								optional: true,
								type: "boolean"
							},
							state: { convert: true, optional: true, type: "string" },
							street: { convert: true, optional: true, type: "string" },
							zip: { convert: true, optional: true, type: "number" }
						},
						strict: "remove",
						type: "object"
					},
					phones: {
						items: {
							optional: true,
							properties: {
								number: { convert: true, type: "string" },
								primary: {
									convert: true,
									default: false,
									optional: true,
									type: "boolean"
								},
								type: { convert: true, optional: true, type: "string" }
							},
							strict: "remove",
							type: "object"
						},
						optional: true,
						columnType: "string",
						type: "array"
					},
					roles: {
						items: { convert: true, optional: true, type: "string" },
						max: 3,
						optional: true,
						columnType: "string",
						type: "array"
					},
					status: { convert: true, default: true, optional: true, type: "boolean" }
				}
			});
		});

		it("check 'update' action", async () => {
			expect(svc.schema.actions.update).toEqual({
				handler: expect.any(Function),
				rest: "PATCH /:key",
				visibility: "published",
				params: {
					$$strict: "remove",
					key: {
						convert: true,
						optional: false,
						type: "string",
						columnType: getAdapter.IdColumnType
					},
					name: { convert: true, optional: true, type: "string" },
					email: { optional: true, type: "email", columnType: "string" },
					address: {
						optional: true,
						columnType: "string",
						properties: {
							city: { convert: true, optional: true, type: "string" },
							country: { convert: true, optional: true, type: "string" },
							primary: { convert: true, optional: true, type: "boolean" },
							state: { convert: true, optional: true, type: "string" },
							street: { convert: true, optional: true, type: "string" },
							zip: { convert: true, optional: true, type: "number" }
						},
						strict: "remove",
						type: "object"
					},
					phones: {
						items: {
							optional: true,
							properties: {
								number: { convert: true, optional: true, type: "string" },
								primary: { convert: true, optional: true, type: "boolean" },
								type: { convert: true, optional: true, type: "string" }
							},
							strict: "remove",
							type: "object"
						},
						optional: true,
						columnType: "string",
						type: "array"
					},
					roles: {
						items: { convert: true, optional: true, type: "string" },
						max: 3,
						optional: true,
						columnType: "string",
						type: "array"
					},
					status: { convert: true, optional: true, type: "boolean" }
				}
			});
		});

		it("check 'replace' action", async () => {
			expect(svc.schema.actions.replace).toEqual({
				handler: expect.any(Function),
				rest: "PUT /:key",
				visibility: "published",
				params: {
					$$strict: "remove",
					key: {
						convert: true,
						optional: false,
						type: "string",
						columnType: getAdapter.IdColumnType
					},
					name: { convert: true, type: "string" },
					email: { optional: true, type: "email", columnType: "string" },
					address: {
						optional: true,
						columnType: "string",
						properties: {
							city: { convert: true, type: "string" },
							country: { convert: true, optional: true, type: "string" },
							primary: {
								convert: true,
								default: true,
								optional: true,
								type: "boolean"
							},
							state: { convert: true, optional: true, type: "string" },
							street: { convert: true, optional: true, type: "string" },
							zip: { convert: true, optional: true, type: "number" }
						},
						strict: "remove",
						type: "object"
					},
					phones: {
						items: {
							optional: true,
							properties: {
								number: { convert: true, type: "string" },
								primary: {
									convert: true,
									default: false,
									optional: true,
									type: "boolean"
								},
								type: { convert: true, optional: true, type: "string" }
							},
							strict: "remove",
							type: "object"
						},
						optional: true,
						columnType: "string",
						type: "array"
					},
					roles: {
						items: { convert: true, optional: true, type: "string" },
						max: 3,
						optional: true,
						columnType: "string",
						type: "array"
					},
					status: { convert: true, default: true, optional: true, type: "boolean" }
				}
			});
		});

		it("check 'get' action", async () => {
			expect(svc.schema.actions.get).toEqual({
				handler: expect.any(Function),
				cache: { enabled: true, keys: ["key", "fields", "scope", "populate", "#userID"] },
				rest: "GET /:key",
				visibility: "published",
				params: {
					fields: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					key: { type: "string", convert: true },
					populate: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					scope: [
						{ optional: true, type: "boolean" },
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					]
				}
			});
		});

		it("check 'resolve' action", async () => {
			expect(svc.schema.actions.resolve).toEqual({
				handler: expect.any(Function),
				cache: {
					enabled: true,
					keys: [
						"key",
						"fields",
						"scope",
						"populate",
						"mapping",
						"throwIfNotExist",
						"reorderResult",
						"#userID"
					]
				},
				visibility: "published",
				params: {
					fields: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					key: [
						{ items: { type: "string", convert: true }, type: "array" },
						{ type: "string", convert: true }
					],
					mapping: { optional: true, type: "boolean" },
					populate: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					scope: [
						{ optional: true, type: "boolean" },
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					throwIfNotExist: { optional: true, type: "boolean" },
					reorderResult: { optional: true, type: "boolean" }
				}
			});
		});

		it("check 'remove' action", async () => {
			expect(svc.schema.actions.remove).toEqual({
				handler: expect.any(Function),
				rest: "DELETE /:key",
				visibility: "published",
				params: {
					key: {
						type: "string",
						convert: true
					}
				}
			});
		});

		it("check 'find' action", async () => {
			expect(svc.schema.actions.find).toEqual({
				handler: expect.any(Function),
				rest: "GET /all",
				visibility: "published",
				cache: {
					enabled: true,
					keys: [
						"limit",
						"offset",
						"fields",
						"sort",
						"search",
						"searchFields",
						"collation",
						"scope",
						"populate",
						"query",
						"#userID"
					]
				},
				params: {
					collation: { optional: true, type: "object" },
					fields: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					limit: {
						convert: true,
						integer: true,
						max: null,
						min: 0,
						optional: true,
						type: "number"
					},
					offset: {
						convert: true,
						integer: true,
						min: 0,
						optional: true,
						type: "number"
					},
					populate: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					query: [
						{ optional: true, type: "object" },
						{ optional: true, type: "string" }
					],
					scope: [
						{ optional: true, type: "boolean" },
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					search: { optional: true, type: "string" },
					searchFields: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					sort: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					]
				}
			});
		});

		it("check 'list' action", async () => {
			expect(svc.schema.actions.list).toEqual({
				handler: expect.any(Function),
				rest: "GET /",
				visibility: "published",
				cache: {
					enabled: true,
					keys: [
						"page",
						"pageSize",
						"fields",
						"sort",
						"search",
						"searchFields",
						"collation",
						"scope",
						"populate",
						"query",
						"#userID"
					]
				},
				params: {
					collation: { optional: true, type: "object" },
					fields: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					page: { convert: true, integer: true, min: 1, optional: true, type: "number" },
					pageSize: {
						convert: true,
						integer: true,
						max: null,
						min: 1,
						optional: true,
						type: "number"
					},
					populate: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					query: [
						{ optional: true, type: "object" },
						{ optional: true, type: "string" }
					],
					scope: [
						{ optional: true, type: "boolean" },
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					search: { optional: true, type: "string" },
					searchFields: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					sort: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					]
				}
			});
		});

		it("check 'count' action", async () => {
			expect(svc.schema.actions.count).toEqual({
				handler: expect.any(Function),
				cache: {
					enabled: true,
					keys: ["search", "searchFields", "scope", "query", "#userID"]
				},
				rest: "GET /count",
				visibility: "published",
				params: {
					query: [
						{ optional: true, type: "object" },
						{ optional: true, type: "string" }
					],
					scope: [
						{ optional: true, type: "boolean" },
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					],
					search: { optional: true, type: "string" },
					searchFields: [
						{ optional: true, type: "string" },
						{ items: "string", optional: true, type: "array" }
					]
				}
			});
		});
	});
};

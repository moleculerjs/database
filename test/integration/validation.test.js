"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const DbService = require("../..").Service;

module.exports = adapter => {
	describe("Test field processing without fields", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter })],
			settings: {}
		});
		const ctx = Context.create(broker, null, {});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		it("check the process fields", async () => {
			expect(svc.$fields).toBeNull();
			expect(svc.$primaryField).toEqual({ name: "id", columnName: "_id" });
			expect(svc.$softDelete).toBeUndefined();
		});

		describe("Test validateParams", () => {
			it("should accept valid params", async () => {
				const params = {
					id: 5,
					name: "John",
					age: 42,
					status: true
				};
				const res = await svc.validateParams(ctx, params);
				expect(res).not.toBe(params);
				expect(res).toEqual(params);
			});
		});
	});

	describe("Test fields processing", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter })],
			settings: {
				fields: {
					id: { type: "string", primaryKey: true, columnName: "_id" },
					name: "string",
					age: true,
					password: false,
					createdAt: { type: "date", readonly: true, onCreate: () => new Date() },
					status: {
						type: "string",
						default: "A",
						onDelete: "D"
					}
				}
			}
		});
		const ctx = Context.create(broker, null, {});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		it("check the process fields", async () => {
			expect(svc.$fields).toEqual([
				{ columnName: "_id", name: "id", primaryKey: true, type: "string" },
				{ columnName: "name", name: "name", type: "string" },
				{ columnName: "age", name: "age", type: "any" },
				{
					name: "createdAt",
					type: "date",
					columnName: "createdAt",
					onCreate: expect.any(Function),
					readonly: true
				},
				{
					name: "status",
					type: "string",
					columnName: "status",
					default: "A",
					onDelete: "D"
				}
			]);
			expect(svc.$primaryField).toEqual({
				name: "id",
				columnName: "_id",
				primaryKey: true,
				type: "string"
			});
			expect(svc.$softDelete).toBe(true);
			expect(svc.$shouldAuthorizeFields).toBeUndefined();
		});

		describe("Test validateParams", () => {
			it("should accept valid params", async () => {
				const params = {};
				const res = await svc.validateParams(ctx, params);
				expect(res).toBeDefined();
			});
		});
	});

	describe("Test fields authority", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter })],
			settings: {
				fields: {
					name: "string",
					password: { type: "string", readPermission: "admin", permission: "owner" },
					email: { type: "string", permission: "moderator" },
					phone: { type: "string", permission: ["admin", "moderator", "owner"] }
				}
			}
		});
		const ctx = Context.create(broker, null, {});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		it("check the process fields", async () => {
			expect(svc.$fields).toEqual([
				{ columnName: "name", name: "name", type: "string" },
				{
					columnName: "password",
					name: "password",
					readPermission: "admin",
					permission: "owner",
					type: "string"
				},
				{ columnName: "email", name: "email", permission: "moderator", type: "string" },
				{
					columnName: "phone",
					name: "phone",
					permission: ["admin", "moderator", "owner"],
					type: "string"
				}
			]);
			expect(svc.$shouldAuthorizeFields).toBe(true);
		});

		describe("Test authorizeFields", () => {
			it("should return all fields", async () => {
				const res = await svc._authorizeFields(ctx, { a: 5 });
				expect(res).toEqual(svc.$fields);

				const res2 = await svc._authorizeFields(ctx, { a: 5 }, true);
				expect(res2).toEqual(svc.$fields);
			});

			it("should return fields with read permission", async () => {
				svc.checkAuthority = jest.fn(async () => false);
				const res = await svc._authorizeFields(ctx, { a: 5 });
				expect(res).toEqual([{ columnName: "name", name: "name", type: "string" }]);

				expect(svc.checkAuthority).toBeCalledTimes(3);
				expect(svc.checkAuthority).toBeCalledWith(ctx, "admin", { a: 5 }, svc.$fields[1]);
				expect(svc.checkAuthority).toBeCalledWith(
					ctx,
					"moderator",
					{ a: 5 },
					svc.$fields[2]
				);
				expect(svc.checkAuthority).toBeCalledWith(
					ctx,
					["admin", "moderator", "owner"],
					{ a: 5 },
					svc.$fields[3]
				);
			});

			it("should return fields with write permission", async () => {
				svc.checkAuthority = jest.fn(async () => false);
				const res = await svc._authorizeFields(ctx, { a: 5 }, true);
				expect(res).toEqual([{ columnName: "name", name: "name", type: "string" }]);

				expect(svc.checkAuthority).toBeCalledTimes(3);
				expect(svc.checkAuthority).toBeCalledWith(ctx, "owner", { a: 5 }, svc.$fields[1]);
				expect(svc.checkAuthority).toBeCalledWith(
					ctx,
					"moderator",
					{ a: 5 },
					svc.$fields[2]
				);
				expect(svc.checkAuthority).toBeCalledWith(
					ctx,
					["admin", "moderator", "owner"],
					{ a: 5 },
					svc.$fields[3]
				);
			});
		});
	});

	describe("Test fields validation at creating", () => {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "users",
			mixins: [DbService({ adapter })],
			settings: {}
		});
		const ctx = Context.create(broker, null, {});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		describe("Test required, optional, default value", () => {
			beforeAll(() => {
				svc.settings.fields = {
					name: { type: "string", required: true },
					shortName: { type: "string", columnName: "short_name" },
					role: { type: "string", default: "guest" },
					status: { type: "string", required: true, default: "A" }
				};

				svc._processFields();
			});

			it("should accept all params", async () => {
				const params = {
					name: "John",
					shortName: "Joe",
					role: "admin",
					status: "D"
				};
				const res = await svc.validateParams(ctx, params);
				expect(res).toEqual({
					name: "John",
					short_name: "Joe",
					role: "admin",
					status: "D"
				});
			});

			it("should set default params if missing", async () => {
				const params = {
					name: "John"
				};
				const res = await svc.validateParams(ctx, params);
				expect(res).toEqual({
					name: "John",
					role: "guest",
					status: "A"
				});
			});

			it("should throw error if required is missing", async () => {
				const params = {};
				expect.assertions(6);
				try {
					await svc.validateParams(ctx, params);
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

			it("should not throw error if required is null", async () => {
				const params = {
					name: null
				};
				expect.assertions(6);
				try {
					await svc.validateParams(ctx, params);
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					expect(err.name).toBe("ValidationError");
					expect(err.message).toBe("The 'name' field is required");
					expect(err.type).toBe("REQUIRED_FIELD");
					expect(err.code).toBe(422);
					expect(err.data).toEqual({
						field: "name",
						value: null
					});
				}
			});

			it("set nullable", () => {
				svc.settings.fields.name.nullable = true;
				svc._processFields();
			});

			it("should not throw if null & nullable", async () => {
				const params = {
					name: null
				};
				const res = await svc.validateParams(ctx, params);
				expect(res).toEqual({
					name: null,
					role: "guest",
					status: "A"
				});
			});

			it("should throw error if nullable but value is undefined", async () => {
				const params = {};
				expect.assertions(6);
				try {
					await svc.validateParams(ctx, params);
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
		});

		describe("Test readonly & updateable", () => {
			beforeAll(() => {
				svc.settings.fields = {
					name: { type: "string", required: true },
					password: { type: "string", readonly: true },
					role: { type: "string", updateable: false }
				};

				svc._processFields();
			});

			it("should remove password field", async () => {
				const params = {
					name: "John",
					password: "pass1234",
					role: "admin"
				};
				const res = await svc.validateParams(ctx, params);
				expect(res).toEqual({
					name: "John",
					role: "admin"
				});
			});

			it("should not touch updateabe field if not exist", async () => {
				const params = {
					name: "John",
					password: "pass1234"
				};
				const res = await svc.validateParams(ctx, params);
				expect(res).toEqual({
					name: "John"
				});
			});
		});

		describe("Test hook", () => {
			const onCreate = jest.fn(async () => "Now");
			beforeAll(() => {
				svc.settings.fields = {
					createdAt: { onCreate },
					createdBy: { onCreate: "Owner" },
					updatedAt: { onUpdate: "updated" },
					replacedAt: { onRplace: "replaced" },
					deletedAt: { onRemove: "removed" }
				};

				svc._processFields();
			});

			it("should call hook if value not exists", async () => {
				const params = {};
				const res = await svc.validateParams(ctx, params, { type: "create" });
				expect(res).toEqual({
					createdAt: "Now",
					createdBy: "Owner"
				});

				expect(onCreate).toBeCalledTimes(1);
				expect(onCreate).toBeCalledWith(undefined, {}, ctx);
			});

			it("should call if value exists", async () => {
				onCreate.mockClear();

				const params = {
					createdAt: "2020-09-19",
					createdBy: "John"
				};
				const res = await svc.validateParams(ctx, params);
				expect(res).toEqual({
					createdAt: "Now",
					createdBy: "Owner"
				});

				expect(onCreate).toBeCalledTimes(1);
				expect(onCreate).toBeCalledWith("2020-09-19", params, ctx);
			});
		});
	});

	// describe("Test fields validation at updating", () => {});
	// describe("Test fields validation at replacing", () => {});
	// describe("Test fields validation at removing", () => {});
};

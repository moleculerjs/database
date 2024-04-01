"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

describe("Test scoping", () => {
	describe("Test applyScopes method", () => {
		const broker = new ServiceBroker({ logger: false });
		const scopeFn = jest.fn(async q => {
			q.a = 5;
			q.b = "Yes";
			return q;
		});
		const svc = broker.createService({
			name: "posts",
			mixins: [DbService({ createActions: false })],
			settings: {
				scopes: {
					onlyActive: {
						status: true
					},
					tenant: {
						tenantId: 1001
					},
					public: {
						visibility: "public"
					},
					custom: scopeFn,
					private: {
						visibility: "private"
					}
				},

				defaultScopes: ["tenant", "onlyActive"]
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});

		it("should add default scope", async () => {
			const params = {};

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({ query: { tenantId: 1001, status: true } });
		});

		it("should add desired scope besides default scopes", async () => {
			const params = { scope: "public" };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { tenantId: 1001, status: true, visibility: "public" },
				scope: "public"
			});
		});

		it("should remove a default scope", async () => {
			const params = { scope: "-onlyActive" };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { tenantId: 1001 },
				scope: "-onlyActive"
			});
		});

		it("should remove a default scope and add a desired scope", async () => {
			const params = { scope: ["public", "-onlyActive"] };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { tenantId: 1001, visibility: "public" },
				scope: ["public", "-onlyActive"]
			});
		});

		it("should add nothing", async () => {
			const params = { scope: false };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({ scope: false });
		});

		it("should add the custom scope", async () => {
			const params = { scope: "custom" };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { status: true, tenantId: 1001, a: 5, b: "Yes" },
				scope: "custom"
			});

			expect(scopeFn).toBeCalledTimes(1);
			expect(scopeFn).toBeCalledWith({ status: true, tenantId: 1001, a: 5, b: "Yes" }, ctx, {
				query: { status: true, tenantId: 1001, a: 5, b: "Yes" },
				scope: "custom"
			});
		});

		it("should add multiple scope", async () => {
			const params = { scope: ["custom", "notExist", "public"] };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { status: true, tenantId: 1001, a: 5, b: "Yes", visibility: "public" },
				scope: ["custom", "notExist", "public"]
			});
		});

		it("should overwrite previous scope", async () => {
			const params = { scope: ["public", "custom", "private"] };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { status: true, tenantId: 1001, a: 5, b: "Yes", visibility: "private" },
				scope: ["public", "custom", "private"]
			});
		});
	});

	describe("Test applyScopes method with authorization", () => {
		const broker = new ServiceBroker({ logger: false });
		const scopeFn = jest.fn(q => {
			q.a = 5;
			q.b = "Yes";
			return q;
		});

		let checkScopeAuthorityReturnValue = () => true;
		const checkScopeAuthority = jest.fn(async (ctx, name, operation, scope) =>
			checkScopeAuthorityReturnValue(name, scope, operation)
		);
		const svc = broker.createService({
			name: "posts",
			mixins: [DbService({ createActions: false })],
			settings: {
				scopes: {
					onlyActive: {
						status: true
					},
					tenant: {
						tenantId: 1001
					},
					public: {
						visibility: "public"
					},
					custom: scopeFn
				},

				defaultScopes: ["tenant", "onlyActive"]
			},

			methods: {
				checkScopeAuthority
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});

		it("should add default scope", async () => {
			checkScopeAuthority.mockClear();
			const params = {};

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({ query: { status: true, tenantId: 1001 } });

			expect(checkScopeAuthority).toBeCalledTimes(2);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "onlyActive", "add", {
				status: true
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "add", {
				tenantId: 1001
			});
		});

		it("should add desired scope", async () => {
			checkScopeAuthority.mockClear();
			const params = { scope: "public" };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { tenantId: 1001, status: true, visibility: "public" },
				scope: "public"
			});

			expect(checkScopeAuthority).toBeCalledTimes(3);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "onlyActive", "add", {
				status: true
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "public", "add", {
				visibility: "public"
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "add", {
				tenantId: 1001
			});
		});

		it("should add desired scope and remove default scope", async () => {
			checkScopeAuthority.mockClear();
			const params = { scope: ["public", "-onlyActive"] };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { tenantId: 1001, visibility: "public" },
				scope: ["public", "-onlyActive"]
			});

			expect(checkScopeAuthority).toBeCalledTimes(3);
			expect(checkScopeAuthority).toBeCalledWith(
				expect.any(Context),
				"onlyActive",
				"remove",
				{
					status: true
				}
			);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "public", "add", {
				visibility: "public"
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "add", {
				tenantId: 1001
			});
		});

		it("should add nothing", async () => {
			checkScopeAuthority.mockClear();
			const params = { scope: false };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({ scope: false });
			expect(checkScopeAuthority).toBeCalledTimes(2);
			expect(checkScopeAuthority).toBeCalledWith(
				expect.any(Context),
				"onlyActive",
				"remove",
				{
					status: true
				}
			);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "remove", {
				tenantId: 1001
			});
		});

		it("should add the custom scope", async () => {
			checkScopeAuthority.mockClear();
			const params = { scope: "custom" };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { tenantId: 1001, status: true, a: 5, b: "Yes" },
				scope: "custom"
			});

			expect(scopeFn).toBeCalledTimes(1);
			expect(scopeFn).toBeCalledWith({ tenantId: 1001, status: true, a: 5, b: "Yes" }, ctx, {
				query: { tenantId: 1001, status: true, a: 5, b: "Yes" },
				scope: "custom"
			});

			expect(checkScopeAuthority).toBeCalledTimes(3);
			expect(checkScopeAuthority).toBeCalledWith(
				expect.any(Context),
				"custom",
				"add",
				scopeFn
			);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "onlyActive", "add", {
				status: true
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "add", {
				tenantId: 1001
			});
		});

		it("should add multiple scope", async () => {
			checkScopeAuthority.mockClear();
			const params = { scope: ["custom", "notExist", "public"] };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { tenantId: 1001, status: true, a: 5, b: "Yes", visibility: "public" },
				scope: ["custom", "notExist", "public"]
			});

			expect(checkScopeAuthority).toBeCalledTimes(4);
			expect(checkScopeAuthority).toBeCalledWith(
				expect.any(Context),
				"custom",
				"add",
				scopeFn
			);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "public", "add", {
				visibility: "public"
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "onlyActive", "add", {
				status: true
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "add", {
				tenantId: 1001
			});
		});

		it("should not add desired scope if not permission", async () => {
			checkScopeAuthorityReturnValue = () => false;
			checkScopeAuthority.mockClear();
			const params = { scope: "public" };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({ scope: "public" });

			expect(checkScopeAuthority).toBeCalledTimes(3);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "public", "add", {
				visibility: "public"
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "onlyActive", "add", {
				status: true
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "add", {
				tenantId: 1001
			});
		});

		it("should not disable the tenant scope", async () => {
			checkScopeAuthorityReturnValue = scopeName => scopeName != "tenant";
			checkScopeAuthority.mockClear();
			const params = { scope: false };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({ query: { tenantId: 1001 }, scope: false });
			expect(checkScopeAuthority).toBeCalledTimes(2);
			expect(checkScopeAuthority).toBeCalledWith(
				expect.any(Context),
				"onlyActive",
				"remove",
				{
					status: true
				}
			);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "remove", {
				tenantId: 1001
			});
		});

		it("should not disable the tenant scope", async () => {
			checkScopeAuthorityReturnValue = scopeName => scopeName != "tenant";
			checkScopeAuthority.mockClear();
			const params = { scope: ["public", "-tenant", "-onlyActive"] };

			const res = await svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { tenantId: 1001, visibility: "public" },
				scope: ["public", "-tenant", "-onlyActive"]
			});
			expect(checkScopeAuthority).toBeCalledTimes(3);
			expect(checkScopeAuthority).toBeCalledWith(
				expect.any(Context),
				"onlyActive",
				"remove",
				{
					status: true
				}
			);
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "tenant", "remove", {
				tenantId: 1001
			});
			expect(checkScopeAuthority).toBeCalledWith(expect.any(Context), "public", "add", {
				visibility: "public"
			});
		});
	});

	describe("Test sanitizeParams method", () => {
		const broker = new ServiceBroker({ logger: false, validation: false });
		const svc = broker.createService({
			name: "store",
			mixins: [
				DbService({
					maxLimit: 100,
					defaultPageSize: 25
				})
			]
		});

		it("should not touch the params", () => {
			const res = svc.sanitizeParams({});
			expect(res).toEqual({});
		});

		it("should convert limit & offset to number", () => {
			const res = svc.sanitizeParams({ limit: "5", offset: "10" });
			expect(res).toEqual({ limit: 5, offset: 10 });
		});

		it("should convert page & pageSize to number", () => {
			const res = svc.sanitizeParams({ page: "5", pageSize: "10" });
			expect(res).toEqual({ page: 5, pageSize: 10 });
		});

		it("should convert sort to array", () => {
			const res = svc.sanitizeParams({ sort: "name,createdAt votes" });
			expect(res).toEqual({ sort: ["name", "createdAt", "votes"] });
		});

		it("should convert fields to array", () => {
			const res = svc.sanitizeParams({ fields: "name votes,author" });
			expect(res).toEqual({ fields: ["name", "votes", "author"] });
		});

		it("should convert populate to array", () => {
			const res = svc.sanitizeParams({ populate: "author voters" });
			expect(res).toEqual({ populate: ["author", "voters"] });
		});

		it("should convert searchFields to array", () => {
			const res = svc.sanitizeParams({ searchFields: "name,votes author" });
			expect(res).toEqual({ searchFields: ["name", "votes", "author"] });
		});

		it("should parse query to object", () => {
			const res = svc.sanitizeParams({ query: '{"name": "moleculer" }' });
			expect(res).toEqual({ query: { name: "moleculer" } });
		});

		it("should fill pagination fields", () => {
			const res = svc.sanitizeParams({}, { list: true });
			expect(res).toEqual({ limit: 25, offset: 0, page: 1, pageSize: 25 });
		});

		it("should calc limit & offset from pagination fields", () => {
			const res = svc.sanitizeParams({ page: 3, pageSize: 20 }, { list: true });
			expect(res).toEqual({ limit: 20, offset: 40, page: 3, pageSize: 20 });
		});

		it("should limit the pageSize", () => {
			const res = svc.sanitizeParams({ page: 1, pageSize: 200 }, { list: true });
			expect(res).toEqual({ limit: 100, offset: 0, page: 1, pageSize: 100 });
		});

		it("should limit the limit", () => {
			const res = svc.sanitizeParams({ limit: 400 });
			expect(res).toEqual({ limit: 100 });
		});
	});
});

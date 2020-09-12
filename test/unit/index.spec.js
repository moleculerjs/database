"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../../").Service;

describe("Test DbService", () => {
	describe("Test applyScopes method", () => {
		const broker = new ServiceBroker({ logger: false });
		const scopeFn = jest.fn(q => {
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
					public: {
						visiblity: "public"
					},
					custom: scopeFn
				},

				defaultScopes: ["onlyActive"]
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const ctx = Context.create(broker, null, {});

		it("should add default scope", () => {
			const params = {};

			const res = svc._applyScopes(params, ctx);
			expect(res).toEqual({ query: { status: true } });
		});

		it("should add desired scope", () => {
			const params = { scope: "public" };

			const res = svc._applyScopes(params, ctx);
			expect(res).toEqual({ query: { visiblity: "public" }, scope: "public" });
		});

		it("should add nothing", () => {
			const params = { scope: false };

			const res = svc._applyScopes(params, ctx);
			expect(res).toEqual({ scope: false });
		});

		it("should add the custom scope", () => {
			const params = { scope: "custom" };

			const res = svc._applyScopes(params, ctx);
			expect(res).toEqual({ query: { a: 5, b: "Yes" }, scope: "custom" });

			expect(scopeFn).toBeCalledTimes(1);
			expect(scopeFn).toBeCalledWith({ a: 5, b: "Yes" }, ctx);
		});

		it("should add multiple scope", () => {
			const params = { scope: ["custom", "notExist", "public"] };

			const res = svc._applyScopes(params, ctx);
			expect(res).toEqual({
				query: { a: 5, b: "Yes", visiblity: "public" },
				scope: ["custom", "notExist", "public"]
			});
		});
	});

	describe("Test sanitizeParams method", () => {
		const broker = new ServiceBroker({ logger: false, validation: false });
		const svc = broker.createService(DbService, {
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

"use strict";

const memwatch = require("@icebob/node-memwatch");
const { ServiceBroker } = require("moleculer");
const DbService = require("../..").Service;

const ACCEPTABLE_LIMIT = 1 * 1024 * 1024; // 1MB

jest.setTimeout(60000);

describe("Moleculer Database memory leak test", () => {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService({
		name: "posts",
		mixins: [
			DbService({
				adapter: {
					type: "MongoDB",
					options: { dbName: "db_int_test", collection: "posts" }
				},
				createActions: true
			})
		],
		settings: {
			fields: {
				id: { type: "string", primaryKey: true, columnName: "_id" },
				title: { type: "string", required: true },
				content: { type: "string", required: true }
			}
		}
	});

	const posts = [];

	beforeAll(async () => {
		await broker.start();

		// Warm up
		for (let i = 0; i < 100; i++) {
			await broker.call("posts.create", {
				title: "Post title",
				content: "Post content"
			});
		}
		memwatch.gc();
	});

	afterAll(() => broker.stop());

	async function execute(actionName, params) {
		const hd = new memwatch.HeapDiff();

		const paramsIsFunc = typeof params == "function";

		for (let i = 0; i < 1000; i++) {
			const p = paramsIsFunc ? params() : params;
			const res = await broker.call(actionName, p);
			if (actionName == "posts.create") {
				posts.push(res.id);
			}
		}

		memwatch.gc();
		const diff = hd.end();
		if (diff.change.size_bytes >= ACCEPTABLE_LIMIT) console.log("Diff:", diff); // eslint-disable-line no-console

		expect(diff.change.size_bytes).toBeLessThan(ACCEPTABLE_LIMIT);
	}

	it("should not leak when create records", async () => {
		await execute("posts.create", {
			title: "Post title",
			content: "Post content"
		});
	});

	it("should not leak when find records", async () => {
		await execute("posts.find", { offset: 0, limit: 20 });
	});

	it("should not leak when list records", async () => {
		await execute("posts.list", { page: 1, pageSize: 20 });
	});

	it("should not leak when count records", async () => {
		await execute("posts.count");
	});

	it("should not leak when get a record", async () => {
		await execute("posts.get", { id: posts[5] });
	});

	it("should not leak when resolve a record", async () => {
		await execute("posts.resolve", { id: posts[5] });
	});

	it("should not leak when update a record", async () => {
		await execute("posts.update", { id: posts[5], title: "Modified title" });
	});

	it("should not leak when replace a record", async () => {
		await execute("posts.replace", {
			id: posts[5],
			title: "Replaced title",
			content: "Replaced content"
		});
	});

	it("should not leak when remove a record", async () => {
		console.log("posts", posts.length);
		await execute("posts.remove", () => {
			return { id: posts.pop() };
		});
	});
});

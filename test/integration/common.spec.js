"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../../").Service;

/*const Adapters = Object.keys(require("../../").Adapters).filter(
	s => ["resolve", "register", "Base"].indexOf(s) == -1
);
*/
const Adapters = ["NeDB"];

function equalAtLeast(test, orig) {
	Object.keys(orig).forEach(key => {
		expect(test[key]).toEqual(orig[key]);
	});
}

describe("Integration tests", () => {
	for (const adapterName of Adapters) {
		describe(`Adapter: ${adapterName}`, () => {
			describe("Test adapter via methods", () => {
				const broker = new ServiceBroker({ logger: false });
				const svc = broker.createService({
					name: "posts",
					mixins: [DbService({ createActions: false })]
				});

				beforeAll(() => broker.start());
				afterAll(() => broker.stop());

				const dob = new Date();
				const ctx = Context.create(broker, null);
				let docs = [];

				it("should return empty rows", async () => {
					const rows = await svc.findEntities(ctx, {});
					expect(rows).toEqual([]);
				});

				it("should return zero count", async () => {
					const count = await svc.countEntities(ctx, {});
					expect(count).toEqual(0);
				});

				it("should create new entity", async () => {
					const res = await svc.createEntity(ctx, {
						name: "John Doe",
						age: 42,
						status: true,
						dob
					});
					expect(res).toEqual({
						_id: expect.any(String),
						name: "John Doe",
						age: 42,
						dob,
						status: true
					});
					docs.push(res);
				});

				it("should return the new row", async () => {
					const rows = await svc.findEntities(ctx, {});
					expect(rows).toEqual([docs[0]]);
				});

				it("should return zero count", async () => {
					const count = await svc.countEntities(ctx, {});
					expect(count).toEqual(1);
				});

				it("should create multi entity", async () => {
					const res = await svc.createEntities(ctx, {
						entities: [
							{
								name: "Jane Doe",
								age: 35,
								status: false,
								dob
							},
							{
								name: "Bob Smith",
								age: 51,
								status: true,
								dob
							}
						]
					});
					expect(res.length).toBe(2);
					docs.push(...res);

					expect(res).toEqual([
						{
							_id: expect.any(String),
							name: "Jane Doe",
							age: 35,
							status: false,
							dob
						},
						{
							_id: expect.any(String),
							name: "Bob Smith",
							age: 51,
							status: true,
							dob
						}
					]);
				});

				it("should return all rows", async () => {
					const rows = await svc.findEntities(ctx, {});
					expect(rows).toEqual(expect.arrayContaining(docs));
				});

				it("should return zero count", async () => {
					const count = await svc.countEntities(ctx, {});
					expect(count).toEqual(3);
				});

				it("should filter rows", async () => {
					const rows = await svc.findEntities(ctx, { query: { status: true } });
					expect(rows).toEqual(expect.arrayContaining([docs[0], docs[2]]));
				});

				it("should return count of filtered rows", async () => {
					const count = await svc.countEntities(ctx, { query: { status: true } });
					expect(count).toEqual(2);
				});

				/*it("should update row", async () => {
					const doc = await svc.updateEntity(ctx, {
						id: docs[2]._id,
						name: "Adam Smith",
						age: 49
					});
					expect(doc).toEqual({
						_id: docs[2]._id,
						name: "Adam Smith",
						age: 49,
						status: true,
						dob
					});
				});*/

				it("should remove first row", async () => {
					const res = await svc.removeEntity(ctx, { id: docs[0]._id });
					expect(res).toBe(docs[0]._id);
				});

				it("should return only 2 rows", async () => {
					const rows = await svc.findEntities(ctx, {});
					expect(rows).toEqual(expect.arrayContaining([docs[1], docs[2]]));
				});

				it("should return count of filtered rows", async () => {
					const count = await svc.countEntities(ctx, {});
					expect(count).toEqual(2);
				});
			});

			/*describe("Test adapter via actions", () => {
				const broker = new ServiceBroker({ logger: false });
				const service = broker.createService({
					name: "posts",
					mixins: [DbService({ createActions: false })]
				});

				beforeAll(() => broker.start());
				afterAll(() => broker.stop());

				it("should be started", async () => {
					expect(service).toBeDefined();
				});
			});*/
		});
	}
});

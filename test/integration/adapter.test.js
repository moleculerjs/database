"use strict";

const { ServiceBroker } = require("moleculer");
const ObjectID = require("mongodb").ObjectID;
const { Stream } = require("stream");
const DbService = require("../..").Service;
const { addExpectAnyFields } = require("./utils");

module.exports = (getAdapter, adapterType) => {
	let expectedID;
	if (["Knex"].includes(adapterType)) {
		expectedID = expect.any(Number);
	} else if (["MongoDB"].includes(adapterType)) {
		expectedID = expect.any(ObjectID);
	} else {
		expectedID = expect.any(String);
	}

	describe("Test adapter methods", () => {
		let adapter;
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService({
			name: "posts",
			mixins: [DbService({ adapter: getAdapter({ collection: "posts" }) })],
			settings: {
				createActions: false,
				fields: {
					id: {
						type: "number",
						primaryKey: true,
						columnName: "_id",
						columnType: "integer"
					},
					title: { type: "string", trim: true, required: true },
					content: { type: "string", max: 200, columnType: "string" },
					votes: { type: "number", default: 0, columnType: "integer" },
					comments: { type: "number", default: 0, columnType: "integer" },
					status: { type: "number", default: 1, columnType: "integer" }
				},
				indexes: [{ fields: { title: "text", content: "text" } }]
			},

			async started() {
				adapter = await this.getAdapter();

				if (adapterType == "Knex") {
					await adapter.createTable(null, { createIndexes: true });
				} else {
					await this.createIndexes(adapter);
				}

				await this.clearEntities();
			}
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		let docs = [];

		describe("Set up", () => {
			it("should return empty array", async () => {
				const rows = await adapter.find();
				expect(rows).toEqual([]);

				const count = await adapter.count();
				expect(count).toEqual(0);
			});
		});

		describe("Common flow", () => {
			it("should create an entity", async () => {
				const res = await adapter.insert({
					title: "First post",
					content: "Content of 1rd post",
					votes: 5,
					comments: 0,
					status: 1
				});
				expect(res).toEqual({
					_id: expectedID,
					title: "First post",
					content: "Content of 1rd post",
					votes: 5,
					comments: 0,
					status: 1
				});
				docs.push(res);
			});

			it("should create more entities and return IDs", async () => {
				const res = await adapter.insertMany([
					{
						title: "Second post",
						content: "Content of 2nd post",
						votes: 0,
						comments: 5,
						status: 0
					},
					{
						title: "Third post",
						content: "Content of 3rd post",
						votes: 10,
						comments: 2,
						status: 1
					}
				]);
				expect(res).toEqual([expectedID, expectedID]);

				const entities = await adapter.findByIds(res);

				expect(entities).toEqual(
					expect.arrayContaining([
						{
							_id: expectedID,
							title: "Second post",
							content: "Content of 2nd post",
							votes: 0,
							comments: 5,
							status: 0
						},
						{
							_id: expectedID,
							title: "Third post",
							content: "Content of 3rd post",
							votes: 10,
							comments: 2,
							status: 1
						}
					])
				);
				docs.push(...entities);
			});

			it("should create more entities and return entities", async () => {
				const res = await adapter.insertMany(
					[
						{
							title: "Forth post",
							content: "Content of 4th post",
							votes: 3,
							comments: 13,
							status: 1
						},
						{
							title: "Fifth post",
							content: "Content of 5th post",
							votes: 7,
							comments: 3,
							status: 0
						}
					],
					{ returnEntities: true }
				);

				expect(res).toEqual(
					expect.arrayContaining([
						{
							_id: expectedID,
							title: "Forth post",
							content: "Content of 4th post",
							votes: 3,
							comments: 13,
							status: 1
						},
						{
							_id: expectedID,
							title: "Fifth post",
							content: "Content of 5th post",
							votes: 7,
							comments: 3,
							status: 0
						}
					])
				);
				docs.push(...res);
			});

			it("should find all records", async () => {
				const rows = await adapter.find();
				expect(rows).toEqual(expect.arrayContaining(docs));

				const count = await adapter.count();
				expect(count).toEqual(5);
			});

			it("should find by query", async () => {
				const rows = await adapter.find({ query: { status: 0 }, sort: "-votes" });
				expect(rows).toEqual([docs[4], docs[1]]);
			});

			it("should find with sort", async () => {
				const rows = await adapter.find({ sort: ["status", "-votes"] });
				expect(rows).toEqual([docs[4], docs[1], docs[2], docs[0], docs[3]]);
			});

			it("should find with limit & offset", async () => {
				const rows = await adapter.find({ sort: ["votes"], limit: 2, offset: 2 });
				expect(rows).toEqual([docs[0], docs[4]]);
			});

			it("should find with search", async () => {
				const rows = await adapter.find({
					search: "th post",
					searchFields: ["title"],
					sort: ["title"]
				});
				if (adapterType == "MongoDB") {
					expect(rows).toEqual(
						expect.arrayContaining([
							addExpectAnyFields(docs[4], { _score: Number }),
							addExpectAnyFields(docs[3], { _score: Number })
						])
					);
				} else {
					expect(rows).toEqual([docs[4], docs[3]]);
				}
			});

			it("should find by ID", async () => {
				const rows = await adapter.findById(docs[3]._id);
				expect(rows).toEqual(docs[3]);
			});

			it("should find by IDs", async () => {
				const rows = await adapter.findByIds([docs[3]._id, docs[1]._id, docs[4]._id]);
				expect(rows).toEqual(expect.arrayContaining([docs[3], docs[1], docs[4]]));
			});

			it("should find one", async () => {
				const row = await adapter.findOne({ query: { votes: 10, status: 1 } });
				expect(row).toEqual(docs[2]);
			});

			it("should find one with sort", async () => {
				const row = await adapter.findOne({ query: { status: 1 }, sort: "votes" });
				expect(row).toEqual(docs[3]);
			});

			it("should count by query", async () => {
				const row = await adapter.count({ query: { status: 1 } });
				expect(row).toBe(3);
			});

			it("should update by ID", async () => {
				const row = await adapter.updateById(docs[1]._id, {
					title: "Modified second post",
					votes: 1,
					comments: 9
				});
				expect(row).toEqual({
					_id: docs[1]._id,
					title: "Modified second post",
					content: "Content of 2nd post",
					votes: 1,
					comments: 9,
					status: 0
				});
				docs[1] = row;

				const res = await adapter.findById(docs[1]._id);
				expect(res).toEqual(row);
			});

			it("should update many", async () => {
				const res = await adapter.updateMany(
					{ status: 0 },
					{
						votes: 3
					}
				);
				expect(res).toBe(2);

				const res2 = await adapter.findById(docs[1]._id);
				expect(res2).toEqual({
					_id: docs[1]._id,
					content: "Content of 2nd post",
					title: "Modified second post",
					votes: 3,
					comments: 9,
					status: 0
				});
			});

			//if (adapterType == "MongoDB") {
			it("should raw update by ID", async () => {
				const row = await adapter.updateById(
					docs[1]._id,
					{
						$set: {
							title: "Raw modified second post"
						},
						$inc: { votes: 1, comments: -2 }
					},
					{ raw: true }
				);
				expect(row).toEqual({
					_id: docs[1]._id,
					title: "Raw modified second post",
					content: "Content of 2nd post",
					votes: 4,
					comments: 7,
					status: 0
				});
				docs[1] = row;

				const res = await adapter.findById(docs[1]._id);
				expect(res).toEqual(row);
			});

			it("should raw update many", async () => {
				const res = await adapter.updateMany(
					{ status: 0 },
					{
						$set: {
							title: "Raw many modified second post"
						},
						$inc: { votes: 2, comments: -1 }
					},
					{ raw: true }
				);
				expect(res).toBe(2);

				const res2 = await adapter.findById(docs[1]._id);
				expect(res2).toEqual({
					_id: docs[1]._id,
					content: "Content of 2nd post",
					status: 0,
					title: "Raw many modified second post",
					votes: 6,
					comments: 6
				});
			});
			//}

			it("Update docs in local store", async () => {
				docs[0] = await adapter.findById(docs[0]._id);
				docs[1] = await adapter.findById(docs[1]._id);
				docs[2] = await adapter.findById(docs[2]._id);
				docs[3] = await adapter.findById(docs[3]._id);
				docs[4] = await adapter.findById(docs[4]._id);
			});

			it("should find all records", async () => {
				const rows = await adapter.find();
				expect(rows).toEqual(expect.arrayContaining(docs));
			});

			it("should replace by ID", async () => {
				const row = await adapter.replaceById(docs[3]._id, {
					title: "Modified forth post",
					content: "Content of modified 4th post",
					votes: 99,
					comments: 66,
					status: 0
				});
				expect(row).toEqual({
					_id: docs[3]._id,
					title: "Modified forth post",
					content: "Content of modified 4th post",
					votes: 99,
					comments: 66,
					status: 0
				});
				docs[3] = row;

				const res = await adapter.findById(docs[3]._id);
				expect(res).toEqual(row);
			});

			it("should remove by ID", async () => {
				const row = await adapter.removeById(docs[3]._id);
				expect(row).toBe(docs[3]._id);

				let res = await adapter.findById(docs[3]._id);
				expect(res == null).toBeTruthy();

				res = await adapter.count();
				expect(res).toBe(4);
			});

			it("should remove many", async () => {
				let res = await adapter.removeMany({ status: 1 });
				expect(res).toBe(2);

				res = await adapter.find({ sort: "comments" });
				expect(res).toEqual([docs[4], docs[1]]);

				res = await adapter.count();
				expect(res).toBe(2);
			});

			it("should clear all records", async () => {
				let res = await adapter.clear();
				expect(res).toBe(2);

				res = await adapter.find();
				expect(res).toEqual([]);

				res = await adapter.count();
				expect(res).toBe(0);
			});
		});
	});

	// TODO Knex extra tests for
	// - createQuery whereXY
	// - createTable?
};

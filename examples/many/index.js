"use strict";

const { ServiceBroker } = require("moleculer");
const DbService = require("../../index").Service;
const path = require("path");
const fs = require("fs");

const Fakerator = require("fakerator");
const fakerator = new Fakerator();

// Create broker
const broker = new ServiceBroker();

const sqliteFilename = path.join(__dirname, "db.sqlite3");

if (fs.existsSync(sqliteFilename)) fs.unlinkSync(sqliteFilename);
if (fs.existsSync(sqliteFilename + "-journal")) fs.unlinkSync(sqliteFilename + "-journal");

// Create a service
const svc = broker.createService({
	name: "posts",
	mixins: [
		DbService({
			adapter: {
				//type: "MongoDB"
				type: "Knex",
				options: {
					knex: {
						client: "sqlite3",
						connection: {
							filename: sqliteFilename
						},
						useNullAsDefault: true,
						pool: {
							min: 1,
							max: 1
						},
						log: {
							warn(message) {},
							error(message) {},
							deprecate(message) {},
							debug(message) {}
						}
					}
				}
			}
		})
	],

	settings: {
		fields: {
			id: { type: "string", primaryKey: true, columnName: "_id" },
			title: {
				type: "string",
				max: 255,
				trim: true,
				required: true
			},
			content: { type: "string" },
			votes: { type: "number", integer: true, min: 0, default: 0, columnType: "integer" },
			status: { type: "boolean", default: true },
			createdAt: {
				type: "number",
				readonly: true,
				onCreate: () => Date.now(),
				columnType: "real"
			},
			updatedAt: {
				type: "number",
				readonly: true,
				onUpdate: () => Date.now(),
				columnType: "real"
			}
		}
	},
	async started() {
		const adapter = await this.getAdapter();
		await adapter.createTable();

		await this.clearEntities();
	}
});

// Start server
broker
	.start()
	.then(async () => {
		// Create posts

		const COUNT = 1000;
		const POSTS = fakerator.times(fakerator.entity.post, COUNT);

		const span = broker.tracer.startSpan("create posts");

		/*for (const post of POSTS) {
			await broker.call("posts.create", post);
		}*/
		const res = await broker.call("posts.createMany", POSTS);
		span.finish();

		//broker.logger.info("Inserted result", res);
		broker.logger.info(`Created ${COUNT} posts. Time:`, span.duration.toFixed(2), "ms");

		// List posts with pagination
		const posts = await broker.call("posts.list", {
			fields: ["id", "title", "votes", "status"]
		});
		broker.logger.info("List:", posts);
	})
	.catch(err => broker.logger.error(err));

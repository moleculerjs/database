"use strict";

const { ServiceBroker } = require("moleculer");
const { inspect } = require("util");
const DbService = require("../../index").Service;

// Create broker
const broker = new ServiceBroker({
	logger: {
		type: "Console",
		options: {
			objectPrinter: obj =>
				inspect(obj, {
					breakLength: 50,
					colors: true,
					depth: 3
				})
		}
	}
});

// Create a service
broker.createService({
	name: "posts",
	mixins: [
		DbService({
			adapter: {
				type: "Knex",
				options: {
					knex: {
						client: "sqlite3",
						debug: true,
						connection: {
							//filename: "./test.db"
							filename: ":memory:"
						}
					}
				}
			}
		})
	],
	settings: {
		fields: {
			id: { type: "number", primaryKey: true, columnName: "id" },
			title: { type: "string", required: true },
			content: { type: "string", required: false }
		}
	},

	async started() {
		const adapter = await this.getAdapter();
		await adapter.client.schema.createTable("posts", function (table) {
			table.increments("id");
			table.string("title");
			table.string("content");
			//table.timestamps();
		});
	}
});

// Start server
broker.start().then(async () => {
	broker.logger.info(
		"Create 1: ",
		await broker.call("posts.create", { title: "First post", content: "First content" })
	);
	broker.logger.info(
		"Create 2: ",
		await broker.call("posts.create", { title: "Second post", content: "Second content" })
	);
	broker.logger.info(
		"Create 3: ",
		await broker.call("posts.create", { title: "Third post", content: "Third content" })
	);
	broker.logger.info(
		"Create 4: ",
		await broker.call("posts.create", { title: "Fourth post", content: "Fourth content" })
	);
	broker.logger.info(
		"Create 5: ",
		await broker.call("posts.create", { title: "Fifth post", content: "Fifth content" })
	);

	broker.logger.info("Find: ", await broker.call("posts.find"));
	broker.logger.info("Count: ", await broker.call("posts.count"));
	broker.logger.info("Get 2: ", await broker.call("posts.get", { id: 2 }));

	broker.logger.info(
		"Update 2: ",
		await broker.call("posts.update", {
			id: 2,
			title: "Modified second post"
		})
	);
	broker.logger.info("Get 2: ", await broker.call("posts.get", { id: 2 }));

	broker.logger.info(
		"Replace 3: ",
		await broker.call("posts.replace", {
			id: 3,
			title: "Modified third post",
			content: "Modified third content"
		})
	);
	broker.logger.info("Get 3: ", await broker.call("posts.get", { id: 3 }));

	broker.logger.info(
		"Search: ",
		await broker.call("posts.find", { search: "Modified", searchFields: ["title", "content"] })
	);

	broker.logger.info("Remove 4: ", await broker.call("posts.remove", { id: 4 }));

	broker.logger.info("List: ", await broker.call("posts.list"));
});

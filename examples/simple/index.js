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
	mixins: [DbService()],
	settings: {
		fields: {
			id: { type: "string", primaryKey: true, columnName: "_id" },
			title: { type: "string", required: true },
			content: { type: "string", required: false }
		}
	}
});

// Start server
broker.start().then(async () => {
	await broker.call("posts.create", { title: "First post", content: "First content" });
	await broker.call("posts.create", { title: "Second post", content: "Second content" });
	await broker.call("posts.create", { title: "Third post", content: "Third content" });
	await broker.call("posts.create", { title: "Fourth post", content: "Fourth content" });
	await broker.call("posts.create", { title: "Fifth post", content: "Fifth content" });

	const res = await broker.call("posts.find");
	broker.logger.info("Res: ", res);
});

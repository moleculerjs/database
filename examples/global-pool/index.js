"use strict";

const { ServiceBroker } = require("moleculer");
const DbService = require("../../index").Service;

const broker = new ServiceBroker();

const adapter = {
	type: "MongoDB",
	options: "mongodb://localhost:27017/example-pool"
};

const fields = {
	id: { type: "string", primaryKey: true, columnName: "_id" },
	title: "string"
};

broker.createService({
	name: "posts",
	mixins: [DbService({ adapter })],
	settings: { fields }
});
broker.createService({
	name: "users",
	mixins: [DbService({ adapter })],
	settings: { fields }
});
broker.createService({
	name: "comments",
	mixins: [DbService({ adapter })],
	settings: { fields }
});
broker.createService({
	name: "likes",
	mixins: [DbService({ adapter })],
	settings: { fields }
});

// Start server
broker
	.start()
	.then(() => broker.repl())
	.then(async () => {
		await broker.call("posts.list");
		await broker.call("users.list");
		await broker.call("comments.list");
		await broker.call("likes.list");

		await broker.Promise.delay(5000);

		await broker.destroyService("posts");
		await broker.Promise.delay(1000);
		await broker.call("users.list");
		await broker.destroyService("users");
		await broker.Promise.delay(1000);
		await broker.destroyService("comments");
		await broker.Promise.delay(1000);
		await broker.destroyService("likes");
	})
	.catch(err => broker.logger.error(err));

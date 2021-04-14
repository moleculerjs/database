"use strict";

const { ServiceBroker } = require("moleculer");
const { inspect } = require("util");
const DbService = require("../../index").Service;
const MyDatastore = require("nedb");

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
				type: "NeDB",
				options: { neDB: new MyDatastore({ filename: "./posts.db" }) }
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
			votes: { type: "number", integer: true, min: 0, default: 0 },
			status: { type: "boolean", default: true },
			createdAt: { type: "number", readonly: true, onCreate: () => Date.now() },
			updateAt: { type: "number", readonly: true, onUpdate: () => Date.now() }
		}
	},

	async started() {
		await this.clearEntities();
	}
});

// Start server
broker
	.start()
	.then(async () => {
		// Create posts
		await broker.call("posts.create", {
			title: "First post",
			content: "First content",
			votes: 10,
			status: true
		});
		await broker.Promise.delay(100);

		await broker.call("posts.create", {
			title: "Second post",
			content: "Second content",
			votes: 7,
			status: true
		});
		await broker.Promise.delay(100);

		await broker.call("posts.create", {
			title: "Third post",
			content: "Third content",
			votes: 1,
			status: false
		});
		await broker.Promise.delay(100);

		await broker.call("posts.create", {
			title: "Fourth post",
			content: "Fourth content",
			votes: 3,
			status: true
		});
		await broker.Promise.delay(100);

		await broker.call("posts.create", {
			title: "Fifth post",
			content: "Fifth content",
			status: false
		});

		// Get all posts
		let posts = await broker.call("posts.find", { limit: 2, sort: "-createdAt" });
		console.log("Find:", posts);

		// List posts with pagination
		const list = await broker.call("posts.list", { page: 1, pageSize: 10 });
		console.log("List:", list);

		// Get a post by ID
		let post = await broker.call("posts.get", { id: posts[0].id });
		console.log("Get:", post);

		// Update the post
		post = await broker.call("posts.update", { id: post.id, title: "Modified post" });
		console.log("Updated:", post);

		// Delete a user
		const res = await broker.call("posts.remove", { id: post.id });
		console.log("Deleted:", res);
	})
	.catch(err => broker.logger.error(err));

/* eslint-disable no-console */
"use strict";

/**
 * It's a simple example which demonstrates how to
 * use this services and make CRUD actions.
 */

const { ServiceBroker } = require("moleculer");
const { inspect } = require("util");
const DbService = require("../../index").Service;

// Create broker
const broker = new ServiceBroker({
	logger: {
		type: "Console",
		options: {
			level: {
				POSTS: "debug",
				"*": "info"
			},
			objectPrinter: obj =>
				inspect(obj, {
					breakLength: 50,
					colors: true,
					depth: 3
				})
		}
	},
	metrics: {
		enabled: false,
		reporter: {
			type: "Console",
			options: {
				includes: ["moleculer.database.**"]
			}
		}
	},

	tracing: {
		enabled: false,
		exporter: {
			type: "Console"
		}
	}
});

// Create a service
broker.createService({
	name: "posts",
	mixins: [
		DbService({
			adapter: {
				type: "MongoDB"
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
			updatedAt: { type: "number", readonly: true, onUpdate: () => Date.now() }
		}
	}
});

// Start server
broker
	.start()
	.then(async () => {
		// Create a new post
		let post = await broker.call("posts.create", {
			title: "My first post",
			content: "Content of my first post..."
		});
		console.log("First post:", post);

		await broker.Promise.delay(500);

		post = await broker.call("posts.create", {
			title: "My second post",
			content: "Content of my second post...",
			votes: 3
		});
		console.log("Second post:", post);

		post = await broker.call("posts.create", {
			title: "Third post",
			content: "Content of my 3rd post...",
			status: false
		});
		//console.log("3rd post:", post);

		// Get all posts
		//let posts = await broker.call("posts.find", { limit: 2, sort: "-createdAt" });
		let posts = await broker.call("posts.find", { query: { status: false } });
		console.log("Find:", posts);

		// List posts with pagination
		posts = await broker.call("posts.list", { page: 1, pageSize: 10 });
		console.log("List:", posts);

		// Get a post by ID
		post = await broker.call("posts.get", { id: post.id });
		console.log("Get:", post);

		// Update the post
		post = await broker.call("posts.update", { id: post.id, title: "Modified post" });
		console.log("Updated:", post);

		// Delete a user
		const res = await broker.call("posts.remove", { id: post.id });
		console.log("Deleted:", res);
	})
	.then(() => broker.repl())
	.catch(err => {
		broker.logger.error(err);
		process.exit(1);
	});

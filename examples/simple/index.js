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
			adapter: "NeDB"
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
		console.log("3rd post:", post);

		// Get all posts
		//let posts = await broker.call("posts.find", { limit: 2, sort: "-createdAt" });
		let posts = await broker.call("posts.find", { query: { status: false } });
		console.log("Find:", posts);

		// List posts with pagination
		post = await broker.call("posts.list", { page: 1, pageSize: 10 });
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

		/*
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
	*/
	})
	.catch(err => broker.logger.error(err));

"use strict";

/**
 * This example demonstrates how to use the Knex
 * migration with this service.
 * The migrations scripts are in the "migration" folder.
 */

const { ServiceBroker } = require("moleculer");
const DbService = require("../../index").Service;

const broker = new ServiceBroker();

broker.createService({
	name: "posts",
	mixins: [
		DbService({
			adapter: {
				type: "Knex",
				options: {
					knex: {
						client: "sqlite3",
						connection: {
							filename: "posts.db"
						},
						useNullAsDefault: true
					}
				}
			}
		})
	],

	settings: {
		fields: {
			id: { type: "number", primaryKey: true },
			title: {
				type: "string",
				max: 255,
				trim: true,
				required: true
			},
			content: { type: "string" },
			author: { type: "number" },
			votes: { type: "number", integer: true, min: 0, default: 0 },
			status: { type: "boolean", default: true },
			createdAt: { type: "number", readonly: true, onCreate: () => Date.now() },
			updatedAt: { type: "number", readonly: true, onUpdate: () => Date.now() }
		}
	},

	async started() {
		const adapter = await this.getAdapter();

		// Migrate to the latest version.
		await adapter.client.migrate.latest();
	}
});

// Start server
broker
	.start()
	.then(async () => {
		broker.repl();
		// Create a new post
		/*let post = await broker.call("posts.create", {
			title: "My first post",
			content: "Content of my first post..."
		});*/

		// Get all posts
		let posts = await broker.call("posts.find");
		console.log("Find:", posts);
	})
	.catch(err => broker.logger.error(err));

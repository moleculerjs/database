/* eslint-disable no-console */
"use strict";

/**
 * It's an example to test the connect/disconnect logic of adapters.
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
			votes: { type: "number", integer: true, min: 0, default: 0, columnType: "int" },
			status: { type: "boolean", default: true }
		}
	},

	async started() {
		this.logger.info("Creating multiple adapters...");
		const adapters = await Promise.all([
			this.getAdapter(),
			this.getAdapter(),
			this.getAdapter()
		]);
		this.logger.info(
			"Adapters created.",
			adapters.map(a => a.constructor.name)
		);
	}
});

// Start server
broker
	.start()
	.then(() => broker.repl())
	.catch(err => {
		broker.logger.error(err);
		process.exit(1);
	});

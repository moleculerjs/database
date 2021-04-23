"use strict";

const { ServiceBroker } = require("moleculer");
const { inspect } = require("util");
const DbService = require("../../index").Service;

const tenant1Meta = { meta: { tenantId: 1001 }, broadcast: () => {} };
const tenant2Meta = { meta: { tenantId: 1002 }, broadcast: () => {} };
const tenant3Meta = { meta: { tenantId: 1003 }, broadcast: () => {} };

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
				type: "MongoDB",
				options: {
					uri: "mongodb://localhost:27017",
					dbName: "tenants",
					collection: "posts"
				}
			}
		})
	],
	settings: {
		fields: {
			title: { type: "string", required: true },
			content: { type: "string", required: false },
			tenantId: {
				type: "number",
				set: (value, entity, field, ctx) => ctx.meta.tenantId,
				required: true
			}
		},
		scopes: {
			tenant(q, ctx) {
				const tenantId = ctx.meta.tenantId;
				if (!tenantId) throw new Error("Missing tenantId!");

				q.tenantId = ctx.meta.tenantId;
				return q;
			}
		},
		defaultScopes: ["tenant"]
	},
	methods: {
		/*getAdapterByContext(ctx) {
			const tenantId = ctx.meta.tenantId;
			if (!tenantId) throw new Error("Missing tenantId!");

			return [
				tenantId,
				{
					type: "MongoDB",
					options: {
						uri: "mongodb://localhost:27017",
						dbName: `tenant-posts-${tenantId}`,
						collection: `posts`
					}
				}
			];
		}*/
	},
	async started() {
		await this.clearEntities(tenant1Meta);
		await this.clearEntities(tenant2Meta);
		await this.clearEntities(tenant3Meta);
	}
});

// Start server
broker.start().then(async () => {
	await broker.call("posts.find", null, tenant1Meta);

	await broker.call(
		"posts.create",
		{ title: "First post", content: "First content" },
		tenant1Meta
	);
	await broker.call(
		"posts.create",
		{ title: "Second post", content: "Second content" },
		tenant2Meta
	);
	await broker.call(
		"posts.create",
		{ title: "Third post", content: "Third content" },
		tenant3Meta
	);
	await broker.call(
		"posts.create",
		{ title: "Fourth post", content: "Fourth content" },
		tenant1Meta
	);
	await broker.call(
		"posts.create",
		{ title: "Fifth post", content: "Fifth content" },
		tenant2Meta
	);

	broker.logger.info("Find tenant1: ", await broker.call("posts.find", null, tenant1Meta));
	broker.logger.info("Find tenant2: ", await broker.call("posts.find", null, tenant2Meta));
	broker.logger.info("Find tenant3: ", await broker.call("posts.find", null, tenant3Meta));
});

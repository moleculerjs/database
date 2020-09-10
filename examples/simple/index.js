"use strict";

const { ServiceBroker } = require("moleculer");
const { inspect } = require("util");
const DbService = require("../../index");

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

// Load my service
const svc = broker.createService({
	name: "posts",
	mixins: [DbService()]
});

// Start server
broker.start().then(() => {
	broker.logger.info(svc.schema);

	/* Call action
	broker
		.call("database.test", { name: "John Doe" })
		.then(broker.logger.info)
		.catch(broker.logger.error);
	*/
});

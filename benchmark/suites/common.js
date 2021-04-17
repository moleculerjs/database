"use strict";

const Benchmarkify = require("../benchmarkify");
const _ = require("lodash");
const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;
const { writeResult } = require("../utils");
const { generateMarkdown } = require("../generate-result");

const Fakerator = require("fakerator");
const fakerator = new Fakerator();

const COUNT = 1000;
const SUITE_NAME = "common";

const Adapters = [
	{ name: "NeDB (memory)", type: "NeDB" },
	{
		name: "MongoDB",
		ref: true,
		type: "MongoDB",
		options: { dbName: "bench-test", collection: "users" }
	},
	{
		name: "Knex SQLite (memory)",
		type: "Knex",
		options: {
			knex: {
				client: "sqlite3",
				connection: {
					filename: ":memory:"
				},
				useNullAsDefault: true,
				log: {
					warn(message) {},
					error(message) {},
					deprecate(message) {},
					debug(message) {}
				}
			}
		}
	}
];

const benchmark = new Benchmarkify("Moleculer Database benchmark - Common", {
	description:
		"This is a common benchmark which create, list, get, update, replace and delete entities via service actions.",
	meta: { type: SUITE_NAME, adapters: _.cloneDeep(Adapters), count: COUNT }
});

const suites = [];

const UserServiceSchema = (serviceName, adapterDef) => {
	return {
		name: serviceName,
		mixins: [DbService({ adapter: adapterDef })],
		settings: {
			fields: {
				id: { type: "string", primaryKey: true, columnName: "_id" },
				firstName: { type: "string" },
				lastName: { type: "string" },
				fullName: {
					type: "string",
					get: (_, entity) => entity.firstName + " " + entity.lastName
				},
				username: { type: "string" },
				email: { type: "string" },
				password: { type: "string", hidden: true },
				status: { type: "number", default: 1, columnType: "integer" }
			}
		},
		async started() {
			const adapter = await this.getAdapter();
			if (adapterDef.type == "Knex") {
				await adapter.createTable();
			}

			await this.clearEntities();
		}
	};
};

const USERS = fakerator.times(fakerator.entity.user, COUNT * 5);
const USERS_LEN = USERS.length;

const broker = new ServiceBroker({ logger: false });
Adapters.forEach((adapterDef, i) => {
	const adapterName = adapterDef.name || adapterDef.type;
	const serviceName = `users-${i}`;
	adapterDef.svcName = serviceName;
	adapterDef.svc = broker.createService(UserServiceSchema(serviceName, adapterDef));
});

// --- ENTITY CREATION ---
(function () {
	const bench = benchmark.createSuite("Entity creation", {
		description: "This test calls the `create` action to create an entity.",
		meta: {
			type: "create"
		}
	});
	suites.push(bench);
	const tearDowns = [];
	bench.tearDown(tearDowns);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const svc = adapterDef.svc;
		const actionName = `${adapterDef.svcName}.create`;

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			broker.call(actionName, USERS[c++ % USERS_LEN]).then(done);
		});

		// Clear all entities and create only the specified count.
		tearDowns.push(async () => {
			const ctx = Context.create(broker, null, {});
			await svc.clearEntities(ctx);
			await svc.createEntities(ctx, USERS.slice(0, COUNT));
		});
	});
})();

// --- ENTITY FINDING ---
(function () {
	const bench = benchmark.createSuite("Entity finding", {
		description: "This test calls the `find` action to get random 20 entities.",
		meta: {
			type: "find"
		}
	});
	suites.push(bench);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const actionName = `${adapterDef.svcName}.find`;

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			const offset = Math.floor(Math.random() * (USERS_LEN - 20));
			broker.call(actionName, { offset, limit: 20 }).then(done);
		});
	});
})();

// --- ENTITY LISTING ---
(function () {
	const bench = benchmark.createSuite("Entity listing", {
		description: "This test calls the `users.list` service action to random 20 entities.",
		meta: {
			type: "list"
		}
	});
	suites.push(bench);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const actionName = `${adapterDef.svcName}.list`;

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			const maxPage = COUNT / 20 - 2;
			const page = Math.floor(Math.random() * maxPage) + 1;
			broker.call(actionName, { page, pageSize: 20 }).then(done);
		});
	});
})();

// --- ENTITY COUNTING ---
(function () {
	const bench = benchmark.createSuite("Entity counting", {
		description:
			"This test calls the `users.count` service action to get the number of entities.",
		meta: {
			type: "count"
		}
	});
	suites.push(bench);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const actionName = `${adapterDef.svcName}.count`;

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			broker.call(actionName).then(done);
		});
	});
})();

// --- ENTITY GETTING ---
(function () {
	const bench = benchmark.createSuite("Entity getting", {
		description: "This test calls the `users.get` service action to get a random entity.",
		meta: {
			type: "get"
		}
	});
	suites.push(bench);
	const setups = [];
	bench.setup(setups);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const actionName = `${adapterDef.svcName}.get`;

		let docs = null;
		setups.push(async () => {
			docs = await broker.call(`${adapterDef.svcName}.find`);
		});

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			return broker.call(actionName, { id: entity.id }).then(done);
		});
	});
})();

// --- ENTITY RESOLVING ---
(function () {
	const bench = benchmark.createSuite("Entity resolving", {
		description:
			"This test calls the `users.resolve` service action to resolve a random entity.",
		meta: {
			type: "resolve"
		}
	});
	suites.push(bench);
	const setups = [];
	bench.setup(setups);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const actionName = `${adapterDef.svcName}.resolve`;

		let docs = null;
		setups.push(async () => {
			docs = await broker.call(`${adapterDef.svcName}.find`);
		});

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			return broker.call(actionName, { id: entity.id }).then(done);
		});
	});
})();

// --- ENTITY UPDATING ---
(function () {
	const bench = benchmark.createSuite("Entity updating", {
		description: "This test calls the `users.update` service action to update a entity.",
		meta: {
			type: "update"
		}
	});
	suites.push(bench);
	const setups = [];
	bench.setup(setups);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const actionName = `${adapterDef.svcName}.update`;

		let docs = null;
		setups.push(async () => {
			docs = await broker.call(`${adapterDef.svcName}.find`);
		});

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			const newStatus = Math.round(Math.random());
			return broker.call(actionName, { id: entity.id, status: newStatus }).then(done);
		});
	});
})();

// --- ENTITY REPLACING ---
(function () {
	const bench = benchmark.createSuite("Entity replacing", {
		description:
			"This test calls the `users.replace` service action to replace a random entity.",
		meta: {
			type: "replace"
		}
	});
	suites.push(bench);
	const setups = [];
	bench.setup(setups);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const actionName = `${adapterDef.svcName}.replace`;

		let docs = null;
		setups.push(async () => {
			docs = await broker.call(`${adapterDef.svcName}.find`);
		});

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			entity.status = Math.round(Math.random());
			return broker.call(actionName, entity).then(done);
		});
	});
})();

// --- ENTITY DELETING ---
(function () {
	const bench = benchmark.createSuite("Entity deleting", {
		description: "This test calls the `users.remove` service action to delete a random entity.",
		meta: {
			type: "remove"
		}
	});
	suites.push(bench);
	const setups = [];
	bench.setup(setups);

	Adapters.forEach(adapterDef => {
		const adapterName = adapterDef.name || adapterDef.type;
		const actionName = `${adapterDef.svcName}.remove`;

		let docs = null;
		setups.push(async () => {
			docs = await broker.call(`${adapterDef.svcName}.find`);
		});

		let c = 0;
		bench[adapterDef.ref ? "ref" : "add"](adapterName, done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			return broker.call(actionName, { id: entity.id }).catch(done).then(done);
		});
	});
})();

async function run() {
	await broker.start();
	try {
		console.log("Running suites...");
		const results = await benchmark.run(suites);
		console.log("Save the results to file...");
		writeResult(SUITE_NAME, "benchmark_results.json", results);
		console.log("Generate README.md...");
		await generateMarkdown(SUITE_NAME);
	} finally {
		await broker.stop();
	}
	console.log("Done.");
}

run();

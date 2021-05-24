"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;
const { writeResult } = require("../utils");
const { generateMarkdown } = require("../generate-result");

const Fakerator = require("fakerator");
const fakerator = new Fakerator();

const Benchmarkify = require("../benchmarkify");
const benchmark = new Benchmarkify("Moleculer Database benchmark - Transformation benchmark", {
	description:
		"This is a transformation benchmark. It tests all service methods with and without transformation."
}).printHeader();

const COUNT = 1000;
const SUITE_NAME = "transform";

const suites = [];

const UserServiceSchema = {
	name: "users",
	mixins: [
		DbService({
			adapter: { type: "NeDB" }
		})
	],
	settings: {
		fields: {
			id: { type: "string", primaryKey: true, columnName: "_id" },
			firstName: { type: "string" },
			lastName: { type: "string" },
			fullName: {
				type: "string",
				get: ({ entity }) => entity.firstName + " " + entity.lastName
			},
			username: { type: "string" },
			email: { type: "string" },
			password: { type: "string", hidden: true },
			status: { type: "number", default: 1 }
		}
	}
};

const bench1 = benchmark.createSuite("Entity creation");
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);
	const ctx = Context.create(broker, null, {});

	const entity1 = {
		firstName: "John",
		lastName: "Doe",
		username: "john.doe81",
		email: "john.doe@moleculer.services",
		password: "pass1234",
		status: 1
	};

	bench.setup(() => broker.start());
	bench.tearDown(() => broker.stop());

	bench.ref("Without transform", done =>
		svc.createEntity(ctx, entity1, { transform: false }).then(done)
	);
	bench.add("With transform", done => svc.createEntity(ctx, entity1).then(done));
})(bench1);
suites.push(bench1);

const bench2 = benchmark.createSuite("Entity listing");
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT), {
			returnEntities: true
		});
	});
	bench.tearDown(() => broker.stop());

	const ctx = Context.create(broker, null, {});

	bench.ref("Without transform", done => {
		const offset = Math.floor(Math.random() * 80);
		return svc.findEntities(ctx, { offset, limit: 20 }, { transform: false }).then(done);
	});

	bench.add("With transform", done => {
		const offset = Math.floor(Math.random() * 80);
		return svc.findEntities(ctx, { offset, limit: 20 }).then(done);
	});
})(bench2);
suites.push(bench2);

const bench3 = benchmark.createSuite("Entity counting");
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT), {
			returnEntities: true
		});
	});
	bench.tearDown(() => broker.stop());

	const ctx = Context.create(broker, null, {});

	bench.ref("Without transform", done => {
		return svc.countEntities(ctx).then(done);
	});

	/*bench.add("Direct adapter access", done => {
		return svc.adapter.collection.countDocuments().then(done);
	});*/
})(bench3);
suites.push(bench3);

const bench4 = benchmark.createSuite("Entity getting");
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT), {
			returnEntities: true
		});
	});
	bench.tearDown(() => broker.stop());

	const ctx = Context.create(broker, null, {});

	bench.ref("Without transform", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		return svc.resolveEntities(ctx, { id: entity.id }, { transform: false }).then(done);
	});

	bench.add("With transform", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		return svc.resolveEntities(ctx, { id: entity.id }, { transform: true }).then(done);
	});

	bench.add("Direct adapter access", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		return svc
			.getAdapter(ctx)
			.then(adapter => adapter.findById(entity.id))
			.then(done);
	});
})(bench4);
suites.push(bench4);

const bench5 = benchmark.createSuite("Entity updating");
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT), {
			returnEntities: true
		});
	});
	bench.tearDown(() => broker.stop());

	const ctx = Context.create(broker, null, {});

	bench.ref("Without transform", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		const newStatus = Math.round(Math.random());
		return svc
			.updateEntity(ctx, { id: entity.id, status: newStatus }, { transform: false })
			.then(done);
	});

	bench.add("With transform", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		const newStatus = Math.round(Math.random());
		return svc
			.updateEntity(ctx, { id: entity.id, status: newStatus }, { transform: true })
			.then(done);
	});
})(bench5);
suites.push(bench5);

const bench6 = benchmark.createSuite("Entity replacing");
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT), {
			returnEntities: true
		});
	});
	bench.tearDown(() => broker.stop());

	const ctx = Context.create(broker, null, {});

	bench.ref("Without transform", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		entity.status = Math.round(Math.random());
		return svc.replaceEntity(ctx, entity, { transform: false }).then(done);
	});

	bench.add("With transform", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		entity.status = Math.round(Math.random());
		return svc.replaceEntity(ctx, entity, { transform: true }).then(done);
	});
})(bench6);
suites.push(bench6);

const bench7 = benchmark.createSuite("Entity deleting");
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT), {
			returnEntities: true
		});
	});
	bench.tearDown(async () => {
		console.log("Remaining record", await svc.countEntities(ctx));
		await broker.stop();
	});

	const ctx = Context.create(broker, null, {});

	bench.ref("Without transform", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		return svc
			.removeEntity(ctx, { id: entity.id }, { transform: false })
			.catch(done)
			.then(done);
	});

	bench.add("With transform", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		return svc.removeEntity(ctx, { id: entity.id }, { transform: true }).catch(done).then(done);
	});
})(bench7);
suites.push(bench7);

async function run() {
	console.log("Running suites...");
	const results = await benchmark.run(suites);
	console.log("Save the results to file...");
	writeResult(SUITE_NAME, "benchmark_results.json", results);
	console.log("Generate README.md...");
	await generateMarkdown(SUITE_NAME);
	console.log("Done.");
}

run();

/* RESULT

=================================================
  Moleculer Database - Transformation benchmark
=================================================

Platform info:
==============
   Windows_NT 10.0.19041 x64
   Node.JS: 12.14.1
   V8: 7.7.299.13-node.16
   Intel(R) Core(TM) i7-4770K CPU @ 3.50GHz × 8

Suite: Entity creation (1000)
√ Without transform*           32,042 rps
√ With transform*              24,336 rps

   Without transform* (#)       0%         (32,042 rps)   (avg: 31μs)
   With transform*         -24.05%         (24,336 rps)   (avg: 41μs)
-----------------------------------------------------------------------

Suite: Entity listing (1000)
√ Without transform*            8,736 rps
√ With transform*               6,508 rps

   Without transform* (#)       0%          (8,736 rps)   (avg: 114μs)
   With transform*         -25.51%          (6,508 rps)   (avg: 153μs)
-----------------------------------------------------------------------

Suite: Entity counting (1000)
√ Without transform*            1,708 rps

   Without transform* (#)       0%          (1,708 rps)   (avg: 585μs)
-----------------------------------------------------------------------

Suite: Entity getting (1000)
√ Without transform*               86,826 rps
√ With transform*                  52,076 rps
√ Direct adapter access*           91,199 rps

   Without transform* (#)           0%         (86,826 rps)   (avg: 11μs)
   With transform*             -40.02%         (52,076 rps)   (avg: 19μs)
   Direct adapter access*       +5.04%         (91,199 rps)   (avg: 10μs)
-----------------------------------------------------------------------

Suite: Entity updating (1000)
√ Without transform*           20,704 rps
√ With transform*              18,048 rps

   Without transform* (#)       0%         (20,704 rps)   (avg: 48μs)
   With transform*         -12.83%         (18,048 rps)   (avg: 55μs)
-----------------------------------------------------------------------

Suite: Entity replacing (1000)
√ Without transform*           19,130 rps
√ With transform*              16,604 rps

   Without transform* (#)       0%         (19,130 rps)   (avg: 52μs)
   With transform*         -13.21%         (16,604 rps)   (avg: 60μs)
-----------------------------------------------------------------------

Suite: Entity deleting (1000)
√ Without transform*           19,787 rps
√ With transform*               5,769 rps
Remaining record 0

   Without transform* (#)       0%         (21,151 rps)   (avg: 47μs)
   With transform*         -62.06%          (8,025 rps)   (avg: 124μs)
-----------------------------------------------------------------------

*/

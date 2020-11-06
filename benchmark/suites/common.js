"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

const Fakerator = require("fakerator");
const fakerator = new Fakerator();

const Benchmarkify = require("../benchmarkify");
const benchmark = new Benchmarkify("Moleculer Database benchmark").printHeader();

const UserServiceSchema = {
	name: "users",
	mixins: [
		DbService({
			adapter: { type: "NeDB" }
			//adapter: { type: "MongoDB", options: { dbName: "bench-test", collection: "users" } }
		})
	],
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
			status: { type: "number", default: 1 }
		}
	}
};

function handleError(err) {
	console.error("Benchmark execution error", err.message);
}

const COUNT = 1000;

const bench1 = benchmark.createSuite(`NeDB: Entity creation (${COUNT})`);
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

const bench2 = benchmark.createSuite(`NeDB: Entity listing (${COUNT})`);
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
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

const bench3 = benchmark.createSuite(`NeDB: Entity counting (${COUNT})`);
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
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

const bench4 = benchmark.createSuite(`NeDB: Entity getting (${COUNT})`);
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
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
		return svc.adapter.findById(entity.id).then(done);
	});
})(bench4);

const bench5 = benchmark.createSuite(`NeDB: Entity updating (${COUNT})`);
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
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

const bench6 = benchmark.createSuite(`NeDB: Entity replacing (${COUNT})`);
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
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

const bench7 = benchmark.createSuite(`NeDB: Entity deleting (${COUNT})`);
(function (bench) {
	const broker = new ServiceBroker({ logger: false });
	const svc = broker.createService(UserServiceSchema);

	let docs;

	bench.setup(async () => {
		await broker.start();

		await svc.clearEntities(ctx);
		docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
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

benchmark.run([bench1, bench2, bench3, bench4, bench5, bench6, bench7]);

/* RESULT

================================
  Moleculer Database benchmark
================================

Platform info:
==============
   Windows_NT 10.0.18362 x64
   Node.JS: 10.17.0
   V8: 6.8.275.32-node.54
   Intel(R) Core(TM) i5-2400 CPU @ 3.10GHz × 4

Suite: NeDB: Entity creation (1000)
√ Without transform*           10,799 rps
√ With transform*               9,291 rps

   Without transform* (#)       0%         (10,799 rps)   (avg: 92μs)
   With transform*         -13.96%          (9,291 rps)   (avg: 107μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity listing (1000)
√ Without transform*            5,543 rps
√ With transform*               3,336 rps

   Without transform* (#)       0%          (5,543 rps)   (avg: 180μs)
   With transform*         -39.82%          (3,336 rps)   (avg: 299μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity counting (1000)
√ Without transform*              591 rps

   Without transform* (#)       0%            (591 rps)   (avg: 1ms)
-----------------------------------------------------------------------

Suite: NeDB: Entity getting (1000)
√ Without transform*               17,678 rps
√ With transform*                  12,576 rps
√ Direct adapter access*           37,203 rps

   Without transform* (#)           0%         (17,678 rps)   (avg: 56μs)
   With transform*             -28.86%         (12,576 rps)   (avg: 79μs)
   Direct adapter access*     +110.44%         (37,203 rps)   (avg: 26μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity updating (1000)
√ Without transform*            7,421 rps
√ With transform*               6,458 rps

   Without transform* (#)       0%          (7,421 rps)   (avg: 134μs)
   With transform*         -12.97%          (6,458 rps)   (avg: 154μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity replacing (1000)
√ Without transform*            7,531 rps
√ With transform*               6,338 rps

   Without transform* (#)       0%          (7,531 rps)   (avg: 132μs)
   With transform*         -15.84%          (6,338 rps)   (avg: 157μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity deleting (1000)
√ Without transform*           16,411 rps
√ With transform*                 346 rps
Remaining record 0

   Without transform* (#)       0%         (15,061 rps)   (avg: 66μs)
   With transform*          -97.7%            (346 rps)   (avg: 2ms)
-----------------------------------------------------------------------

*/

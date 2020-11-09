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
   Windows_NT 10.0.19041 x64
   Node.JS: 12.14.1
   V8: 7.7.299.13-node.16
   Intel(R) Core(TM) i7-4770K CPU @ 3.50GHz × 8

Suite: NeDB: Entity creation (1000)
√ Without transform*           36,303 rps
√ With transform*              27,818 rps

   Without transform* (#)       0%         (36,303 rps)   (avg: 27μs)
   With transform*         -23.37%         (27,818 rps)   (avg: 35μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity listing (1000)
√ Without transform*            9,733 rps
√ With transform*               7,614 rps

   Without transform* (#)       0%          (9,733 rps)   (avg: 102μs)
   With transform*         -21.77%          (7,614 rps)   (avg: 131μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity counting (1000)
√ Without transform*            1,907 rps

   Without transform* (#)       0%          (1,907 rps)   (avg: 524μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity getting (1000)
√ Without transform*               95,113 rps
√ With transform*                  57,807 rps
√ Direct adapter access*          103,682 rps

   Without transform* (#)           0%         (95,113 rps)   (avg: 10μs)
   With transform*             -39.22%         (57,807 rps)   (avg: 17μs)
   Direct adapter access*       +9.01%        (103,682 rps)   (avg: 9μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity updating (1000)
√ Without transform*           23,939 rps
√ With transform*              19,886 rps

   Without transform* (#)       0%         (23,939 rps)   (avg: 41μs)
   With transform*         -16.93%         (19,886 rps)   (avg: 50μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity replacing (1000)
√ Without transform*           22,764 rps
√ With transform*              19,546 rps

   Without transform* (#)       0%         (22,764 rps)   (avg: 43μs)
   With transform*         -14.14%         (19,546 rps)   (avg: 51μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity deleting (1000)
√ Without transform*           22,502 rps
√ With transform*               4,745 rps
Remaining record 0

   Without transform* (#)       0%         (23,413 rps)   (avg: 42μs)
   With transform*         -72.19%          (6,510 rps)   (avg: 153μs)
-----------------------------------------------------------------------

*/

"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

const Fakerator = require("fakerator");
const fakerator = new Fakerator();

const Benchmarkify = require("../benchmarkify");
const benchmark = new Benchmarkify("Moleculer Database benchmark").printHeader();

const adapters = [
	{ type: "NeDB" },
	{ type: "MongoDB", options: { dbName: "bench-test", collection: "users" } }
];

const UserServiceSchema = adapter => {
	return {
		name: "users",
		mixins: [DbService({ adapter })],
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
};

function handleError(err) {
	console.error("Benchmark execution error", err.message);
}

function runTest(adapter) {
	const COUNT = 1000;

	const bench1 = benchmark.createSuite(`Adapter: ${adapter.type} - Entity creation (${COUNT})`);
	(function (bench) {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService(UserServiceSchema(adapter));

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

		bench.ref("Call 'users.create'", done => {
			broker.call("users.create", entity1).then(done);
		});
	})(bench1);

	const bench2 = benchmark.createSuite(`Adapter: ${adapter.type} - Entity listing (${COUNT})`);
	(function (bench) {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService(UserServiceSchema(adapter));
		const ctx = Context.create(broker, null, {});

		bench.setup(async () => {
			await broker.start();

			await svc.clearEntities(ctx);
			await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
		});
		bench.tearDown(() => broker.stop());

		bench.ref("Call 'users.find'", done => {
			const offset = Math.floor(Math.random() * 80);
			broker.call("users.find", { offset, limit: 20 }).then(done);
		});

		bench.ref("Call 'users.list'", done => {
			const maxPage = COUNT / 20 - 2;
			const page = Math.floor(Math.random() * maxPage) + 1;
			broker.call("users.list", { page, pageSize: 20 }).then(done);
		});
	})(bench2);

	const bench3 = benchmark.createSuite(`Adapter: ${adapter.type} - Entity counting (${COUNT})`);
	(function (bench) {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService(UserServiceSchema(adapter));

		const ctx = Context.create(broker, null, {});
		bench.setup(async () => {
			await broker.start();

			await svc.clearEntities(ctx);
			await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
		});
		bench.tearDown(() => broker.stop());

		bench.ref("Call 'users.count'", done => {
			broker.call("users.count").then(done);
		});
	})(bench3);

	const bench4 = benchmark.createSuite(`Adapter: ${adapter.type} - Entity getting (${COUNT})`);
	(function (bench) {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService(UserServiceSchema(adapter));

		const ctx = Context.create(broker, null, {});
		let docs;

		bench.setup(async () => {
			await broker.start();

			await svc.clearEntities(ctx);
			docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
		});
		bench.tearDown(() => broker.stop());

		bench.ref("Call 'users.resolve'", done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			return broker.call("users.resolve", { id: entity.id }).then(done);
		});

		bench.add("Call 'users.get'", done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			return broker.call("users.get", { id: entity.id }).then(done);
		});
	})(bench4);

	const bench5 = benchmark.createSuite(`Adapter: ${adapter.type} - Entity updating (${COUNT})`);
	(function (bench) {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService(UserServiceSchema(adapter));

		const ctx = Context.create(broker, null, {});
		let docs;

		bench.setup(async () => {
			await broker.start();

			await svc.clearEntities(ctx);
			docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
		});
		bench.tearDown(() => broker.stop());

		bench.ref("Call 'users.update'", done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			const newStatus = Math.round(Math.random());
			return broker.call("users.update", { id: entity.id, status: newStatus }).then(done);
		});
	})(bench5);

	const bench6 = benchmark.createSuite(`Adapter: ${adapter.type} - Entity replacing (${COUNT})`);
	(function (bench) {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService(UserServiceSchema(adapter));

		let docs;
		const ctx = Context.create(broker, null, {});

		bench.setup(async () => {
			await broker.start();

			await svc.clearEntities(ctx);
			docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
		});
		bench.tearDown(() => broker.stop());

		bench.ref("Call 'users.replace'", done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			entity.status = Math.round(Math.random());
			return broker.call("users.replace", entity).then(done);
		});
	})(bench6);

	const bench7 = benchmark.createSuite(`Adapter: ${adapter.type} - Entity deleting (${COUNT})`);
	(function (bench) {
		const broker = new ServiceBroker({ logger: false });
		const svc = broker.createService(UserServiceSchema(adapter));

		let docs;
		const ctx = Context.create(broker, null, {});

		bench.setup(async () => {
			await broker.start();

			await svc.clearEntities(ctx);
			docs = await svc.createEntities(ctx, fakerator.times(fakerator.entity.user, COUNT));
		});
		bench.tearDown(async () => {
			//console.log("Remaining record", await svc.countEntities(ctx));
			await broker.stop();
		});

		bench.ref("Call 'users.remove'", done => {
			const entity = docs[Math.floor(Math.random() * docs.length)];
			return broker.call("users.remove", { id: entity.id }).catch(done).then(done);
		});
	})(bench7);

	benchmark.run([bench1, bench2, bench3, bench4, bench5, bench6, bench7]).then(() => {
		if (adapters.length > 0) runTest(adapters.shift());
	});
}

runTest(adapters.shift());

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

Suite: Adapter: NeDB - Entity creation (1000)
√ Call 'users.create'*           23,441 rps

   Call 'users.create'* (#)       0%         (23,441 rps)   (avg: 42μs)
-----------------------------------------------------------------------

Suite: Adapter: NeDB - Entity listing (1000)
√ Call 'users.find'*            6,424 rps
√ Call 'users.list'*            1,300 rps

   Call 'users.find'*     +394.11%          (6,424 rps)   (avg: 155μs)
   Call 'users.list'* (#)       0%          (1,300 rps)   (avg: 769μs)
-----------------------------------------------------------------------

Suite: Adapter: NeDB - Entity counting (1000)
√ Call 'users.count'*            1,757 rps

   Call 'users.count'* (#)       0%          (1,757 rps)   (avg: 569μs)
-----------------------------------------------------------------------

Suite: Adapter: NeDB - Entity getting (1000)
√ Call 'users.resolve'*           44,100 rps
√ Call 'users.get'*               45,645 rps

   Call 'users.resolve'* (#)       0%         (44,100 rps)   (avg: 22μs)
   Call 'users.get'*            +3.5%         (45,645 rps)   (avg: 21μs)
-----------------------------------------------------------------------

Suite: Adapter: NeDB - Entity updating (1000)
√ Call 'users.update'*           16,167 rps

   Call 'users.update'* (#)       0%         (16,167 rps)   (avg: 61μs)
-----------------------------------------------------------------------

Suite: Adapter: NeDB - Entity replacing (1000)
√ Call 'users.replace'*           16,143 rps

   Call 'users.replace'* (#)       0%         (16,143 rps)   (avg: 61μs)
-----------------------------------------------------------------------

Suite: Adapter: NeDB - Entity deleting (1000)
√ Call 'users.remove'*           17,381 rps

   Call 'users.remove'* (#)       0%         (17,375 rps)   (avg: 57μs)
-----------------------------------------------------------------------

Suite: Adapter: MongoDB - Entity creation (1000)
.   Running 'Call 'users.create''...(node:1432) DeprecationWarning: Listening to events on the Db class has been deprecated and will be removed in the next major version.
√ Call 'users.create'*            3,182 rps

   Call 'users.create'* (#)       0%          (3,182 rps)   (avg: 314μs)
-----------------------------------------------------------------------

Suite: Adapter: MongoDB - Entity listing (1000)
√ Call 'users.find'*            2,285 rps
√ Call 'users.list'*              687 rps

   Call 'users.find'*     +232.41%          (2,285 rps)   (avg: 437μs)
   Call 'users.list'* (#)       0%            (687 rps)   (avg: 1ms)
-----------------------------------------------------------------------

Suite: Adapter: MongoDB - Entity counting (1000)
√ Call 'users.count'*            1,798 rps

   Call 'users.count'* (#)       0%          (1,798 rps)   (avg: 556μs)
-----------------------------------------------------------------------

Suite: Adapter: MongoDB - Entity getting (1000)
√ Call 'users.resolve'*            4,148 rps
√ Call 'users.get'*                3,914 rps

   Call 'users.resolve'* (#)       0%          (4,148 rps)   (avg: 241μs)
   Call 'users.get'*           -5.64%          (3,914 rps)   (avg: 255μs)
-----------------------------------------------------------------------

Suite: Adapter: MongoDB - Entity updating (1000)
√ Call 'users.update'*            1,996 rps

   Call 'users.update'* (#)       0%          (1,996 rps)   (avg: 501μs)
-----------------------------------------------------------------------

Suite: Adapter: MongoDB - Entity replacing (1000)
√ Call 'users.replace'*              996 rps

   Call 'users.replace'* (#)       0%            (996 rps)   (avg: 1ms)
-----------------------------------------------------------------------

Suite: Adapter: MongoDB - Entity deleting (1000)
√ Call 'users.remove'*            7,548 rps

   Call 'users.remove'* (#)       0%         (10,516 rps)   (avg: 95μs)
-----------------------------------------------------------------------
*/

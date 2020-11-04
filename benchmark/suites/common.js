"use strict";

const { ServiceBroker, Context } = require("moleculer");
const DbService = require("../..").Service;

const Benchmarkify = require("benchmarkify");
const benchmark = new Benchmarkify("Moleculer Database benchmark").printHeader();

const broker = new ServiceBroker({ logger: false });
const svc = broker.createService({
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
				get: (_, entity) => entity.firstName + " " + entity.lastName
			},
			username: { type: "string" },
			email: { type: "string" },
			password: { type: "string", hidden: true },
			status: { type: "number", default: 1 }
		}
	}
});

const bench1 = benchmark.createSuite("NeDB: Entity creation");
(function () {
	const entity1 = {
		firstName: "John",
		lastName: "Doe",
		username: "john.doe81",
		email: "john.doe@moleculer.services",
		password: "pass1234",
		status: 1
	};

	const ctx = Context.create(broker, null, {});

	bench1.ref("Without transform", done => {
		return svc.createEntity(ctx, entity1, { transform: false }).then(done);
	});

	bench1.add("With transform", done => {
		return svc.createEntity(ctx, entity1).then(done);
	});
})();

const bench2 = benchmark.createSuite("NeDB: Entity listing");
(function () {
	const ctx = Context.create(broker, null, {});
	function handleError(err) {
		console.error("Benchmark execution error", err.message);
	}

	// bench1.ref("Without transform", done => {
	// 	return svc.createEntity(ctx, entity1, { transform: false }).then(done);
	// });

	bench2.add("With transform", done => {
		const offset = Math.floor(Math.random() * entityCount);
		return svc.findEntities(ctx, { offset, limit: 50 }).catch(handleError).then(done);
	});
})();

let entityCount;

broker
	.start()
	.then(() => bench1.run())
	.then(() =>
		broker.call("users.count").then(res => {
			entityCount = res;
			console.log("Number of created entities:", entityCount);
		})
	)
	.then(() => bench2.run())
	.then(() => broker.stop());

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

Suite: NeDB: Entity transformation
√ Without transform            48,984 rps
√ With transform               40,567 rps

   Without transform (#)        0%         (48,984 rps)   (avg: 20μs)
   With transform          -17.18%         (40,567 rps)   (avg: 24μs)
-----------------------------------------------------------------------

*/

"use strict";

const Datastore = require("nedb");

const Fakerator = require("fakerator");
const fakerator = new Fakerator();

const Benchmarkify = require("benchmarkify");
const benchmark = new Benchmarkify("NeDB benchmark").printHeader();

const COUNT = 1000;

function createDatastore() {
	const db = new Datastore(); // in-memory

	return new Promise((resolve, reject) => {
		db.loadDatabase(err => {
			if (err) return reject(err);
			resolve(db);
		});
	});
}

function insertFakeEntities(db, count) {
	const entities = fakerator.times(fakerator.entity.user, count);
	return new Promise((resolve, reject) => {
		db.insert(entities, (err, docs) => {
			if (err) return reject(err);
			resolve(docs);
		});
		/*}).then(docs => {
		return new Promise((resolve, reject) => {
			db.count({}, (err, count) => {
				if (err) return reject(err);
				resolve(docs);
				console.log("Number of entities:", count);
			});
		});*/
	});
}

const bench1 = benchmark.createSuite(`NeDB: Insert (${COUNT})`);
(function (bench) {
	const entity1 = {
		firstName: "John",
		lastName: "Doe",
		username: "john.doe81",
		email: "john.doe@moleculer.services",
		password: "pass1234",
		status: 1
	};
	let db;

	bench.setup(async () => {
		db = await createDatastore();
	});

	bench.add("db.insert", done => {
		db.insert(entity1, done);
	});
})(bench1);

const bench2 = benchmark.createSuite(`NeDB: Entity listing (${COUNT})`);
(function (bench) {
	let docs;
	let db;

	bench.setup(async () => {
		db = await createDatastore();
		docs = await insertFakeEntities(db, COUNT);
	});

	bench.ref("db.find", done => {
		const offset = Math.floor(Math.random() * 80);
		db.find().limit(20).skip(offset).exec(done);
	});
})(bench2);

const bench3 = benchmark.createSuite(`NeDB: Entity counting (${COUNT})`);
(function (bench) {
	let docs;
	let db;

	bench.setup(async () => {
		db = await createDatastore();
		docs = await insertFakeEntities(db, COUNT);
	});

	bench.ref("db.count", done => {
		db.count({}, done);
	});
})(bench3);

const bench4 = benchmark.createSuite(`NeDB: Entity getting (${COUNT})`);
(function (bench) {
	let docs;
	let db;

	bench.setup(async () => {
		db = await createDatastore();
		docs = await insertFakeEntities(db, COUNT);
	});

	bench.add("db.find", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		db.find({ _id: entity.id }).exec(done);
	});
})(bench4);

const bench5 = benchmark.createSuite(`NeDB: Entity updating (${COUNT})`);
(function (bench) {
	let docs;
	let db;

	bench.setup(async () => {
		db = await createDatastore();
		docs = await insertFakeEntities(db, COUNT);
	});

	bench.ref("db.update", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		const newStatus = Math.round(Math.random());
		db.update(
			{ _id: entity._id },
			{
				$set: {
					status: newStatus
				}
			},
			{ returnUpdatedDocs: true },
			done
		);
	});
})(bench5);

const bench6 = benchmark.createSuite(`NeDB: Entity replacing (${COUNT})`);
(function (bench) {
	let docs;
	let db;

	bench.setup(async () => {
		db = await createDatastore();
		docs = await insertFakeEntities(db, COUNT);
	});

	bench.ref("db.update", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		entity.status = Math.round(Math.random());
		db.update({ _id: entity._id }, entity, { returnUpdatedDocs: true }, done);
	});
})(bench6);

const bench7 = benchmark.createSuite(`NeDB: Entity deleting (${COUNT})`);
(function (bench) {
	let docs;
	let db;

	bench.setup(async () => {
		db = await createDatastore();
		docs = await insertFakeEntities(db, COUNT);
	});

	bench.ref("db.remove", done => {
		const entity = docs[Math.floor(Math.random() * docs.length)];
		db.remove({ _id: entity._id }, done);
	});
})(bench7);

benchmark.run([bench1, bench2, bench3, bench4, bench5, bench6, bench7]);

/* RESULT

==================
  NeDB benchmark
==================

Platform info:
==============
   Windows_NT 10.0.19041 x64
   Node.JS: 12.14.1
   V8: 7.7.299.13-node.16
   Intel(R) Core(TM) i7-4770K CPU @ 3.50GHz × 8

Suite: NeDB: Insert (1000)
√ db.insert*           52,813 rps

   db.insert*           0%         (52,813 rps)   (avg: 18μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity listing (1000)
√ db.find*            7,791 rps

   db.find* (#)       0%          (7,791 rps)   (avg: 128μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity counting (1000)
√ db.count*            6,684 rps

   db.count* (#)       0%          (6,684 rps)   (avg: 149μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity getting (1000)
√ db.find*            2,838 rps

   db.find*           0%          (2,838 rps)   (avg: 352μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity updating (1000)
√ db.update*           35,457 rps

   db.update* (#)       0%         (35,457 rps)   (avg: 28μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity replacing (1000)
√ db.update*           34,325 rps

   db.update* (#)       0%         (34,325 rps)   (avg: 29μs)
-----------------------------------------------------------------------

Suite: NeDB: Entity deleting (1000)
√ db.remove*          128,375 rps

   db.remove* (#)       0%        (128,375 rps)   (avg: 7μs)
-----------------------------------------------------------------------


*/

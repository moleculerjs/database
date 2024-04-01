/*
 * @moleculer/database
 * Copyright (c) 2024 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { flatten } = require("../utils");
const BaseAdapter = require("./base");

let MongoClient, ObjectId;

class MongoDBAdapter extends BaseAdapter {
	/**
	 * Constructor of adapter.
	 *
	 * @param  {Object?} opts
	 * @param  {String?} opts.dbName
	 * @param  {String?} opts.collection
	 * @param  {Object?} opts.mongoClientOptions More Info: https://mongodb.github.io/node-mongodb-native/4.1/interfaces/MongoClientOptions.html
	 * @param  {Object?} opts.dbOptions More Info: https://mongodb.github.io/node-mongodb-native/4.1/interfaces/DbOptions.html
	 */
	constructor(opts) {
		if (_.isString(opts)) opts = { uri: opts };

		super(opts);

		this.client = null;
		this.db = null;
	}

	/**
	 * The adapter has nested-field support.
	 */
	get hasNestedFieldSupport() {
		return true;
	}

	/**
	 * Initialize the adapter.
	 *
	 * @param {Service} service
	 */
	init(service) {
		super.init(service);

		if (!this.opts.collection) {
			this.opts.collection = service.name;
		}

		try {
			MongoClient = require("mongodb").MongoClient;
			ObjectId = require("mongodb").ObjectId;
		} catch (err) {
			/* istanbul ignore next */
			this.broker.fatal(
				"The 'mongodb' package is missing! Please install it with 'npm install mongodb --save' command.",
				err,
				true
			);
		}

		this.checkClientLibVersion("mongodb", "^6.0.0");
	}

	/**
	 * Connect adapter to database
	 */
	async connect() {
		const uri = this.opts.uri || "mongodb://127.0.0.1:27017";

		this.storeKey = `mongodb|${uri}`;
		this.client = this.getClientFromGlobalStore(this.storeKey);
		if (!this.client) {
			this.logger.debug(`MongoDB adapter is connecting to '${uri}'...`);
			this.client = new MongoClient(uri, this.opts.mongoClientOptions);

			this.logger.debug("Store the created MongoDB client", this.storeKey);
			this.setClientToGlobalStore(this.storeKey, this.client);

			this.client.on("open", () => this.logger.info(`MongoDB client has connected.`));
			this.client.on("close", () => this.logger.warn("MongoDB client has disconnected."));
			this.client.on("error", err => this.logger.error("MongoDB error.", err));
			try {
				// Connect the client to the server
				await this.client.connect();
			} catch (err) {
				// We remove the client from the global store if the connection failed because of reconnecting
				this.removeAdapterFromClientGlobalStore(this.storeKey);
				throw err;
			}
		} else {
			this.logger.debug("Using an existing MongoDB client", this.storeKey);
			if (!this.client.topology || !this.client.topology.isConnected()) {
				this.logger.debug("Waiting for the connected state of MongoDB client...");
				// This silent timer blocks the process to avoid exiting while wait for connecting
				const emptyTimer = setInterval(() => {}, 1000);
				await new this.Promise(resolve => {
					this.client.once("open", () => {
						clearInterval(emptyTimer);
						resolve();
					});
				});
			}
		}

		if (this.opts.dbName) {
			// Select DB and verify connection
			this.logger.debug("Selecting database:", this.opts.dbName);
			this.db = this.client.db(this.opts.dbName, this.opts.dbOptions);
		} else {
			// Using database from connection URI
			this.db = this.client.db();
		}
		await this.db.command({ ping: 1 });
		this.logger.debug("Database selected successfully.");

		this.logger.debug("Open collection:", this.opts.collection);
		this.collection = this.db.collection(this.opts.collection);
	}

	/**
	 * Disconnect adapter from database
	 */
	async disconnect() {
		if (this.client) {
			if (this.removeAdapterFromClientGlobalStore(this.storeKey)) await this.client.close();
		}
	}

	/**
	 * Convert the param to ObjectId.
	 * @param {String|ObjectId} id
	 * @returns {ObjectId}
	 */
	stringToObjectID(id) {
		if (typeof id == "string" && ObjectId.isValid(id)) return ObjectId.createFromHexString(id);

		return id;
	}

	/**
	 * Convert ObjectID to hex string ID
	 * @param {ObjectId} id
	 * @returns {String}
	 */
	objectIDToString(id) {
		if (id && id.toHexString) return id.toHexString();
		return id;
	}

	/**
	 * Find all entities by filters.
	 *
	 * @param {Object} params
	 * @returns {Promise<Array>}
	 */
	find(params) {
		return this.createQuery(params).toArray();
	}

	/**
	 * Find an entity by query & sort
	 *
	 * @param {Object} params
	 * @returns {Promise<Object>}
	 */
	async findOne(params) {
		if (params.sort) {
			const res = await this.find(params);
			return res.length > 0 ? res[0] : null;
		} else {
			const q = { ...params.query };
			if (q._id) {
				q._id = this.stringToObjectID(q._id);
			}
			return this.collection.findOne(q);
		}
	}

	/**
	 * Find an entities by ID.
	 *
	 * @param {String|ObjectId} id
	 * @returns {Promise<Object>} Return with the found document.
	 *
	 */
	findById(id) {
		return this.collection.findOne({ _id: this.stringToObjectID(id) });
	}

	/**
	 * Find entities by IDs.
	 *
	 * @param {Array<String|ObjectId>} idList
	 * @returns {Promise<Array>} Return with the found documents in an Array.
	 *
	 */
	findByIds(idList) {
		return this.collection
			.find({
				_id: {
					$in: idList.map(id => this.stringToObjectID(id))
				}
			})
			.toArray();
	}

	/**
	 * Find all entities by filters and returns a Stream.
	 *
	 * @param {Object} params
	 * @returns {Promise<Stream>}
	 */
	findStream(params) {
		return this.createQuery(params).stream();
	}

	/**
	 * Get count of filtered entites.
	 *
	 * @param {Object} [params]
	 * @returns {Promise<Number>} Return with the count of documents.
	 *
	 */
	count(params) {
		return this.createQuery(params, { counting: true });
	}

	/**
	 * Insert an entity.
	 *
	 * @param {Object} entity
	 * @returns {Promise<Object>} Return with the inserted document.
	 *
	 */
	async insert(entity) {
		if (entity._id) {
			entity._id = this.stringToObjectID(entity._id);
		}
		const res = await this.collection.insertOne(entity);
		if (!res.acknowledged) throw new Error("MongoDB insertOne failed.");
		return entity;
	}

	/**
	 * Insert many entities
	 *
	 * @param {Array<Object>} entities
	 * @param {Object?} opts
	 * @param {Boolean?} opts.returnEntities
	 * @returns {Promise<Array<Object|any>>} Return with the inserted IDs or entities.
	 *
	 */
	async insertMany(entities, opts = {}) {
		for (const entity of entities) {
			if (entity._id) {
				entity._id = this.stringToObjectID(entity._id);
			}
		}
		const res = await this.collection.insertMany(entities);
		if (!res.acknowledged) throw new Error("MongoDB insertMany failed.");
		return opts.returnEntities ? entities : Object.values(res.insertedIds);
	}

	/**
	 * Update an entity by ID
	 *
	 * @param {String} id
	 * @param {Object} changes
	 * @param {Object} opts
	 * @returns {Promise<Object>} Return with the updated document.
	 *
	 */
	async updateById(id, changes, opts) {
		const raw = opts && opts.raw ? true : false;
		if (!raw) {
			// Flatten the changes to dot notation
			changes = flatten(changes, { safe: true });
		}

		const res = await this.collection.findOneAndUpdate(
			{ _id: this.stringToObjectID(id) },
			raw ? changes : { $set: changes },
			{ returnDocument: "after" }
		);
		return res;
	}

	/**
	 * Update many entities
	 *
	 * @param {Object} query
	 * @param {Object} changes
	 * @param {Object} opts
	 * @returns {Promise<Number>} Return with the count of modified documents.
	 *
	 */
	async updateMany(query, changes, opts) {
		const raw = opts && opts.raw ? true : false;
		if (!raw) {
			// Flatten the changes to dot notation
			changes = flatten(changes, { safe: true });
		}

		const res = await this.collection.updateMany(query, raw ? changes : { $set: changes });
		return res.modifiedCount;
	}

	/**
	 * Replace an entity by ID
	 *
	 * @param {String} id
	 * @param {Object} entity
	 * @returns {Promise<Object>} Return with the updated document.
	 *
	 */
	async replaceById(id, entity) {
		const res = await this.collection.findOneAndReplace(
			{ _id: this.stringToObjectID(id) },
			entity,
			{ returnDocument: "after" }
		);
		return res;
	}

	/**
	 * Remove an entity by ID
	 *
	 * @param {String} id
	 * @returns {Promise<any>} Return with ID of the deleted document.
	 *
	 */
	async removeById(id) {
		await this.collection.findOneAndDelete({ _id: this.stringToObjectID(id) });
		return id;
	}

	/**
	 * Remove entities which are matched by `query`
	 *
	 * @param {Object} query
	 * @returns {Promise<Number>} Return with the number of deleted documents.
	 *
	 */
	async removeMany(query) {
		const res = await this.collection.deleteMany(query);
		return res.deletedCount;
	}

	/**
	 * Clear all entities from collection
	 *
	 * @returns {Promise<Number>}
	 *
	 */
	async clear() {
		const res = await this.collection.deleteMany({});
		return res.deletedCount;
	}

	/**
	 * Convert DB entity to JSON object.
	 *
	 * @param {Object} entity
	 * @returns {Object}
	 */
	entityToJSON(entity) {
		let json = Object.assign({}, entity);
		if (this.opts.stringID !== false && entity._id)
			json._id = this.objectIDToString(entity._id);
		return json;
	}

	/**
	 * Check the IDs in the `query` and convert to ObjectID.
	 * @param {Object} q
	 * @returns {Object}
	 */
	convertIDToObjectID(query) {
		if (query && query._id) {
			const q = { ...query };
			if (typeof q._id == "object" && Array.isArray(q._id.$in)) {
				q._id.$in = q._id.$in.map(this.stringToObjectID);
			} else {
				q._id = this.stringToObjectID(q._id);
			}
			return q;
		}
		return query;
	}

	/**
	 * Create a query based on filters
	 *
	 * Available filters:
	 *  - search
	 *  - searchFields
	 * 	- sort
	 * 	- limit
	 * 	- offset
	 *  - query
	 *
	 * @param {Object} params
	 * @param {Object?} opts
	 * @param {Boolean?} opts.counting
	 * @returns {Query}
	 * @memberof MemoryDbAdapter
	 */
	createQuery(params, opts = {}) {
		const fn = opts.counting ? this.collection.countDocuments : this.collection.find;
		let q;
		if (params) {
			if (_.isString(params.search) && params.search !== "") {
				// Full-text search
				// More info: https://docs.mongodb.com/manual/reference/operator/query/text/
				q = fn.call(
					this.collection,
					Object.assign({}, params.query || {}, {
						$text: {
							$search: params.search
						}
					})
				);

				if (!opts.counting) {
					if (q.project) q.project({ _score: { $meta: "textScore" } });

					if (q.sort) {
						if (params.sort) {
							const sort = this.transformSort(params.sort);
							if (sort) q.sort(sort);
						} else {
							q.sort({
								_score: {
									$meta: "textScore"
								}
							});
						}
					}
				}
			} else {
				const query = this.convertIDToObjectID(params.query);

				q = fn.call(this.collection, query);

				// Sort
				if (!opts.counting && params.sort && q.sort) {
					const sort = this.transformSort(params.sort);
					if (sort) q.sort(sort);

					// Collation
					// https://docs.mongodb.com/manual/reference/method/cursor.collation/
					if (params.collation) q.collation(params.collation);
				}
			}

			if (!opts.counting) {
				// Offset
				if (_.isNumber(params.offset) && params.offset > 0) q.skip(params.offset);

				// Limit
				if (_.isNumber(params.limit) && params.limit > 0) q.limit(params.limit);
			}

			// Hint
			// https://docs.mongodb.com/manual/reference/method/cursor.hint/
			if (params.hint) q.hint(params.hint);

			return q;
		}

		// If not params
		return fn.call(this.collection, {});
	}

	/**
	 * Convert the `sort` param to a `sort` object to Mongo queries.
	 *
	 * @param {String|Array<String>|Object} paramSort
	 * @returns {Object} Return with a sort object like `{ "votes": 1, "title": -1 }`
	 * @memberof MongoDbAdapter
	 */
	transformSort(sort) {
		if (typeof sort == "string") sort = [sort];
		if (Array.isArray(sort)) {
			return sort.reduce((res, s) => {
				if (s.startsWith("-")) res[s.slice(1)] = -1;
				else res[s] = 1;
				return res;
			}, {});
		}

		return sort;
	}

	/**
	 * Create an index.
	 *
	 * @param {Object} def
	 * @param {String|Array<String>|Object} def.fields
	 * @param {String?} def.name
	 * @param {Boolean?} def.unique
	 * @param {Boolean?} def.sparse
	 * @param {Number?} def.expireAfterSeconds
	 */
	createIndex(def) {
		let fields;
		if (typeof def.fields == "string") fields = { [def.fields]: 1 };
		else if (Array.isArray(def.fields)) {
			fields = def.fields.reduce((a, b) => {
				a[b] = 1;
				return a;
			}, {});
		} else {
			fields = def.fields;
		}
		return this.collection.createIndex(fields, def);
	}

	/**
	 * Remove an index by name or fields.
	 *
	 * @param {Object} def
	 * @param {String|Array<String>|Object} def.fields
	 * @param {String?} def.name
	 * @returns {Promise<void>}
	 */
	removeIndex(def) {
		if (def.name) return this.collection.dropIndex(def.name);
		else return this.collection.dropIndex(def.fields);
	}
}

module.exports = MongoDBAdapter;

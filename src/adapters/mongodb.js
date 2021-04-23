/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { ServiceSchemaError } = require("moleculer").Errors;
const { flatten } = require("../utils");
const BaseAdapter = require("./base");

let MongoClient, ObjectID;

class MongoDBAdapter extends BaseAdapter {
	/**
	 * Constructor of adapter.
	 *
	 * @param  {Object?} opts
	 * @param  {String?} opts.dbName
	 * @param  {String?} opts.collection
	 * @param  {Object?} opts.mongoClientOptions More Info: https://docs.mongodb.com/drivers/node/current/fundamentals/connection/#connection-options
	 * @param  {Object?} opts.dbOptions More Info: http://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html#db
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
			ObjectID = require("mongodb").ObjectID;
		} catch (err) {
			/* istanbul ignore next */
			this.broker.fatal(
				"The 'mongodb' package is missing! Please install it with 'npm install mongodb --save' command.",
				err,
				true
			);
		}

		this.checkClientLibVersion("mongodb", "^3.6.5");
	}

	/**
	 * Connect adapter to database
	 */
	async connect() {
		const uri = this.opts.uri || "mongodb://localhost:27017";

		this.storeKey = `mongodb|${uri}`;
		this.client = this.getClientFromGlobalStore(this.storeKey);
		if (!this.client) {
			this.logger.debug(`MongoDB adapter is connecting to '${uri}'...`);
			this.client = new MongoClient(
				uri,
				_.defaultsDeep(this.opts.mongoClientOptions, {
					useUnifiedTopology: true,
					useNewUrlParser: true
				})
			);

			this.logger.debug("Store the created MongoDB client", this.storeKey);
			this.setClientToGlobalStore(this.storeKey, this.client);

			this.client.on("open", () => this.logger.info(`MongoDB client has connected.`));
			this.client.on("close", () => this.logger.warn("MongoDB client has disconnected."));
			this.client.on("error", err => this.logger.error("MongoDB error.", err));

			// Connect the client to the server
			await this.client.connect();
		} else {
			this.logger.debug("Using an existing MongoDB client", this.storeKey);
		}

		if (this.opts.dbName) {
			// Select DB and verify connection
			this.logger.debug("Selecting database:", this.opts.dbName);
			this.db = this.client.db(this.opts.dbName, this.opts.dbOptions);
		} else {
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
	 * Convert the param to ObjectID.
	 * @param {String|ObjectID} id
	 * @returns {ObjectID}
	 */
	stringToObjectID(id) {
		if (typeof id == "string" && ObjectID.isValid(id))
			return new ObjectID.createFromHexString(id);

		return id;
	}

	/**
	 * Convert ObjectID to hex string ID
	 * @param {ObjectID} id
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
	 * Find an entity by query
	 *
	 * @param {Object} query
	 * @returns {Promise<Object>}
	 */
	findOne(query) {
		return this.collection.findOne(query);
	}

	/**
	 * Find an entities by ID.
	 *
	 * @param {String|ObjectID} id
	 * @returns {Promise<Object>} Return with the found document.
	 *
	 */
	findById(id) {
		return this.collection.findOne({ _id: this.stringToObjectID(id) });
	}

	/**
	 * Find any entities by IDs.
	 *
	 * @param {Array<String|ObjectID>} idList
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
		return this.createQuery(params).transformStream();
	}

	/**
	 * Get count of filtered entites.
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
		const res = await this.collection.insertOne(entity);
		if (res.insertedCount > 0) return res.ops[0];
	}

	/**
	 * Insert many entities
	 *
	 * @param {Array<Object>} entities
	 * @returns {Promise<Array<Object>>} Return with the inserted documents in an Array.
	 *
	 */
	async insertMany(entities) {
		const res = await this.collection.insertMany(entities);
		return res.ops;
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
			{ returnOriginal: false }
		);
		return res.value;
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
			{ returnOriginal: false }
		);
		return res.value;
	}

	/**
	 * Remove an entity by ID
	 *
	 * @param {String} id
	 * @returns {Promise<any>} Return with ID of the deleted document.
	 *
	 */
	async removeById(id) {
		const res = await this.collection.findOneAndDelete({ _id: this.stringToObjectID(id) });
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
				if (params.query && params.query._id) {
					// TODO: find better solution
					if (
						typeof params.query._id == "object" &&
						Array.isArray(params.query._id.$in)
					) {
						params.query._id.$in = params.query._id.$in.map(this.stringToObjectID);
					} else {
						params.query._id = this.stringToObjectID(params.query._id);
					}
				}

				q = fn.call(this.collection, params.query);

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

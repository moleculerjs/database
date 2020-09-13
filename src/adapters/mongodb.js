/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { MongoClient, ObjectID } = require("mongodb");
const { ServiceSchemaError } = require("moleculer").Errors;

const BaseAdapter = require("./base");

class MongoDBAdapter extends BaseAdapter {
	/**
	 * Constructor of adapter.
	 *
	 * @param  {Object?} opts
	 * @param  {String} opts.dbName
	 * @param  {String} opts.collection
	 * @param  {Object?} opts.mongoClientOptions More Info: https://docs.mongodb.com/drivers/node/fundamentals/connection#id1
	 */
	constructor(opts) {
		if (_.isString(opts)) opts = { uri: opts };

		super(opts);

		this.client = null;
		this.db = null;
	}

	/**
	 * Initialize the adapter.
	 *
	 * @param {Service} service
	 */
	init(service) {
		super.init(service);

		if (!this.opts.dbName) {
			throw new ServiceSchemaError("Missing `dbName` in adapter options!");
		}
		if (!this.opts.collection) {
			throw new ServiceSchemaError("Missing `collection` in adapter options!");
		}
	}

	/**
	 * Connect adapter to database
	 */
	async connect() {
		this.client = new MongoClient(
			this.opts.uri || "mongodb://localhost:27017",
			this.opts.mongoClientOptions
		);

		// Connect the client to the server
		await this.client.connect();

		// Select DB and verify connection
		this.db = this.client.db(this.opts.dbName);
		await this.db.command({ ping: 1 });

		this.collection = this.db.collection(this.opts.collection);

		this.logger.info("MongoDB adapter has connected.");

		this.db.on("close", () => this.logger.warn("MongoDB adapter has disconnected."));
		this.db.on("error", err => this.logger.error("MongoDB error.", err));
		this.db.on("reconnect", () => this.logger.info("MongoDB adapter has reconnected."));
	}

	/**
	 * Disconnect adapter from database
	 */
	async disconnect() {
		if (this.client) await this.client.close();
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
		const res = await this.collection.findOneAndUpdate(
			{ _id: this.stringToObjectID(id) },
			opts && opts.raw ? changes : { $set: changes },
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
		const res = await this.collection.updateMany(
			query,
			opts && opts.raw ? changes : { $set: changes }
		);
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
		return res.value;
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
	 * Createa query based on filters
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
				}
			}

			if (!opts.counting) {
				// Offset
				if (_.isNumber(params.offset) && params.offset > 0) q.skip(params.offset);

				// Limit
				if (_.isNumber(params.limit) && params.limit > 0) q.limit(params.limit);
			}

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
		if (Array.isArray(sort)) {
			const sortObj = {};
			sort.forEach(s => {
				if (s.startsWith("-")) sortObj[s.slice(1)] = -1;
				else sortObj[s] = 1;
			});
			return sortObj;
		}

		return sort;
	}

	/**
	 * Create an index. The `def` is adapter specific.
	 *
	 * @param {Object} def
	 * @param {Object|String} def.fields
	 * @param {Boolean?} def.unique
	 * @param {Boolean?} def.sparse
	 * @param {String?} def.name
	 */
	createIndex(def) {
		return this.collection.createIndex(def.fields, {
			unique: def.unique,
			sparse: def.sparse,
			name: def.name
		});
	}
}

module.exports = MongoDBAdapter;

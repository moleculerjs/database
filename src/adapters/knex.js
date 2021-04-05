/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { ServiceSchemaError } = require("moleculer").Errors;
let Knex;

const BaseAdapter = require("./base");

class KnexAdapter extends BaseAdapter {
	/**
	 * Constructor of adapter.
	 *
	 * @param  {Object?} opts
	 * @param  {Object?} opts.knex More Info: http://knexjs.org/#Installation-client
	 */
	constructor(opts) {
		if (_.isString(opts))
			opts = {
				tableName: null,
				knex: {
					client: "pg",
					connection: opts,
					log: {
						log: message => this.logger.info(message),
						warn: message => this.logger.warn(message),
						error: message => this.logger.error(message),
						deprecate: message => this.logger.warn(message),
						debug: message => this.logger.debug(message)
					}
				}
			};

		super(opts);

		this.client = null;
		this.idFieldName = "id";
	}

	/**
	 * The adapter has nested-field support.
	 */
	get hasNestedFieldSupport() {
		return false;
	}

	/**
	 * Initialize the adapter.
	 *
	 * @param {Service} service
	 */
	init(service) {
		super.init(service);

		if (this.service.$primaryField) this.idFieldName = this.service.$primaryField.columnName;
		if (!this.opts.tableName) this.opts.tableName = service.name;

		try {
			Knex = require("knex");
		} catch (err) {
			/* istanbul ignore next */
			this.broker.fatal(
				"The 'knex' package is missing! Please install it with 'npm install knex --save' command.",
				err,
				true
			);
		}

		this.checkClientLibVersion("knex", "^0.95.4");
	}

	/**
	 * Connect adapter to database
	 */
	async connect() {
		this.logger.debug(`Knex connecting...`);
		this.client = new Knex(this.opts.knex);

		/*this.client.on("open", () =>
			this.logger.info(
				`MongoDB adapter has connected. Database: '${this.opts.dbName}', Collection: '${this.opts.collection}'`
			)
		);
		this.client.on("close", () => this.logger.warn("MongoDB adapter has disconnected."));
		this.client.on("error", err => this.logger.error("MongoDB error.", err));

		// Connect the client to the server
		await this.client.connect();*/
	}

	/**
	 * Disconnect adapter from database
	 */
	async disconnect() {
		if (this.client) await this.client.destroy();
	}

	/**
	 * Find all entities by filters.
	 *
	 * @param {Object} params
	 * @returns {Promise<Array>}
	 */
	find(params) {
		return this.createQuery(params);
	}

	/**
	 * Find an entity by query
	 *
	 * @param {Object} query
	 * @returns {Promise<Object>}
	 */
	async findOne(query) {
		return this.createQuery({ query }).first();
	}

	/**
	 * Find an entities by ID.
	 *
	 * @param {String|ObjectID} id
	 * @returns {Promise<Object>} Return with the found document.
	 *
	 */
	findById(id) {
		return this.findOne({ [this.idFieldName]: id });
	}

	/**
	 * Find any entities by IDs.
	 *
	 * @param {Array<String|ObjectID>} idList
	 * @returns {Promise<Array>} Return with the found documents in an Array.
	 *
	 */
	findByIds(idList) {
		return this.client.table(this.opts.tableName).select().whereIn(this.idFieldName, idList);
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
	 * @param {Object} [params]
	 * @returns {Promise<Number>} Return with the count of documents.
	 *
	 */
	async count(params) {
		const res = await this.createQuery(params, { counting: true });
		return res && res.length > 0 ? res[0].count : 0;
	}

	/**
	 * Insert an entity.
	 *
	 * @param {Object} entity
	 * @returns {Promise<Object>} Return with the inserted document.
	 *
	 */
	async insert(entity) {
		const res = await this.client
			.insert(entity, [this.idFieldName])
			//.returning(this.idFieldName)
			.into(this.opts.tableName);

		if (res && res.length > 0) {
			return await this.findById(entity[this.idFieldName] || res[0]);
		}
		return res;
	}

	/**
	 * Insert many entities
	 *
	 * @param {Array<Object>} entities
	 * @returns {Promise<Array<Object>>} Return with the inserted documents in an Array.
	 *
	 */
	async insertMany(entities) {
		return Promise.all(entities.map(entity => this.insert(entity)));
		/* SQLite doesn't returns with the IDs
		const res = await this.client
			.insert(entities)
			.returning(this.idFieldName)
			.into(this.opts.tableName);
		return res;
		*/
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
		/*if (!raw) {
			// Flatten the changes to dot notation
			changes = flatten(changes, { safe: true });
		}*/

		await this.client
			.table(this.opts.tableName)
			.update(changes)
			.where({ [this.idFieldName]: id });

		return this.findById(id);
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
		/*if (!raw) {
			// Flatten the changes to dot notation
			changes = flatten(changes, { safe: true });
		}*/

		return await this.client.table(this.opts.tableName).update(changes).where(query);
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
		return this.updateById(id, _.omit(entity, [this.idFieldName]));
	}

	/**
	 * Remove an entity by ID
	 *
	 * @param {String} id
	 * @returns {Promise<any>} Return with ID of the deleted document.
	 *
	 */
	async removeById(id) {
		await this.client
			.table(this.opts.tableName)
			.where({ [this.idFieldName]: id })
			.del();
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
		const res = await this.client.table(this.opts.tableName).where(query).del();
		return res;
	}

	/**
	 * Clear all entities from collection
	 *
	 * @returns {Promise<Number>}
	 *
	 */
	async clear() {
		const count = await this.count();
		const res = await this.client.table(this.opts.tableName).truncate();
		return count;
	}

	/**
	 * Convert DB entity to JSON object.
	 *
	 * @param {Object} entity
	 * @returns {Object}
	 */
	entityToJSON(entity) {
		return entity;
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
		let q = this.client.table(this.opts.tableName);
		if (opts.counting) q = q.count({ count: "*" });
		if (params) {
			// Text search
			const query = params.query ? Object.assign({}, params.query) : {};

			Object.entries(query).forEach(([key, value]) => {
				if (typeof value == "object") {
					if (value.$in && Array.isArray(value.$in)) {
						q = q.whereIn(key, value.$in);
					} else if (value.$nin && Array.isArray(value.$nin)) {
						q = q.whereNotIn(key, value.$nin);
					} else if (value.$gt) {
						q = q.where(key, ">", value.$gt);
					} else if (value.$gte) {
						q = q.where(key, ">=", value.$gte);
					} else if (value.$lt) {
						q = q.where(key, "<", value.$lt);
					} else if (value.$lte) {
						q = q.where(key, "<=", value.$lte);
					} else if (value.$eq) {
						q = q.where(key, "=", value.$eq);
					} else if (value.$ne) {
						q = q.where(key, "=", value.$ne);
					} else if (value.$exists === true) {
						q = q.whereNotNull(key);
					} else if (value.$exists === false) {
						q = q.whereNull(key);
					} else if (value.$raw) {
						if (typeof value.$raw == "string") {
							q = q.whereRaw(value.$raw);
						} else if (typeof value.$raw == "object") {
							q = q.whereRaw(value.$raw.condition, value.$raw.bindings);
						}
					}
				} else {
					q = q.where(key, value);
				}
			});

			if (_.isString(params.search) && params.search !== "" && params.searchFields) {
				params.searchFields.forEach((field, i) => {
					const fn = i == 0 ? "where" : "orWhere";
					q = q[fn](field, "like", `%${params.search}%`);
				});
			}

			// Sort
			if (params.sort) {
				let pSort = params.sort;
				if (typeof pSort == "string") pSort = [pSort];
				pSort.forEach(field => {
					if (field.startsWith("-")) q = q.orderBy(field.slice(1), "desc");
					else q = q.orderBy(field, "asc");
				});
			}

			// Limit
			if (_.isNumber(params.limit) && params.limit > 0) q.limit(params.limit);

			// Offset
			if (_.isNumber(params.offset) && params.offset > 0) q.offset(params.offset);
		}

		// If not params
		return q;
	}

	/**
	 * Create an index. The `def` is adapter specific.
	 *
	 * @param {Object} def
	 * @param {Object|String} def.fields
	 * @param {Boolean?} def.unique
	 * @param {String?} def.name
	 * @param {String?} def.type
	 */
	createIndex(def) {
		//if (def.unique) return this.client.unique(def.fields, def.name);
		//else return this.client.index(def.fields, def.name, def.type);
	}

	async createTable(fields) {
		if (!fields) fields = this.service.$fields;

		await this.client.schema.createTable(this.opts.tableName, table => {
			for (const field of fields) {
				if (field.virtual) continue;

				let f;
				if (!(field.columnType in table))
					throw new Error(
						`Field '${field.columnName}' columnType '${field.columnType}' is not a valid type.`
					);

				if (field.primaryKey) {
					if (field.generated == "user") {
						f = table[field.columnType](field.columnName);
					} else {
						f = table.increments(field.columnName);
					}
					f = f.primary();
				} else {
					f = table[field.columnType](field.columnName);
				}
			}
		});

		// TODO indices!
		// table.index(columns, [indexName], [indexType])
		// table.unique(columns, [indexName])
	}
}

module.exports = KnexAdapter;

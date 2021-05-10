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
	 * Find an entity by query & sort
	 *
	 * @param {Object} params
	 * @returns {Promise<Object>}
	 */
	async findOne(params) {
		return this.createQuery(params).first();
	}

	/**
	 * Find an entities by ID.
	 *
	 * @param {String|ObjectID} id
	 * @returns {Promise<Object>} Return with the found document.
	 *
	 */
	findById(id) {
		return this.findOne({ query: { [this.idFieldName]: id } });
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
		const count = res && res.length > 0 ? res[0].count : 0;
		// Pg returns `string` value
		return typeof count == "string" ? Number(count) : count;
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
			// Sqlite returns only a single value which is the ID
			// Postgres returns an object with only the ID field.
			let id = entity[this.idFieldName] || res[0];
			if (typeof id == "object") {
				id = id[this.idFieldName];
			}
			return await this.findById(id);
		}
		return res;
	}

	/**
	 * Insert many entities
	 *
	 * @param {Array<Object>} entities
	 * @returns {Promise<Array<any>>} Return with the inserted IDs.
	 *
	 */
	async insertMany(entities) {
		const res = await this.client.transaction(trx =>
			Promise.all(
				entities.map(entity =>
					trx.insert(entity, [this.idFieldName]).into(this.opts.tableName)
				)
			)
		);

		return _.flatten(res);
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
		let p = this.client.table(this.opts.tableName).where(this.idFieldName, id);
		if (raw) {
			// Handle $set, $inc
			if (changes.$set) {
				p = p.update(changes.$set);
			}
			if (changes.$inc) {
				p = p.increment(changes.$inc);
			}
		} else {
			p = p.update(changes);
		}
		await p;

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
		let p = this.client.table(this.opts.tableName).where(query);
		if (raw) {
			// Handle $set, $inc
			if (changes.$set) {
				p = p.update(changes.$set);
			}
			if (changes.$inc) {
				p = p.increment(changes.$inc);
			}
		} else {
			p = p.update(changes);
		}
		return p;
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
		await this.client.table(this.opts.tableName).where(this.idFieldName, id).del();
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
		await this.client.table(this.opts.tableName).truncate();
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

			// Text search
			if (_.isString(params.search) && params.search !== "" && params.searchFields) {
				params.searchFields.forEach((field, i) => {
					const fn = i == 0 ? "where" : "orWhere";
					q = q[fn](field, "like", `%${params.search}%`);
				});
			}

			// Sort
			if (!opts.counting && params.sort) {
				let pSort = params.sort;
				if (typeof pSort == "string") pSort = [pSort];
				pSort.forEach(field => {
					if (field.startsWith("-")) q = q.orderBy(field.slice(1), "desc");
					else q = q.orderBy(field, "asc");
				});
			}

			// Limit
			if (!opts.counting && _.isNumber(params.limit) && params.limit > 0)
				q.limit(params.limit);

			// Offset
			if (!opts.counting && _.isNumber(params.offset) && params.offset > 0) {
				if (!params.sort && this.opts.knex.client == "mssql") {
					// MSSQL can't use offset without sort.
					// https://github.com/knex/knex/issues/1527
					q = q.orderBy(this.idFieldName, "asc");
				}
				q.offset(params.offset);
			}
		}

		// If not params
		return q;
	}

	/**
	 * Create a table based on field definitions
	 * @param {Array<Object>} fields
	 * @param {Object?} opts
	 * @param {Boolean?} opts.dropTableIfExists
	 * @param {Boolean?} opts.createIndexes
	 */
	async createTable(fields, opts = {}) {
		if (!fields) fields = this.service.$fields;

		if (opts && opts.dropTableIfExists !== false) {
			const exists = await this.client.schema.hasTable(this.opts.tableName);
			if (exists) {
				await this.dropTable(this.opts.tableName);
			}
		}

		this.logger.info(`Creating '${this.opts.tableName}' table...`);
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
					if (field.columnType == "string") {
						const len = field.columnLength || field.max || field.length;
						f = table.string(field.columnName, len);
					} else {
						f = table[field.columnType](field.columnName);
					}
				}
			}

			if (
				opts &&
				opts.createIndexes &&
				this.service.settings &&
				this.service.settings.indexes
			) {
				this.service.settings.indexes.forEach(def => this.createTableIndex(table, def));
			}
		});
		this.logger.info(`Table '${this.opts.tableName}' created.`);
	}

	/**
	 * Drop the given table.
	 * @param {String?} tableName
	 */
	async dropTable(tableName = this.opts.tableName) {
		this.logger.info(`Dropping '${tableName}' table...`);
		await this.client.schema.dropTable(tableName);
	}

	/**
	 * Create an index.
	 *
	 * @param {Object} def
	 * @param {String|Array<String>|Object} def.fields
	 * @param {String?} def.name
	 * @param {String?} def.type The type can be optionally specified for PostgreSQL and MySQL
	 * @param {Boolean?} def.unique
	 * @returns {Promise<void>}
	 */
	async createIndex(def) {
		await this.client.schema.alterTable(this.opts.tableName, table =>
			this.createTableIndex(table, def)
		);
	}

	/**
	 * Create index on the given table
	 * @param {KnexTable} table
	 * @param {Object} def
	 * @returns
	 */
	createTableIndex(table, def) {
		let fields = def.fields;
		if (_.isPlainObject(fields)) {
			fields = Object.keys(fields);
		}

		if (def.unique) return table.unique(fields, def.name);
		else return table.index(fields, def.name, def.type);
	}

	/**
	 * Remove an index.
	 *
	 * @param {Object} def
	 * @param {String|Array<String>|Object} def.fields
	 * @param {String?} def.name
	 * @returns {Promise<void>}
	 */
	async removeIndex(def) {
		let fields = def.fields;
		if (_.isPlainObject(fields)) {
			fields = Object.keys(fields);
		}

		await this.client.schema.alterTable(this.opts.tableName, function (table) {
			return table.dropIndex(fields, def.name);
		});
	}
}

module.exports = KnexAdapter;

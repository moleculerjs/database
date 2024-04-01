/*
 * @moleculer/database
 * Copyright (c) 2022 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { flatten } = require("../utils");
const BaseAdapter = require("./base");

let Datastore;

class NeDBAdapter extends BaseAdapter {
	/**
	 * Constructor of adapter
	 *
	 * @param  {String|Object?} opts
	 * @param  {Object?} opts.neDB More info: https://github.com/louischatriot/nedb#creatingloading-a-database
	 */
	constructor(opts) {
		if (_.isString(opts)) opts = { neDB: { filename: opts } };

		super(opts);

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

		try {
			Datastore = require("nedb");
		} catch (err) {
			/* istanbul ignore next */
			this.broker.fatal(
				"The 'nedb' package is missing! Please install it with 'npm install nedb --save' command.",
				err,
				true
			);
		}

		this.checkClientLibVersion("nedb", "^1.8.0");
	}

	/**
	 * Connect adapter to database
	 */
	async connect() {
		if (this.opts.neDB instanceof Datastore) this.db = this.opts.neDB;
		else this.db = new Datastore(this.opts.neDB);

		return new this.Promise((resolve, reject) => {
			this.db.loadDatabase(err => {
				if (err) return reject(err);
				resolve();
			});
		});
	}

	/**
	 * Disconnect adapter from database
	 */
	async disconnect() {
		this.db = null;
	}

	/**
	 * Find all entities by filters.
	 *
	 * @param {Object} params
	 * @returns {Promise<Array>}
	 */
	find(params) {
		return new this.Promise((resolve, reject) => {
			this.createQuery(params).exec((err, docs) => {
				if (err) return reject(err);
				resolve(docs);
			});
		});
	}

	/**
	 * Find an entity by query & sort
	 *
	 * @param {Object} params
	 * @returns {Promise<Object>}
	 */
	findOne(params) {
		return new this.Promise((resolve, reject) => {
			if (params.sort) {
				this.createQuery(params).exec((err, docs) => {
					if (err) return reject(err);
					resolve(docs.length > 0 ? docs[0] : null);
				});
			} else {
				this.db.findOne(params.query, (err, docs) => {
					if (err) return reject(err);
					resolve(docs);
				});
			}
		});
	}

	/**
	 * Find an entities by ID.
	 *
	 * @param {any} id
	 * @returns {Promise<Object>} Return with the found document.
	 *
	 */
	findById(id) {
		return new this.Promise((resolve, reject) => {
			this.db.findOne({ _id: id }, (err, docs) => {
				if (err) return reject(err);
				resolve(docs);
			});
		});
	}

	/**
	 * Find any entities by IDs.
	 *
	 * @param {Array<any>} idList
	 * @returns {Promise<Array>} Return with the found documents in an Array.
	 *
	 */
	findByIds(idList) {
		return new this.Promise((resolve, reject) => {
			this.db.find({ _id: { $in: idList } }).exec((err, docs) => {
				if (err) return reject(err);
				resolve(docs);
			});
		});
	}

	/**
	 * Get count of filtered entites.
	 * @param {Object} [params]
	 * @returns {Promise<Number>} Return with the count of documents.
	 *
	 */
	count(params) {
		return new Promise((resolve, reject) => {
			this.createQuery(params).exec((err, docs) => {
				if (err) return reject(err);

				resolve(docs.length);
			});
		});
	}

	/**
	 * Insert an entity.
	 *
	 * @param {Object} entity
	 * @returns {Promise<Object>} Return with the inserted document.
	 *
	 */
	insert(entity) {
		return new this.Promise((resolve, reject) => {
			this.db.insert(entity, (err, doc) => {
				if (err) return reject(err);
				resolve(doc);
			});
		});
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
	insertMany(entities, opts = {}) {
		return new this.Promise((resolve, reject) => {
			this.db.insert(entities, (err, docs) => {
				if (err) return reject(err);

				if (opts.returnEntities) resolve(docs);
				else resolve(docs.map(doc => doc._id));
			});
		});
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
	updateById(id, changes, opts) {
		const raw = opts && opts.raw ? true : false;
		if (!raw) {
			// Flatten the changes to dot notation
			changes = flatten(changes, { safe: true });
		}

		return new this.Promise((resolve, reject) => {
			this.db.update(
				{ _id: id },
				raw ? changes : { $set: changes },
				{ returnUpdatedDocs: true },
				(err, numAffected, affectedDocuments) => {
					if (err) return reject(err);
					resolve(affectedDocuments);
				}
			);
		});
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
	updateMany(query, changes, opts) {
		const raw = opts && opts.raw ? true : false;
		if (!raw) {
			// Flatten the changes to dot notation
			changes = flatten(changes, { safe: true });
		}

		return new this.Promise((resolve, reject) => {
			this.db.update(
				query,
				raw ? changes : { $set: changes },
				{ multi: true },
				(err, numAffected /*, affectedDocuments*/) => {
					if (err) return reject(err);
					resolve(numAffected);
				}
			);
		});
	}

	/**
	 * Replace an entity by ID
	 *
	 * @param {String} id
	 * @param {Object} entity
	 * @returns {Promise<Object>} Return with the updated document.
	 *
	 */
	replaceById(id, entity) {
		return new this.Promise((resolve, reject) => {
			this.db.update(
				{ _id: id },
				entity,
				{ returnUpdatedDocs: true },
				(err, numAffected, affectedDocuments) => {
					if (err) return reject(err);
					resolve(affectedDocuments);
				}
			);
		});
	}

	/**
	 * Remove an entity by ID
	 *
	 * @param {String} id
	 * @returns {Promise<any>} Return with ID of the deleted document.
	 *
	 */
	removeById(id) {
		return new this.Promise((resolve, reject) => {
			this.db.remove({ _id: id }, err => {
				if (err) return reject(err);
				resolve(id);
			});
		});
	}

	/**
	 * Remove entities which are matched by `query`
	 *
	 * @param {Object} query
	 * @returns {Promise<Number>} Return with the number of deleted documents.
	 *
	 */
	removeMany(query) {
		return new this.Promise((resolve, reject) => {
			this.db.remove(query, { multi: true }, (err, numRemoved) => {
				if (err) return reject(err);
				resolve(numRemoved);
			});
		});
	}

	/**
	 * Clear all entities from collection
	 *
	 * @returns {Promise<Number>}
	 *
	 */
	clear() {
		return new this.Promise((resolve, reject) => {
			this.db.remove({}, { multi: true }, (err, numRemoved) => {
				if (err) return reject(err);
				resolve(numRemoved);
			});
		});
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
	 * @returns {Query}
	 * @memberof MemoryDbAdapter
	 */
	createQuery(params) {
		if (params) {
			let q;

			// Text search
			let query = params.query || {};

			if (_.isString(params.search) && params.search !== "") {
				query.$where = function () {
					let doc = this;
					const s = params.search.toLowerCase();
					if (params.searchFields) doc = _.pick(this, params.searchFields);

					const res = _.values(doc).find(v => String(v).toLowerCase().indexOf(s) !== -1);
					return res != null;
				};
			}
			q = this.db.find(query);

			// Sort
			if (params.sort) {
				let pSort = params.sort;
				if (typeof pSort == "string") pSort = [pSort];

				const sortFields = {};
				pSort.forEach(field => {
					if (field.startsWith("-")) sortFields[field.slice(1)] = -1;
					else sortFields[field] = 1;
				});
				q.sort(sortFields);
			}

			// Limit
			if (_.isNumber(params.limit) && params.limit > 0) q.limit(params.limit);

			// Offset
			if (_.isNumber(params.offset) && params.offset > 0) q.skip(params.offset);

			return q;
		}

		return this.db.find({});
	}

	/**
	 * Create an index.
	 * More info: https://github.com/louischatriot/nedb#indexing
	 *
	 * @param {Object} def
	 * @param {String?} def.fields
	 * @param {String?} def.fieldName
	 * @param {Boolean?} def.unique
	 * @param {Boolean?} def.sparse
	 * @param {Number?} def.expireAfterSeconds
	 * @param {String?} def.name
	 */
	createIndex(def) {
		return new this.Promise((resolve, reject) => {
			let fieldName = def.fieldName || def.fields;
			if (_.isPlainObject(fieldName)) {
				fieldName = Object.keys(fieldName);
			}
			this.db.ensureIndex(
				{
					fieldName: fieldName,
					..._.omit(def, ["fieldName", "fields"])
				},
				err => {
					if (err) return reject(err);
					resolve();
				}
			);
		});
	}

	/**
	 * Remove an index.
	 *
	 * @param {Object} def
	 * @param {String|Array<String>|Object} def.fields
	 * @param {String?} def.name
	 * @returns {Promise<void>}
	 */
	removeIndex(def) {
		return new this.Promise((resolve, reject) => {
			this.db.removeIndex({ fieldName: def.fieldName || def.fields }, err => {
				if (err) return reject(err);
				resolve();
			});
		});
	}
}

module.exports = NeDBAdapter;

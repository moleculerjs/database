/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { promisify } = require("util");
const Datastore = require("nedb");
const BaseAdapter = require("./base");

class NeDBAdapter extends BaseAdapter {
	/**
	 * Constructor of adapter
	 * @param  {...any} args
	 */
	constructor(...args) {
		super(...args);

		this.opts = args[0];

		this.db = null;
	}

	/**
	 * Connect adapter to database
	 */
	async connect() {
		this.db = new Datastore(this.opts); // in-memory

		[
			"loadDatabase",
			//"insert",
			"findOne",
			"count",
			"remove",
			"ensureIndex",
			"removeIndex"
		].forEach(method => {
			this.db[method] = promisify(this.db[method]);
		});

		await this.db.loadDatabase();
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
	 * Find an entity by query
	 *
	 * @param {Object} query
	 * @returns {Promise<Object>}
	 */
	findOne(query) {
		return this.db.findOne(query);
	}

	/**
	 * Find an entities by ID.
	 *
	 * @param {any} id
	 * @returns {Promise<Object>} Return with the found document.
	 *
	 */
	findById(id) {
		return this.db.findOne({ _id: id });
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
	 * @returns {Promise<Array<Object>>} Return with the inserted documents in an Array.
	 *
	 */
	insertMany(entities) {
		return new this.Promise((resolve, reject) => {
			this.db.insert(entities, (err, doc) => {
				if (err) return reject(err);
				resolve(doc);
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
		return new this.Promise((resolve, reject) => {
			this.db.update(
				{ _id: id },
				opts && opts.raw ? changes : { $set: changes },
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
		return new this.Promise((resolve, reject) => {
			this.db.update(query, opts && opts.raw ? changes : { $set: changes }, { multi: true }, (
				err,
				numAffected /*, affectedDocuments*/
			) => {
				if (err) return reject(err);
				resolve(numAffected);
			});
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
	 * @returns {Promise<Object>} Return with the removed document.
	 *
	 */
	removeById(id) {
		return this.db.remove({ _id: id });
	}

	/**
	 * Remove entities which are matched by `query`
	 *
	 * @param {Object} query
	 * @returns {Promise<Number>} Return with the count of deleted documents.
	 *
	 */
	removeMany(query) {
		return this.db.remove(query, { multi: true });
	}

	/**
	 * Clear all entities from collection
	 *
	 * @returns {Promise<Number>}
	 *
	 */
	clear() {
		return this.db.remove({}, { multi: true });
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
				const sortFields = {};
				params.sort.forEach(field => {
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
}

module.exports = NeDBAdapter;

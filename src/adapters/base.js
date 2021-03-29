/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

class BaseAdapter {
	/**
	 * Constructor of adapter
	 * @param  {Object?} opts
	 */
	constructor(opts) {
		this.opts = opts || {};
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
		this.service = service;
		this.logger = service.logger;
		this.broker = service.broker;
		this.Promise = this.broker.Promise;
	}

	/**
	 * Connect adapter to database
	 */
	connect() {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Disconnect adapter from database
	 */
	disconnect() {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Find all entities by filters.
	 *
	 * @param {Object} filters
	 * @returns {Promise<Array>}
	 */
	find(/*params*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Find an entity by query
	 *
	 * @param {Object} query
	 * @returns {Promise<Object>}
	 */
	findOne(/*query*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Find an entities by ID.
	 *
	 * @param {any} id
	 * @returns {Promise<Object>} Return with the found document.
	 *
	 */
	findById(/*id*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Find any entities by IDs.
	 *
	 * @param {Array<any>} idList
	 * @returns {Promise<Array>} Return with the found documents in an Array.
	 *
	 */
	findByIds(/*idList*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Find all entities by filters and returns a Stream.
	 *
	 * @param {Object} params
	 * @returns {Promise<Stream>}
	 */
	findStream(/*params*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Get count of filtered entites.
	 * @param {Object} [filters={}]
	 * @returns {Promise<Number>} Return with the count of documents.
	 *
	 */
	count(/*filters*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Insert an entity.
	 *
	 * @param {Object} entity
	 * @returns {Promise<Object>} Return with the inserted document.
	 *
	 */
	insert(/*entity*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Insert many entities
	 *
	 * @param {Array<Object>} entities
	 * @returns {Promise<Array<Object>>} Return with the inserted documents in an Array.
	 *
	 */
	insertMany(/*entities*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Update an entity by ID
	 *
	 * @param {String} id
	 * @param {Object} changes
	 * @returns {Promise<Object>} Return with the updated document.
	 *
	 */
	updateById(/*id, changes*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Update many entities
	 *
	 * @param {Object} query
	 * @param {Object} changes
	 * @returns {Promise<Number>} Return with the count of modified documents.
	 *
	 */
	updateMany(/*query, changes*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Remove an entity by ID
	 *
	 * @param {String} id
	 * @returns {Promise<Object>} Return with the removed document.
	 *
	 */
	removeById(/*id*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Remove entities which are matched by `query`
	 *
	 * @param {Object} query
	 * @returns {Promise<Number>} Return with the count of deleted documents.
	 *
	 */
	removeMany(/*query*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Clear all entities from collection
	 *
	 * @returns {Promise<Number>}
	 */
	clear() {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
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
	 * Create an index. The `def` is adapter specific.
	 *
	 * @param {any} def
	 * @returns {Promise<void>}
	 */
	createIndex(/*def*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}
}

module.exports = BaseAdapter;

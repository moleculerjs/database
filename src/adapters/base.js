/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

class BaseAdapter {
	/**
	 * Constructor of adapter
	 * @param  {...any} args
	 */
	constructor(...args) {
		this.constructorArgs = args;
	}

	/**
	 * Initialize the adapter.
	 *
	 * @param {Service} service
	 */
	init(service) {
		this.service = service;
		this.broker = service.broker;
		this.Promise = this.broker.Promise;
	}

	/**
	 * Connect adapter to database
	 */
	connect() {
		return Promise.resolve();
	}

	/**
	 * Disconnect adapter from database
	 */
	disconnect() {
		return Promise.resolve();
	}

	/**
	 * Find all entities by filters.
	 *
	 * @param {Object} filters
	 * @returns {Promise<Array>}
	 */
	find(/*filters*/) {
		return Promise.resolve();
	}

	/**
	 * Find an entity by query
	 *
	 * @param {Object} query
	 * @returns {Promise<Object>}
	 */
	findOne(/*query*/) {
		return Promise.resolve();
	}

	/**
	 * Find an entities by ID.
	 *
	 * @param {any} id
	 * @returns {Promise<Object>} Return with the found document.
	 *
	 */
	findById(/*id*/) {
		return Promise.resolve();
	}

	/**
	 * Find any entities by IDs.
	 *
	 * @param {Array<any>} idList
	 * @returns {Promise<Array>} Return with the found documents in an Array.
	 *
	 */
	findByIds(/*idList*/) {
		return Promise.resolve();
	}

	/**
	 * Get count of filtered entites.
	 * @param {Object} [filters={}]
	 * @returns {Promise<Number>} Return with the count of documents.
	 *
	 */
	count(/*filters*/) {
		return Promise.resolve();
	}

	/**
	 * Insert an entity.
	 *
	 * @param {Object} entity
	 * @returns {Promise<Object>} Return with the inserted document.
	 *
	 */
	insert(/*entity*/) {
		return Promise.resolve();
	}

	/**
	 * Insert many entities
	 *
	 * @param {Array<Object>} entities
	 * @returns {Promise<Array<Object>>} Return with the inserted documents in an Array.
	 *
	 */
	insertMany(/*entities*/) {
		return Promise.resolve();
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
		return Promise.resolve();
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
		return Promise.resolve();
	}

	/**
	 * Remove an entity by ID
	 *
	 * @param {String} id
	 * @returns {Promise<Object>} Return with the removed document.
	 *
	 */
	removeById(/*id*/) {
		return Promise.resolve();
	}

	/**
	 * Remove entities which are matched by `query`
	 *
	 * @param {Object} query
	 * @returns {Promise<Number>} Return with the count of deleted documents.
	 *
	 */
	removeMany(/*query*/) {
		return Promise.resolve();
	}

	/**
	 * Clear all entities from collection
	 *
	 * @returns {Promise<Number>}
	 */
	clear() {
		return Promise.resolve();
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
		return Promise.resolve();
	}
}

module.exports = BaseAdapter;

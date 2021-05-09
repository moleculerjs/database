/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const semver = require("semver");

const clientStore = Symbol("db-adapter-client-store");

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

		// Global adapter store to share the adapters between services on the same broker if they use the same database.
		if (!this.broker[clientStore]) this.broker[clientStore] = new Map();
	}

	/**
	 * Check the installed client library version.
	 * https://github.com/npm/node-semver#usage
	 *
	 * @param {String} installedVersion
	 * @param {String} requiredVersions
	 * @returns {Boolean}
	 */
	checkClientLibVersion(library, requiredVersions) {
		const pkg = require(`${library}/package.json`);
		const installedVersion = pkg.version;

		if (semver.satisfies(installedVersion, requiredVersions)) {
			return true;
		} else {
			this.logger.warn(
				`The installed ${library} library is not supported officially. Proper functionality cannot be guaranteed. Supported versions:`,
				requiredVersions
			);
			return false;
		}
	}

	/**
	 * Get a DB client from global store. If it exists, set the adapter as a reference to it.
	 * @param {String} key
	 * @returns
	 */
	getClientFromGlobalStore(key) {
		const res = this.broker[clientStore].get(key);
		if (res) res.adapters.add(this);
		return res ? res.client : null;
	}

	/**
	 * Set a DB client to the global store
	 * @param {String} key
	 * @param {any} client
	 * @returns
	 */
	setClientToGlobalStore(key, client) {
		const adapters = new Set().add(this);
		return this.broker[clientStore].set(key, {
			client,
			adapters
		});
	}

	/**
	 * Remove a referenced adapter from the DB client in the global store.
	 * @param {String} key
	 * @returns {Boolean} If `true`, the adapter should close the connection,
	 */
	removeAdapterFromClientGlobalStore(key) {
		const res = this.broker[clientStore].get(key);
		if (res) {
			res.adapters.delete(this);
			if (res.adapters.size > 0) return false; // Adapter does't close the connection yet

			// Remove the client from store because there is no adapter
			this.broker[clientStore].delete(key);
		}
		// Asapter closes the connection
		return true;
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
	 * @param {Object} params
	 * @returns {Promise<Array>}
	 */
	find(/*params*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Find an entity by query & sort
	 *
	 * @param {Object} params
	 * @returns {Promise<Object>}
	 */
	findOne(/*params*/) {
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
	 * Replace an entity by ID
	 *
	 * @param {String} id
	 * @param {Object} entity
	 * @returns {Promise<Object>} Return with the updated document.
	 *
	 */
	replaceById(/*id, entity*/) {
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
	 * Create an index.
	 *
	 * @param {Object} def
	 * @param {String|Array<String>|Object} def.fields
	 * @param {String?} def.name
	 * @param {String?} def.type The type can be optionally specified for PostgreSQL and MySQL
	 * @param {Boolean?} def.unique
	 * @param {Boolean?} def.sparse The `sparse` can be optionally specified for MongoDB and NeDB
	 * @param {Number?} def.expireAfterSeconds The `expireAfterSeconds` can be optionally specified for MongoDB and NeDB
	 * @returns {Promise<void>}
	 */
	createIndex(/*def*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}

	/**
	 * Remove an index.
	 *
	 * @param {Object} def
	 * @param {String|Array<String>|Object} def.fields
	 * @param {String?} def.name
	 * @returns {Promise<void>}
	 */
	removeIndex(/*def*/) {
		/* istanbul ignore next */
		throw new Error("This method is not implemented.");
	}
}

module.exports = BaseAdapter;

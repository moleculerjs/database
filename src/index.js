/*
/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");

const DbActions = require("./db-actions");
const DbMethods = require("./db-methods");

module.exports = function DatabaseMixin(opts) {
	opts = _.defaultsDeep(opts, {
		createActions: true,
		actionVisibility: "published",
		//autoReconnect: true,
		cacheCleanEventName: null
	});

	const schema = {
		// Must overwrite it
		name: "",

		/**
		 * Default settings
		 */
		settings: {
			/** @type {Object?} Field filtering list. It must be an `Object`. If the value is `null` it won't filter the fields of entities. */
			fields: null,

			/** @type {Number} Default page size in `list` action. */
			pageSize: 10,

			/** @type {Number} Maximum page size in `list` action. */
			maxPageSize: 100,

			/** @type {Number} Maximum value of limit in `find` action. Default: `-1` (no limit) */
			maxLimit: -1,

			/** @type {Object?} Predefined scopes */
			scopes: {},

			/** @type {Array<String>?} Default scopes which applies to `find` & `list` actions */
			defaultScopes: null
		},

		/**
		 * Actions
		 */
		actions: {
			...DbActions(opts)
		},

		/**
		 * Methods
		 */
		methods: {
			...DbMethods(opts)
		}
	};

	if (opts.cacheCleanEventName) {
		schema.events = {
			/**
			 * Subscribe to the cache clean event. If it's triggered
			 * clean the cache entries for this service.
			 *
			 * @param {Context} ctx
			 */
			async [opts.cacheCleanEventName]() {
				if (this.broker.cacher) {
					await this.broker.cacher.clean(`${this.fullName}.*`);
				}
			}
		};
	}

	return schema;
};

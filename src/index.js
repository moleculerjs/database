/*
/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");

const Actions = require("./actions");
const DbMethods = require("./methods");
const Validation = require("./validation");
const Transform = require("./transform");
const {
	generateValidatorSchemaFromFields,
	getPrimaryKeyFromFields,
	fixIDInRestPath,
	fixIDInCacheKeys
} = require("./schema");
const pkg = require("../package.json");

module.exports = function DatabaseMixin(mixinOpts) {
	mixinOpts = _.defaultsDeep(mixinOpts, {
		/** @type {Boolean} Generate CRUD actions */
		createActions: true,

		/** @type {String} Default visibility of generated actions */
		actionVisibility: "published",

		/** @type {Boolean} Generate `params` schema for generated actions based on the `fields` */
		generateActionParams: true,

		/** @type {Boolean|String} Strict mode in validation schema for objects. Values: true|false|"remove" */
		strict: "remove",

		/** @type {Object} Caching settings */
		cache: {
			/** @type {Boolean} Enable caching of actions */
			enabled: true,
			/** @type {String} Name of event for clearing cache */
			eventName: null,
			/** @type {String} Type of event for clearing cache */
			eventType: "broadcast"
		},
		/** @type {Boolean} Set auto-aliasing fields */
		rest: true,

		// Entity changed lifecycle event mode. Values: null, "broadcast", "emit". The `null` disables event sending.
		entityChangedEventMode: "broadcast",

		/** @type {Number} Auto reconnect if the DB server is not available at first connecting */
		autoReconnect: true,

		/** @type {Number} Maximum value of limit in `find` action. Default: `-1` (no limit) */
		maxLimit: -1,

		/** @type {Number} Default page size in `list` action. */
		defaultPageSize: 10
	});

	const schema = {
		// Must overwrite it
		name: "",

		/**
		 * Metadata
		 */
		// Service's metadata
		metadata: {
			$category: "database",
			$description: "Official Data Access service",
			$official: true,
			$package: {
				name: pkg.name,
				version: pkg.version,
				repo: pkg.repository ? pkg.repository.url : null
			}
		},

		/**
		 * Default settings
		 */
		settings: {
			/** @type {Object?} Field filtering list. It must be an `Object`. If the value is `null` it won't filter the fields of entities. */
			fields: null,

			/** @type {Object?} Predefined scopes */
			scopes: {},

			/** @type {Array<String>?} Default scopes which applies to `find` & `list` actions */
			defaultScopes: null,

			/** @type {Object?} Index definitions */
			indexes: null
		},

		/**
		 * Actions
		 */
		actions: {
			...Actions(mixinOpts)
		},

		/**
		 * Methods
		 */
		methods: {
			...DbMethods(mixinOpts),
			...Transform(mixinOpts),
			...Validation(mixinOpts)
		},

		/**
		 * Create lifecycle hook of service
		 */
		created() {
			this.adapters = new Map();
		},

		/**
		 * Start lifecycle hook of service
		 */
		async started() {
			this._processFields();
		},

		/**
		 * Stop lifecycle hook of service
		 */
		async stopped() {
			return this._disconnectAll();
		},

		/**
		 * It is called when the Service schema mixins are merged. At this
		 * point, we can generate the validator schemas for the actions.
		 *
		 * @param {Object} schema
		 */
		merged(schema) {
			if (mixinOpts.createActions && schema.actions && schema.settings.fields) {
				const fields = schema.settings.fields;
				const primaryKeyField = getPrimaryKeyFromFields(fields);

				if (mixinOpts.generateActionParams) {
					// Generate action params
					if (Object.keys(fields).length > 0) {
						if (schema.actions.create) {
							schema.actions.create.params = generateValidatorSchemaFromFields(
								fields,
								{
									type: "create",
									strict: mixinOpts.strict
								}
							);
						}

						if (schema.actions.update) {
							schema.actions.update.params = generateValidatorSchemaFromFields(
								fields,
								{
									type: "update",
									strict: mixinOpts.strict
								}
							);
						}

						if (schema.actions.replace) {
							schema.actions.replace.params = generateValidatorSchemaFromFields(
								fields,
								{
									type: "replace",
									strict: mixinOpts.strict
								}
							);
						}
					}
				}

				if (primaryKeyField) {
					// Set `id` field name & type in `get`, `resolve` and `remove` actions
					if (schema.actions.get && schema.actions.get.params) {
						schema.actions.get.params[primaryKeyField.name] = {
							type: primaryKeyField.type,
							convert: true
						};
					}
					if (schema.actions.resolve && schema.actions.resolve.params) {
						schema.actions.resolve.params[primaryKeyField.name] = [
							{ type: "array", items: { type: primaryKeyField.type, convert: true } },
							{ type: primaryKeyField.type, convert: true }
						];
					}
					if (schema.actions.remove && schema.actions.remove.params) {
						schema.actions.remove.params[primaryKeyField.name] = {
							type: primaryKeyField.type,
							convert: true
						};
					}

					// Fix the ":id" variable name in the actions
					fixIDInRestPath(schema.actions.get, primaryKeyField);
					fixIDInRestPath(schema.actions.update, primaryKeyField);
					fixIDInRestPath(schema.actions.replace, primaryKeyField);
					fixIDInRestPath(schema.actions.remove, primaryKeyField);

					// Fix the "id" key name in the cache keys
					fixIDInCacheKeys(schema.actions.get, primaryKeyField);
					fixIDInCacheKeys(schema.actions.resolve, primaryKeyField);
				}
			}

			if (mixinOpts.cache && mixinOpts.cache.enabled) {
				if (mixinOpts.cache.eventName !== false) {
					const eventName = mixinOpts.cache.eventName || `cache.clean.${schema.name}`;
					if (!schema.events) schema.events = {};
					/**
					 * Subscribe to the cache clean event. If it's triggered
					 * clean the cache entries for this service.
					 */
					schema.events[eventName] = async function () {
						if (this.broker.cacher) {
							await this.broker.cacher.clean(`${this.fullName}.**`);
						}
					};
				}
			}
		}
	};

	return schema;
};

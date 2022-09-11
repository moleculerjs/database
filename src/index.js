/*
/*
 * @moleculer/database
 * Copyright (c) 2022 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");

const Actions = require("./actions");
const DbMethods = require("./methods");
const Validation = require("./validation");
const Transform = require("./transform");
const Monitoring = require("./monitoring");
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

		/** @type {Boolean} Enable to convert input params to the specified type */
		enableParamsConversion: true,

		/** @type {Boolean|String} Strict mode in validation schema for objects. Values: true|false|"remove" */
		strict: "remove",

		/** @type {Object} Caching settings */
		cache: {
			/** @type {Boolean} Enable caching of actions */
			enabled: true,
			/** @type {String} Name of event for clearing cache */
			eventName: null,
			/** @type {String} Type of event for clearing cache */
			eventType: "broadcast",
			/** @type {Boolean|Array<String>} Subscribe to cache clean event of service dependencies and clear the local cache entries */
			cacheCleanOnDeps: true,
			/** @type {Array<String>?} Additional cache keys */
			additionalKeys: null,
			/** @type {Function?} Custom cache cleaner function */
			cacheCleaner: null
		},
		/** @type {Boolean} Set auto-aliasing fields */
		rest: true,

		// Entity changed lifecycle event mode. Values: null, "broadcast", "emit". The `null` disables event sending.
		entityChangedEventType: "broadcast",

		// Add previous entity data to the entity changed event payload in case of update or replace.
		entityChangedOldEntity: false,

		/** @type {Number} Auto reconnect if the DB server is not available at first connecting */
		autoReconnect: true,

		/** @type {Number} Maximum number of connected adapters. In case of multi-tenancy */
		maximumAdapters: null,

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

			/** @type {Array<String>?} Default populated fields */
			defaultPopulates: null,

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
			...Validation(mixinOpts),
			...Monitoring(mixinOpts)
		},

		/**
		 * Create lifecycle hook of service
		 */
		created() {
			this.adapters = new Map();

			// Process custom DB hooks
			this.$hooks = {};
			if (this.schema.hooks && this.schema.hooks.customs) {
				_.map(this.schema.hooks.customs, (hooks, name) => {
					if (!Array.isArray(hooks)) hooks = [hooks];

					hooks = _.compact(
						hooks.map(h => {
							return _.isString(h) ? (_.isFunction(this[h]) ? this[h] : null) : h;
						})
					);

					this.$hooks[name] = (...args) => {
						return hooks.reduce(
							(p, fn) => p.then(() => fn.apply(this, args)),
							this.Promise.resolve()
						);
					};
				});
			}
		},

		/**
		 * Start lifecycle hook of service
		 */
		async started() {
			this._registerMoleculerMetrics();
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
			// Generate action `params`
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
									strict: mixinOpts.strict,
									enableParamsConversion: mixinOpts.enableParamsConversion
								}
							);
						}

						if (schema.actions.createMany) {
							schema.actions.createMany.params = {
								// TODO!
								$$root: true,
								type: "array",
								empty: false,
								items: {
									type: "object",
									strict: mixinOpts.strict,
									properties: generateValidatorSchemaFromFields(fields, {
										type: "create",
										level: 1,
										strict: mixinOpts.strict,
										enableParamsConversion: mixinOpts.enableParamsConversion
									})
								}
							};
						}

						if (schema.actions.update) {
							schema.actions.update.params = generateValidatorSchemaFromFields(
								fields,
								{
									type: "update",
									strict: mixinOpts.strict,
									enableParamsConversion: mixinOpts.enableParamsConversion
								}
							);
						}

						if (schema.actions.replace) {
							schema.actions.replace.params = generateValidatorSchemaFromFields(
								fields,
								{
									type: "replace",
									strict: mixinOpts.strict,
									enableParamsConversion: mixinOpts.enableParamsConversion
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
					schema.events[eventName] =
						mixinOpts.cache.cacheCleaner ||
						async function () {
							if (this.broker.cacher) {
								await this.broker.cacher.clean(`${this.fullName}.**`);
							}
						};
				}

				// Subscribe to additional service cache clean events
				if (mixinOpts.cache.cacheCleanOnDeps) {
					const additionalEventNames = [];
					if (Array.isArray(mixinOpts.cache.cacheCleanOnDeps)) {
						additionalEventNames.push(...mixinOpts.cache.cacheCleanOnDeps);
					} else if (mixinOpts.cache.cacheCleanOnDeps === true) {
						// Traverse dependencies and collect the service names
						const svcDeps = schema.dependencies;
						if (Array.isArray(svcDeps)) {
							additionalEventNames.push(
								...svcDeps
									.map(s => (_.isPlainObject(s) && s.name ? s.name : s))
									.map(s => `cache.clean.${s}`)
							);
						}
					}

					if (additionalEventNames.length > 0) {
						additionalEventNames.forEach(eventName => {
							schema.events[eventName] =
								mixinOpts.cache.cacheCleaner ||
								async function () {
									if (this.broker.cacher) {
										await this.broker.cacher.clean(`${this.fullName}.**`);
									}
								};
						});
					}
				}
			}
		}
	};

	return schema;
};

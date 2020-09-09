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

/*

  TODO:
	- [ ] Actions
		- [ ] `find`
		- [ ] `list`
		- [ ] `get` - receive only one entity
		- [ ] `resolve` - receive one or multiple entities (with mapping)
		- [ ] `create`
		- [ ] `insert`
		- [ ] `update`
		- [ ] `remove`

	- [ ] Field handlers
		- [ ] `id` field with `secure` option: { id: true, type: "string", readonly: true, secure: true, columnName: "_id" }
		- [ ] `columnName` support: { id: true, type: "string", columnName: "_id" }
		- [ ] Sanitizers
			- [ ] trim title: { type: "string", trim: true, maxlength: 50, required: true },
		- [ ] set: custom set formatter: { set: (value, entity, ctx) => slug(entity.title) }
		- [ ] get: custom get formatter: { get: (value, entity, ctx) => entity.firstName + ' ' + entity.lastName }
		- [ ] default value: status: { type: "number", default: 1 } // Optional field with default value
		- [ ] required: validation
		- [ ] readonly: { type: "string", readonly: true } // Can't be set and modified
		- [ ] hidden (password): password: { type: "string", hidden: true,
		- [ ] custom validator: { type: "string", validate: (value, entity, ctx) => value.length > 6 },	// Custom validator
		- [ ] populate: { populate: { action: "v1.accounts.resolve", fields: ["id", "name", "avatar"] }
		- [ ] permissions: roles: { type: "array", permissions: ["administrator"] } // Access control by permissions
		- [ ] readPermissions: { type: "array", populate: "v1.accounts.resolve", readPermissions: ["$owner"] }
		- [ ] setOnCreate: createdAt: { type: "number", readonly: true, setOnCreate: () => Date.now() }, // Set value when entity is created
		- [ ] setOnUpdate: updatedAt: { type: "number", readonly: true, setOnUpdate: () => Date.now() }, // Set value when entity is updated
		- [ ] setOnDelete: deletedAt: { type: "number", readonly: true, setOnDelete: () => Date.now() }, // Set value when entity is deleted

	- [ ] Methods
		- [ ] create indexes (execute the adapter)
		- [ ] methods for actions
		- [ ] sanitizator
		- [ ] transformer
		- [ ] populate
		- [ ] scopes

	- [ ] Soft delete
	- [ ] create validation from field definitions
	- [ ] nested objects in fields.
	- [ ] Multi model/tenant solutions
		- [ ] get connection/model dynamically
	- [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`


*/

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
			defaultScopes: null,

			/** @type {Object?} Adapter-specific index definitions */
			indexes: null
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

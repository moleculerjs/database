/*
/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { ServiceSchemaError } = require("moleculer").Errors;

const Adapters = require("./adapters");
const DbActions = require("./actions");
const DbMethods = require("./methods");

/*

  TODO:
	- [ ]
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

	- [ ] Methods (internal with _ prefix)
		- [ ] create indexes (execute the adapter)
		- [ ] methods for actions (findEntities, getEntity, countEntities, createEntity, updateEntity, removeEntity)
		- [ ] sanitizator
		- [ ] transformer
		- [ ] populate
		- [ ] scopes
		- [ ] `find` with stream option  http://mongodb.github.io/node-mongodb-native/3.5/api/Cursor.html#stream

	- [ ] Soft delete
	- [ ] create validation from field definitions
	- [ ] nested objects in fields.
	- [ ] Multi model/tenant solutions
		- [ ] get connection/model dynamically
	- [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`


*/

module.exports = function DatabaseMixin(mixinOpts) {
	mixinOpts = _.defaultsDeep(mixinOpts, {
		createActions: true,
		actionVisibility: "published",
		cache: {
			enable: true,
			eventName: null
		},
		/** @type {Boolean} Set auto-aliasing fields */
		rest: true,

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
		 * Default settings
		 */
		settings: {
			// TODO: model: { fields: { ... } } ???
			/** @type {Object?} Field filtering list. It must be an `Object`. If the value is `null` it won't filter the fields of entities. */
			fields: null,

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
			...DbActions(mixinOpts)
		},

		/**
		 * Methods
		 */
		methods: {
			...DbMethods(mixinOpts)
		},

		created() {
			this.adapter = Adapters.resolve(mixinOpts.adapter);
			this.adapter.init(this);
		},

		async started() {
			this._processFields();

			return this.connect();
		},

		async stopped() {
			return this.disconnect();
		}
	};

	if (mixinOpts.cache && mixinOpts.cache.enabled) {
		const eventName = mixinOpts.cache.eventName || `cache.clean.${this.name}`;
		schema.events = {
			/**
			 * Subscribe to the cache clean event. If it's triggered
			 * clean the cache entries for this service.
			 *
			 * @param {Context} ctx
			 */
			async [eventName]() {
				if (this.broker.cacher) {
					await this.broker.cacher.clean(`${this.fullName}.**`);
				}
			}
		};
	}

	return schema;
};

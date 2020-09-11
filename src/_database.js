/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { isPromise } = require("moleculer").Utils;
const { MoleculerClientError, ValidationError, ServiceSchemaError } = require("moleculer").Errors;

const MemoryAdapter = require("moleculer-db").MemoryAdapter;

class EntityNotFoundError extends MoleculerClientError {
	constructor(id) {
		super("Entity not found", 404, null, {
			id
		});
	}
}

/**
 * Service mixin to access database entities
 *
 * TODO:
 * 	- [ ] enhanced `fields` with visibility, default value...etc
 *      fields: {
 * 			[x] id: { id: true, type: "string", readonly: true, secure: true, columnName: "_id" }, // Can't set by user
 *			[ ] owner: { populate: { action: "v1.accounts.resolve", fields: ["id", "name", "avatar"] } }, // Populate via other service
 * 			[ ] title: { type: "string", trim: true, maxlength: 50, required: true },	// Sanitization & validation
 * 			[x] slug: { set: (value, entity, ctx) => slug(entity.title) }	// Custom formatter before saving
 * 			[x] fullName: { get: (value, entity, ctx) => entity.firstName + ' ' + entity.lastName }	// Virtual/calculated field
 * 			[ ] password: { type: "string", hidden: true, validate: (value, entity, ctx) => value.length > 6 },	// Custom validator
 * 			[x] status: { type: "number", default: 1 } // Optional field with default value
 * 			[ ] roles: { type: "array", permissions: ["administrator"] } // Access control by permissions
 * 			[ ] members: { type: "array", populate: "v1.accounts.resolve", readPermissions: ["$owner"] }
 * 			[ ] postCount: { type: "number", populate(values, entities, ctx) => this.Promise.all(
	 				entities.map(async e => e.postCount = await ctx.call("posts.count", { query: { author: e._id } })))
				},
 *			[x] createdAt: { type: "number", readonly: true, setOnCreate: () => Date.now() }, // Set value when entity is created
 *			[x] updatedAt: { type: "number", readonly: true, setOnUpdate: () => Date.now() }, // Set value when entity is updated
 *			[x] deletedAt: { type: "number", readonly: true, setOnDelete: () => Date.now() }, // Set value when entity is deleted
 *      }
 *  - [x] change fields to object instead of array. So it can be extended by mixins
 *  - [x] new attributes for fields
 * 			- [ ] `columnName`
 * 			- [ ] `columnType`
 *
 *  - [x] new set functions: `setOnCreate`, `setOnUpdate`, `setOnDelete`
 * 	- [ ] cascase delete. If an entity deleted, delete this entity from other tables too. (in rdbms)
 *  - [x] change optional to required.
 *  - [x] rewrite to async/await
 * 	- [ ] review populates
 *  - [ ] remove `id` field in replace/patch actions.
 * 	- [ ] review transform
 * 	- [x] rewrite `get` action. Rename to `resolve` and write a simple `get` action.
 * 	- [-] add `create`, `find` ...etc methods in order to create new actions easily
 * 	- [ ] tenant handling https://github.com/moleculerjs/moleculer-db/pull/5
 * 	- [ ] monorepo with adapters
 * 	- [?] multi collections in a service
 *  - [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`
 * 	- [x] softDelete option with `deletedAt` and `allowDeleted` params in find, list, get, resolve actions.
 *
 * @name moleculer-database
 * @module Service
 */
module.exports = function (adapter, opts) {
	let schema = {};

	if (opts.createActions || opts.createActions.create === true) {
		/**
		 * Create a new entity.
		 *
		 * @actions
		 *
		 * @returns {Object} Saved entity.
		 */
		schema.actions.create = {
			visibility: opts.actionVisibility,
			rest: "POST /",
			async handler(ctx) {
				const entity = await this.validateEntity(ctx, null, ctx.params, { type: "create" });
				return await this.adapter.insert(entity);
			}
		};

		schema.hooks.after.create = ["transformHook", "changedHook"];
	}

	if (opts.createActions || opts.createActions.insert === true) {
		/**
		 * Create many new entities.
		 *
		 * @actions
		 *
		 * @param {Object?} entity - Entity to save.
		 * @param {Array.<Object>?} entities - Entities to save.
		 *
		 * @returns {Object|Array.<Object>} Saved entity(ies).
		 */
		schema.actions.insert = {
			visibility: opts.actionVisibility,
			params: {
				entity: [
					{ type: "object", optional: true },
					{ type: "array", optional: true }
				]
			},
			async handler(ctx) {
				if (Array.isArray(ctx.params.entity)) {
					const entities = await Promise.all(
						ctx.params.entity.map(entity =>
							this.validateEntity(ctx, null, entity, { type: "create" })
						)
					);
					return await this.adapter.insertMany(entities);
				} else {
					const entity = await this.validateEntity(ctx, null, ctx.params.entity, {
						type: "create"
					});
					return await this.adapter.insert(entity);
				}
			}
		};

		//schema.hooks.before.insert = ["validateHook"];
		schema.hooks.after.insert = ["transformHook", "changedHook"]; // TODO `inserted` instead of [`created]`
	}

	if (opts.createActions || opts.createActions.get === true) {
		/**
		 * Get entity by ID.
		 *
		 * @actions
		 * @cached
		 *
		 * @param {any} id - ID of entity.
		 * @param {Array<String>?} populate - Field list for populate.
		 * @param {Array<String>?} fields - Fields filter.
		 * @param {Boolean?} mapping - Convert the returned `Array` to `Object` where the key is the value of `id`.
		 *
		 * @returns {Object} Found entity.
		 *
		 * @throws {EntityNotFoundError} - 404 Entity not found
		 */
		schema.actions.get = {
			visibility: opts.actionVisibility,
			rest: "GET /:id",
			cache: {
				keys: ["id", "populate", "fields"]
			},
			params: {
				id: [{ type: "string" }, { type: "number" }],
				populate: [
					{ type: "string", optional: true },
					{ type: "array", optional: true, items: "string" }
				],
				fields: [
					{ type: "string", optional: true },
					{ type: "array", optional: true, items: "string" }
				]
			},
			handler(ctx) {
				return ctx.locals.entity;
			}
		};

		schema.hooks.before.get = ["sanitizeFindHook", "findEntity", "entityNotFoundHook"];
		schema.hooks.after.get = ["transformHook"];
	}

	if (opts.createActions || opts.createActions.resolve === true) {
		/**
		 * Resolve entity(ies) by ID(s).
		 *
		 * @actions
		 * @cached
		 *
		 * @param {any|Array<any>} id - ID(s) of entity.
		 * @param {Array<String>?} populate - Field list for populate.
		 * @param {Array<String>?} fields - Fields filter.
		 * @param {Boolean?} mapping - Convert the returned `Array` to `Object` where the key is the value of `id`.
		 *
		 * @returns {Object|Array<Object>} Found entity(ies).
		 *
		 * @throws {EntityNotFoundError} - 404 Entity not found
		 */
		schema.actions.resolve = {
			visibility: opts.actionVisibility,
			cache: {
				keys: ["id", "populate", "fields", "mapping"]
			},
			params: {
				id: [{ type: "string" }, { type: "number" }, { type: "array" }],
				populate: [
					{ type: "string", optional: true },
					{ type: "array", optional: true, items: "string" }
				],
				fields: [
					{ type: "string", optional: true },
					{ type: "array", optional: true, items: "string" }
				],
				mapping: { type: "boolean", optional: true }
			},
			async handler(ctx) {
				const doc = ctx.locals.entity;
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				if (ctx.params.mapping === true) {
					let res = {};
					if (Array.isArray(json)) {
						json.forEach((doc, i) => {
							const id = json[i][this.$primaryField.name];
							res[id] = doc;
						});
					} else {
						res[json[this.$primaryField.name]] = json;
					}

					return res;
				}
				return json;
			}
		};

		schema.hooks.before.resolve = ["sanitizeFindHook", "findEntity", "entityNotFoundHook"];
		// TODO: schema.hooks.after.resolve = ["transformHook, "mappingHook"];
	}

	if (opts.createActions || opts.createActions.update === true) {
		/**
		 * Update an entity by ID.
		 * > After update, clear the cache & call lifecycle events.
		 *
		 * @actions
		 *
		 * @returns {Object} Updated entity.
		 *
		 * @throws {EntityNotFoundError} - 404 Entity not found
		 */
		schema.actions.update = {
			visibility: opts.actionVisibility,
			rest: "PATCH /:id",
			async handler(ctx) {
				let changes = Object.assign({}, ctx.params);
				delete changes[this.$primaryField.name];

				const entity = await this.validateEntity(ctx, ctx.locals.entity, changes, {
					type: "patch"
				});
				return await this.adapter.updateById(ctx.locals.entity._id, { $set: entity });
			}
		};

		schema.hooks.before.update = ["findEntity", "entityNotFoundHook"];
		schema.hooks.after.update = ["transformHook", "changedHook"];
	}

	if (opts.createActions || opts.createActions.replace === true) {
		/**
		 * Replace an entity by ID.
		 * > After replacing, clear the cache & call lifecycle events.
		 *
		 * @actions
		 *
		 * @returns {Object} Replaced entity.
		 *
		 * @throws {EntityNotFoundError} - 404 Entity not found
		 */
		schema.actions.replace = {
			visibility: opts.actionVisibility,
			rest: "PUT /:id",
			async handler(ctx) {
				let entity = ctx.params;

				entity = await this.validateEntity(ctx, ctx.locals.entity, entity, {
					type: "replace"
				});

				// TODO: implement replace in adapters
				return await this.adapter.updateById(ctx.locals.entity._id, { $set: entity });
			}
		};

		schema.hooks.before.replace = ["findEntity", "entityNotFoundHook"];
		schema.hooks.after.replace = ["transformHook", "changedHook"];
	}

	if (opts.createActions || opts.createActions.remove === true) {
		/**
		 * Remove an entity by ID.
		 *
		 * @actions
		 *
		 * @param {any} id - ID of entity.
		 * @returns {Number} Count of removed entities.
		 *
		 * @throws {EntityNotFoundError} - 404 Entity not found
		 */
		schema.actions.remove = {
			visibility: opts.actionVisibility,
			rest: "DELETE /:id",
			params: {
				id: { type: "any" }
			},
			async handler(ctx) {
				if (this.$softDelete) {
					// Soft delete
					const changes = {};
					await Promise.all(
						this.$fields.map(async field => {
							if (field.setOnDelete) {
								if (_.isFunction(field.setOnDelete)) {
									_.set(
										changes,
										field.name,
										await field.setOnDelete.call(
											this,
											_.get(ctx.locals.entity, field.name),
											ctx.locals.entity,
											ctx
										)
									);
								} else {
									_.set(changes, field.name, field.setOnDelete);
								}
							}
						})
					);

					await this.adapter.updateById(ctx.locals.entity._id, { $set: changes });
				} else {
					// Real delete
					await this.adapter.removeById(ctx.locals.entity._id);
				}
				return ctx.locals.entityID;
			}
		};

		schema.hooks.before.remove = ["findEntity", "entityNotFoundHook"];
		schema.hooks.after.remove = ["transformHook", "changedHook"];
	}

	/**
	 * Methods
	 */
	schema.methods = {
		/**
		 *
		 *
		 * @param {Context} ctx
		 * @param {*} docs
		 * @returns
		 */
		async transformHook(ctx, docs) {
			if (ctx.action.rawName == "list") {
				const res = await this.transformDocuments(ctx, ctx.params, docs[0]);
				return [res, docs[1]];
			}
			return await this.transformDocuments(ctx, ctx.params, docs);
		},

		/**
		 * Broadcast a cache cleaning event.
		 *
		 * @param {Context} ctx
		 * @param {*} json
		 * @returns
		 */
		async changedHook(ctx, json) {
			this.broker.broadcast(opts.cacheCleanEventName);
			return json;
		},

		/**
		 *
		 *
		 * @param {Context} ctx
		 * @returns
		 */
		async findEntity(ctx) {
			let id = ctx.params[this.$primaryField.name];
			if (id == null) id = ctx.params.id;

			if (id != null) {
				ctx.locals.entityID = id;
				const entity = await this.getById(id, this.$primaryField.secure);
				ctx.locals.entity = entity;
			}
		},

		/**
		 *
		 *
		 * @param {Context} ctx
		 * @returns
		 */
		entityNotFoundHook(ctx) {
			if (!ctx.locals.entity)
				return Promise.reject(new EntityNotFoundError(ctx.locals.entityID));
		},

		/**
		 * Get entity(ies) by ID(s).
		 *
		 * @methods
		 * @param {String|Number|Array} id - ID or IDs.
		 * @param {Boolean} decoding - Need to decode IDs.
		 * @returns {Object|Array<Object>} Found entity(ies).
		 */
		async getById(id, decoding) {
			if (Array.isArray(id))
				return await this.adapter.findByIds(decoding ? id.map(this.decodeID) : id);

			return await this.adapter.findById(decoding ? this.decodeID(id) : id);
		},

		/**
		 * Clear cached entities
		 *
		 * @methods
		 * @returns {Promise}
		 */
		async clearCache() {
			this.broker.broadcast(`cache.clean.${this.name}`);
			if (this.broker.cacher) this.broker.cacher.clean(`${this.name}.**`);
		},

		/**
		 *
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object} doc
		 * @param {Array<Object>} allFields
		 * @returns {Object}
		 */
		async reformFields(ctx, params, doc, allFields) {
			// Skip if fields is not defined in settings.
			if (!this.$fields) return Promise.resolve(doc);

			const wantedFields = params.fields;

			const res = {};
			const promises = [];

			const setValue = (res, field, value) => {
				// Encode secure ID
				if (field.primaryKey && field.secure && value != null) value = this.encodeID(value);

				_.set(res, field.name, value);
			};

			allFields.forEach(field => {
				// Skip if the field is not wanted
				if (wantedFields && wantedFields.indexOf(field.name) === -1) return;

				// Skip if hidden
				if (field.hidden === true) return;

				const value = _.get(doc, field.columnName || field.name);

				// Virtual or formatted field
				if (_.isFunction(field.get)) {
					const value = field.get.call(this, value, doc, ctx);
					if (isPromise(value)) promises.push(value.then(v => setValue(res, field, v)));
					else setValue(res, field, value);

					return;
				}

				if (value !== undefined) {
					setValue(res, field, value);
				}
			});

			await Promise.all(promises);
			return res;
		},

		/**
		 * Validate an entity before saving & updating
		 *
		 * @param {Context} ctx
		 * @param {Object} entity
		 * @param {Object} changes
		 * @param {Object} opts
		 * @returns {Object} validated entity
		 */
		async validateEntity(ctx, entity, changes, opts) {
			const isNew = opts.type == "create";
			entity = entity || {};

			// Copy all fields if fields in not defined in settings.
			if (!this.$fields) {
				_.forIn(changes, (value, key) => _.set(entity, key, value));

				return entity;
			}

			const authorizedFields = await this.authorizeFields(ctx, true);

			const updates = {};
			const promises = [];

			const callCustomFn = (field, fn, args) => {
				const value = fn.apply(this, args);
				if (isPromise(value)) promises.push(value.then(v => setValue(field, v)));
				else setValue(field, value);
			};

			const setValue = (field, value) => {
				// Validating
				if (value == null || (field.type == "string" && !value)) {
					if (field.required)
						promises.push(
							Promise.reject(
								new ValidationError(
									`The '${field.name}' field is required.`,
									"REQUIRED_FIELD",
									{
										field,
										value
									}
								)
							)
						); // TODO
					return;
				}

				// Sanitizing
				if (field.trim && value != null) {
					if (field.trim === true) value = value.trim();
					else if (field.trim === "right") value = value.trimRight();
					else if (field.trim === "left") value = value.trimLeft();
				}

				// TODO: more sanitization
				// - lowercase, uppercase, ...etc

				/**
				 * TODO:
				 * 	- custom validate fn
				 *  - min, max for number
				 *  - pattern for string
				 */

				_.set(entity, field.name, value);

				// Because the key is the path. Mongo overwrites a nested object if set a nested object
				updates[field.name] = value;
			};

			authorizedFields.forEach(field => {
				// Custom formatter
				if (isNew && _.isFunction(field.setOnCreate))
					return callCustomFn(field, field.setOnCreate, [
						_.get(changes, field.name),
						entity,
						ctx
					]);
				else if (!isNew && _.isFunction(field.setOnUpdate))
					return callCustomFn(field, field.setOnUpdate, [
						_.get(changes, field.name),
						entity,
						ctx
					]);
				else if (_.isFunction(field.set))
					return callCustomFn(field, field.set, [
						_.get(changes, field.name),
						entity,
						ctx
					]);

				// Get new value
				let value = _.get(changes, field.name);

				if (value !== undefined) {
					// Skip if readonly field
					if (field.readonly) return;

					// Skip if not allowed to update the field
					if (!isNew && field.updateable === false) return;
				}

				// Get previous value
				const prevValue = _.get(entity, field.name);

				// Skip if update and field is not defined but has previous value.
				if (!isNew && value == undefined && prevValue !== undefined) return;

				// Handle default value if new entity
				if (value == undefined) {
					const defaultValue = field.default;
					if (defaultValue !== undefined) {
						if (_.isFunction(defaultValue))
							return callCustomFn(field, defaultValue, [
								_.get(changes, field.name),
								entity,
								ctx
							]);

						value = defaultValue;
					}
				}

				// Set new value to entity
				setValue(field, value);
			});

			await Promise.all(_.compact(promises));
			return updates;
		},

		/**
		 * Authorize the required field list. Check the `permissions`
		 * and `readPermissions` against the logged in user's permissions.
		 *
		 * @param {Context} ctx
		 * @param {Boolean} readOnly
		 * @returns {Array}
		 */
		async authorizeFields(ctx, readOnly) {
			const res = [];

			await Promise.all(
				_.compact(
					this.$fields.map(field => {
						if (readOnly && field.readPermissions) {
							return this.checkAuthority(
								ctx,
								ctx.meta.roles,
								field.readPermissions
							).then(has => (has ? res.push(field) : null));
						}

						if (field.permissions) {
							return this.checkAuthority(
								ctx,
								ctx.meta.roles,
								field.permissions
							).then(has => (has ? res.push(field) : null));
						}

						res.push(field);
					})
				)
			);
			return res;
		},

		/**
		 *
		 *
		 * @param {Context} ctx
		 * @param {Array<String>} roles
		 * @param {Array<String>} permissions
		 * @returns {Promise<Boolean>}
		 */
		checkAuthority(ctx, roles, permissions) {
			return ctx.call("acl.hasAccess", { roles, permissions });
		},

		/**
		 * Transform the fetched documents
		 *
		 * @param {Array|Object} 	docs
		 * @param {Object} 			Params
		 * @returns {Array|Object}
		 */
		async transformDocuments(ctx, params, docs) {
			let isDoc = false;
			if (!Array.isArray(docs)) {
				if (_.isObject(docs)) {
					isDoc = true;
					docs = [docs];
				} else {
					// It's a number value (like count) or anything else.
					return docs;
				}
			}

			// Convert entity to JS object
			let json = docs.map(doc => this.adapter.entityToObject(doc));

			// Reforming & populating if fields is defined in settings.
			if (this.$fields) {
				// Get authorized fields
				const authorizedFields = await this.authorizeFields(ctx, true);

				// Populate
				if (ctx && params.populate)
					json = await this.populateDocs(ctx, json, params.populate, authorizedFields);

				// Reform object
				json = await Promise.all(
					json.map(doc => this.reformFields(ctx, params, doc, authorizedFields))
				);
			}

			// Return
			return isDoc ? json[0] : json;
		},

		/**
		 * Populate documents.
		 *
		 * @param {Context} 		ctx
		 * @param {Array|Object} 	docs
		 * @param {Array}			populateFields
		 * @param {Array<Object>} 	allFields
		 * @returns	{Promise}
		 */
		async populateDocs(ctx, docs, populateFields, allFields) {
			if (!Array.isArray(populateFields) || populateFields.length == 0) return docs;

			if (docs == null || !_.isObject(docs) || !Array.isArray(docs)) return docs;

			let promises = [];
			allFields.forEach(field => {
				if (field.populate == null) return; //Skip

				if (populateFields.indexOf(field.name) === -1) return; // skip

				let rule = field.populate;
				// if the rule is a function, save as a custom handler
				if (_.isFunction(rule)) {
					rule = { handler: rule };
				}

				// If string, convert to object
				if (_.isString(rule)) {
					rule = {
						action: rule
					};
				}
				rule.field = field;

				let arr = Array.isArray(docs) ? docs : [docs];

				// Collect IDs from field of docs (flatten, compact & unique list)
				// TODO handle `get`
				let idList = _.uniq(
					_.flattenDeep(_.compact(arr.map(doc => _.get(doc, field.name))))
				);
				// Replace the received models according to IDs in the original docs
				const resultTransform = populatedDocs => {
					if (populatedDocs == null) return;

					arr.forEach(doc => {
						let id = _.get(doc, field.name);
						if (Array.isArray(id)) {
							_.set(doc, field.name, _.compact(id.map(id => populatedDocs[id])));
						} else {
							_.set(doc, field.name, populatedDocs[id]);
						}
					});
				};

				if (rule.handler) {
					promises.push(rule.handler.call(this, idList, arr, ctx, rule));
				} else if (idList.length > 0) {
					// Call the target action & collect the promises
					const params = Object.assign(
						{
							id: idList,
							mapping: true,
							fields: rule.fields,
							populate: rule.populate
						},
						rule.params || {}
					);

					promises.push(ctx.call(rule.action, params).then(resultTransform));
				}
			});

			await Promise.all(promises);
			return docs;
		},

		/**
		 * Encode ID of entity.
		 *
		 * @methods
		 * @param {any} id
		 * @returns {any}
		 */
		encodeID(id) {
			return id;
		},

		/**
		 * Decode ID of entity.
		 *
		 * @methods
		 * @param {any} id
		 * @returns {any}
		 */
		decodeID(id) {
			return id;
		}
	};
};

// Export Memory Adapter class
module.exports.MemoryAdapter = MemoryAdapter;

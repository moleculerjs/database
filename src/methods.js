/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { Context } = require("moleculer");
const { EntityNotFoundError } = require("./errors");
const { MoleculerClientError, ValidationError } = require("moleculer").Errors;
const _ = require("lodash");
const { doc } = require("prettier");

module.exports = function (mixinOpts) {
	const cacheOpts = mixinOpts.cache && mixinOpts.cache.enabled ? mixinOpts.cache : null;

	return {
		/**
		 * Connect to the DB
		 */
		connect() {
			return new this.Promise((resolve, reject) => {
				const connecting = async () => {
					try {
						await this.adapter.connect();
						resolve();
					} catch (err) {
						this.logger.error("Connection error!", err);
						if (mixinOpts.autoReconnect) {
							setTimeout(() => {
								this.logger.warn("Reconnecting...");
								connecting();
							}, 1000);
						} else {
							reject(err);
						}
					}
				};
				connecting();
			});
		},

		/**
		 * Disconnect from DB
		 */
		disconnect() {
			if (this.adapter) return this.adapter.disconnect();
		},

		/**
		 * Processing the `fields` definition.
		 *
		 * @private
		 */
		_processFields() {
			this.$fields = null;

			if (_.isObject(this.settings.fields)) {
				this.$fields = _.compact(
					_.map(this.settings.fields, (value, name) => {
						// Disabled field
						if (value === false) return;

						// Shorthand format { title: true } => { title: {} }
						if (value === true) value = { type: "any" };

						// Shorthand format: { title: "string" } => { title: { type: "string" } }
						// TODO: | handling like if FastestValidator
						if (_.isString(value)) value = { type: value };

						// Copy the properties
						const field = Object.assign({}, value);

						// Set name of field
						field.name = name;

						if (!field.columnName) field.columnName = field.name;

						if (field.primaryKey === true) this.$primaryField = field;
						if (field.onDelete) this.$softDelete = true;

						return field;
					})
				);
			}

			if (!this.$primaryField) this.$primaryField = { name: "id", columnName: "_id" };
			if (this.$softDelete) this.logger.debug("Soft delete mode: ENABLED");
		},

		/**
		 * Apply scopes for the params query.
		 *
		 * @param {Object} params
		 * @param {Context?} ctx
		 */
		_applyScopes(params, ctx) {
			let scopes = null;
			if (params.scope) {
				scopes = Array.isArray(params.scope) ? params.scope : [params.scope];
			} else if (params.scope !== false) {
				scopes = this.settings.defaultScopes;
			}

			if (scopes && scopes.length > 0) {
				params.query = scopes.reduce((query, scopeName) => {
					const scope = this.settings.scopes[scopeName];
					if (!scope) return query;

					if (_.isFunction(scope)) return scope.call(this, query, ctx);
					else return _.defaultsDeep(query, scope);
				}, _.cloneDeep(params.query || {}));
			}

			return params;
		},

		/**
		 * Sanitize incoming parameters for `find`, `list`, `count` actions.
		 *
		 * @param {Object} p
		 * @param {Object?} opts
		 */
		sanitizeParams(p, opts) {
			if (typeof p.limit === "string") p.limit = Number(p.limit);
			if (typeof p.offset === "string") p.offset = Number(p.offset);
			if (typeof p.page === "string") p.page = Number(p.page);
			if (typeof p.pageSize === "string") p.pageSize = Number(p.pageSize);

			if (typeof p.query === "string") p.query = JSON.parse(p.query);

			if (typeof p.sort === "string") p.sort = p.sort.replace(/,/g, " ").split(" ");
			if (typeof p.fields === "string") p.fields = p.fields.replace(/,/g, " ").split(" ");
			if (typeof p.populate === "string")
				p.populate = p.populate.replace(/,/g, " ").split(" ");
			if (typeof p.searchFields === "string")
				p.searchFields = p.searchFields.replace(/,/g, " ").split(" ");

			if (opts && opts.removeLimit) {
				if (p.limit) delete p.limit;
				if (p.offset) delete p.offset;
				if (p.page) delete p.page;
				if (p.pageSize) delete p.pageSize;

				return p;
			}

			if (opts && opts.list) {
				// Default `pageSize`
				if (!p.pageSize) p.pageSize = mixinOpts.defaultPageSize;

				// Default `page`
				if (!p.page) p.page = 1;

				// Limit the `pageSize`
				if (mixinOpts.maxLimit > 0 && p.pageSize > mixinOpts.maxLimit)
					p.pageSize = mixinOpts.maxLimit;

				// Calculate the limit & offset from page & pageSize
				p.limit = p.pageSize;
				p.offset = (p.page - 1) * p.pageSize;
			}
			// Limit the `limit`
			if (mixinOpts.maxLimit > 0 && p.limit > mixinOpts.maxLimit)
				p.limit = mixinOpts.maxLimit;

			return p;
		},

		/**
		 * Find all entities by query & limit.
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async findEntities(ctx, params = ctx.params, opts = {}) {
			params = this.sanitizeParams(params);
			params = this._applyScopes(params, ctx);

			let result = await this.adapter.find(params);
			if (opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}
			return result;
		},

		/**
		 * Count entities by query & limit.
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		async countEntities(ctx, params = ctx.params) {
			params = this.sanitizeParams(params, { removeLimit: true });
			params = this._applyScopes(params, ctx);

			const result = await this.adapter.count(params);
			return result;
		},

		/**
		 * Find only one entity by query.
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async findEntity(ctx, params = ctx.params, opts = {}) {
			params = this.sanitizeParams(params, { removeLimit: true });
			params = this._applyScopes(params, ctx);
			params.limit = 1;

			let result = await this.adapter.findOne(params.query);
			if (opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}
			return result;
		},

		/**
		 * Get ID value from `params`.
		 *
		 * @param {Object} params
		 */
		_getIDFromParams(params, throwIfNotExist = true) {
			let id = params[this.$primaryField.columnName];
			if (id == null) id = params.id;

			if (throwIfNotExist && id == null) {
				throw new MoleculerClientError("Missing id field.", 400, "MISSING_ID", { params });
			}

			return id;
		},

		/**
		 * Resolve entities IDs with mapping.
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async resolveEntities(ctx, params = ctx.params, opts = {}) {
			// Get ID value from params
			let id = this._getIDFromParams(params);
			const origID = id;
			const multi = Array.isArray(id);
			if (!multi) id = [id];

			// Decode ID if need
			if (opts.secureID != null) {
				id = opts.secureID ? id.map(id => this.decodeID(id)) : id;
			} else if (this.$primaryField.secure) {
				id = id.map(id => this.decodeID(id));
			}

			// Apply scopes & set ID filtering
			params = Object.assign({}, params);
			const primaryFieldName = this.$primaryField.columnName;
			params = this._applyScopes(params, ctx);
			if (!params.query) params.query = {};

			if (multi) {
				params.query[primaryFieldName] = { $in: id };
			} else {
				params.query[primaryFieldName] = id[0];
			}

			// Find the entities
			let result = await this.adapter.find(params);
			if (!result || result.length == 0) throw new EntityNotFoundError(origID);

			if (!multi) {
				result = result[0];
			}

			// Transforming
			if (opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}

			// Mapping
			if (params.mapping === true) {
				if (Array.isArray(result)) {
					result = result.reduce((map, doc) => {
						const id = doc[primaryFieldName];
						map[id] = doc;
						return map;
					}, {});
				} else {
					const id = result[primaryFieldName];
					result = {
						[id]: result
					};
				}
			}

			return result;
		},

		/**
		 * Create an entity.
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async createEntity(ctx, params = ctx.params, opts = {}) {
			params = this.validateParams(ctx, params, { type: "create" });

			let result = await this.adapter.insert(params);
			if (opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}

			await this.entityChanged(result, ctx, { ...opts, type: "create" });
			return result;
		},

		/**
		 * Insert entities.
		 *
		 * @param {Context} ctx
		 * @param {Array<Object>?} params
		 * @param {Object?} opts
		 */
		async createEntities(ctx, params = ctx.params, opts = {}) {
			const entities = await Promise.all(
				params.map(entity => this.validateParams(ctx, entity, { type: "create" }))
			);
			let result = await this.adapter.insertMany(entities);
			if (opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}

			await this.entityChanged(result, ctx, { ...opts, type: "create", batch: true });
			return result;
		},

		/**
		 * Update an entity (patch).
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async updateEntity(ctx, params = ctx.params, opts = {}) {
			let id = this._getIDFromParams(params);

			/*const oldEntity = */ await this.resolveEntities(ctx, params);

			params = this.validateParams(ctx, params, { type: "update" });

			if (opts.secureID != null) {
				id = opts.secureID ? this.decodeID(id) : id;
			} else if (this.$primaryField.secure) {
				id = this.decodeID(id);
			}

			delete params[[this.$primaryField.columnName]];
			delete params.id; // TODO: find better solution

			const rawUpdate = params.$raw === true;
			if (rawUpdate) delete params.$raw;

			let result = await this.adapter.updateById(id, params, { raw: rawUpdate });

			if (opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}

			await this.entityChanged(result, ctx, { ...opts, type: "update" });
			return result;
		},

		/**
		 * Replace an entity.
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async replaceEntity(ctx, params = ctx.params, opts = {}) {
			let id = this._getIDFromParams(params);

			/*const oldEntity = */ await this.resolveEntities(ctx, params);

			params = this.validateParams(ctx, params, { type: "replace" });

			if (opts.secureID != null) {
				id = opts.secureID ? this.decodeID(id) : id;
			} else if (this.$primaryField.secure) {
				id = this.decodeID(id);
			}

			delete params[[this.$primaryField.columnName]];
			delete params.id; // TODO: find better solution

			let result = await this.adapter.replaceById(id, params);

			if (opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}

			await this.entityChanged(result, ctx, { ...opts, type: "replace" });
			return result;
		},

		/**
		 * Delete an entity.
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async removeEntity(ctx, params = ctx.params, opts = {}) {
			let id = this._getIDFromParams(params);
			const origID = id;

			let entity = await this.resolveEntities(ctx, params, { transform: false });

			if (opts.secureID != null) {
				id = opts.secureID ? this.decodeID(id) : id;
			} else if (this.$primaryField.secure) {
				id = this.decodeID(id);
			}

			if (this.$softDelete) {
				// Soft delete
				const changes = {};
				await Promise.all(
					this.$fields.map(async field => {
						if (field.onDelete) {
							if (_.isFunction(field.onDelete)) {
								_.set(
									changes,
									field.name,
									await field.onDelete.call(
										this,
										_.get(entity, field.name),
										entity,
										ctx
									)
								);
							} else {
								_.set(changes, field.name, field.onDelete);
							}
						}
					})
				);

				await this.adapter.updateById(id, changes);
			} else {
				// Real delete
				await this.adapter.removeById(id);
			}

			if (opts.transform !== false) {
				entity = await this.transformResult(entity, params, ctx);
			}

			await this.entityChanged(entity, ctx, {
				...opts,
				type: "remove",
				softDelete: !!this.$softDelete
			});

			return origID;
		},

		/**
		 * Clear all entities.
		 *
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		async clearEntities(ctx, params) {
			const result = await this.adapter.clear(params);
			return result;
		},

		/**
		 * Validate incoming parameters.
		 *
		 * @param {Context} ctx
		 * @param {Object} params
		 * @param {Object?} opts
		 */
		validateParams(ctx, params, opts) {
			// TODO:
			return params;
		},

		/**
		 * Transform the result rows.
		 *
		 * @param {Object|Array<Object>} docs
		 * @param {Object?} params
		 * @param {Context} ctx
		 */
		transformResult(docs, params, ctx) {
			let isDoc = false;
			if (!Array.isArray(docs)) {
				if (_.isObject(docs)) {
					isDoc = true;
					docs = [docs];
				} else {
					// Any other primitive value
					return Promise.resolve(docs);
				}
			}

			docs = docs.map(doc => {
				doc = this.adapter.entityToJSON(doc);
				//doc[this.$primaryField.columnName] = this.encodeID(doc[this.$primaryField.columnName]);
				return doc;
			});

			// TODO:

			return isDoc ? docs[0] : docs;
		},

		/**
		 * Create an index.
		 *
		 * @param {Object} def
		 */
		createIndex(def) {
			this.adapter.createIndex(def);
		},

		/**
		 * Called when an entity changed.
		 * @param {any} data
		 * @param {Context?} ctx
		 * @param {Object?} opts
		 */
		async entityChanged(data, ctx /*, opts = {}*/) {
			if (cacheOpts && cacheOpts.eventName) {
				// Cache cleaning event
				(ctx || this.broker).broadcast(cacheOpts.eventName);
			}
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

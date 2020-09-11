/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { Context } = require("moleculer");
const { MoleculerClientError, ValidationError } = require("moleculer").Errors;
const _ = require("lodash");

module.exports = function (opts) {
	return {
		/**
		 * Connect to the DB
		 */
		connect() {
			return new this.Promise((resolve, reject) => {
				const connecting = async () => {
					try {
						await this.connector.connect();
						resolve();
					} catch (err) {
						this.logger.error("Connection error!", err);
						if (opts.autoReconnect) {
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
			if (this.connector) return this.connector.disconnect();
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

						if (field.primaryKey === true) this.$primaryField = field;
						if (field.onDelete) this.$softDelete = true;

						return field;
					})
				);
			}

			if (!this.$primaryField) this.$primaryField = { name: "_id" };
			if (this.$softDelete) this.logger.debug("Soft delete mode: ENABLED");
		},

		/**
		 * Apply scopes for the params query.
		 *
		 * @param {Object} params
		 * @param {Context?} ctx
		 */
		applyScopes(params, ctx) {
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
			if (typeof p.sort === "string") p.sort = p.sort.replace(/,/g, " ").split(" ");
			if (typeof p.fields === "string") p.fields = p.fields.replace(/,/g, " ").split(" ");
			if (typeof p.populate === "string")
				p.populate = p.populate.replace(/,/g, " ").split(" ");
			if (typeof p.searchFields === "string")
				p.searchFields = p.searchFields.replace(/,/g, " ").split(" ");

			if (opts && opts.list) {
				// Default `pageSize`
				if (!p.pageSize) p.pageSize = opts.defaultPageSize;

				// Default `page`
				if (!p.page) p.page = 1;

				// Limit the `pageSize`
				if (opts.maxLimit > 0 && p.pageSize > opts.maxLimit) p.pageSize = opts.maxLimit;

				// Calculate the limit & offset from page & pageSize
				p.limit = p.pageSize;
				p.offset = (p.page - 1) * p.pageSize;
			}
			// Limit the `limit`
			if (opts.maxLimit > 0 && p.limit > opts.maxLimit) p.limit = opts.maxLimit;

			return p;
		},

		/**
		 * Find all entities by query & limit
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async findEntities(ctx, params = ctx.params, opts = {}) {
			params = this.sanitizeParams(params);
			params = this.applyScopes(params, ctx);

			let result = await this.connector.find(ctx, params);
			if (opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}
			return result;
		},

		/**
		 * Count entities by query & limit
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		async countEntities(ctx, params = ctx.params) {
			params = this.sanitizeParams(params);
			params = this.applyScopes(params, ctx);

			const result = await this.connector.count(ctx, params);
			return result;
		},

		/**
		 * Get an entity by ID
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async getEntity(ctx, params = ctx.params, opts = {}) {
			let id = ctx.params[this.$primaryField.name];
			if (id == null) id = ctx.params.id;

			if (id == null) {
				return this.Promise.reject(
					new MoleculerClientError("Missing id field.", 400, "MISSING_ID", { params })
				);
			}

			if (opts.secure != null) {
				id = opts.secure ? this.decodeID(id) : id;
			} else if (this.$primaryField.secure) {
				id = this.decodeID(id);
			}

			params = this.applyScopes(params, ctx); // TODO: applying to the `query` which is not used later.
			let result = await this.adapter.findById(id);
			if (result != null && opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}
			return result;
		},

		/**
		 * Get multiple entities by IDs with mapping
		 * @param {Context} ctx
		 * @param {Object?} params
		 * @param {Object?} opts
		 */
		async getEntities(ctx, params = ctx.params, opts = {}) {
			let id = ctx.params[this.$primaryField.name];
			if (id == null) id = ctx.params.id;

			if (id == null) {
				return this.Promise.reject(
					new MoleculerClientError("Missing id field.", 400, "MISSING_ID", { params })
				);
			}
			if (!Array.isArray(id)) id = [id];

			if (opts.secure != null) {
				id = opts.secure ? id.map(id => this.decodeID(id)) : id;
			} else if (this.$primaryField.secure) {
				id = id.map(id => this.decodeID(id));
			}

			params = this.applyScopes(params, ctx); // TODO: applying to the `query` which is not used later.
			let result = await this.adapter.findByIds(id);
			if (result != null && opts.transform !== false) {
				result = await this.transformResult(result, params, ctx);
			}
			return result;
		},

		/**
		 * Create an entity
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		createEntity(ctx, params = ctx.params) {
			// TODO:
		},

		/**
		 * Insert entity(ies)
		 * @param {Context} ctx
		 * @param {Object|Array<Object>?} params
		 */
		insertEntity(ctx, params = ctx.params) {
			// TODO:
		},

		/**
		 * Replace an entity
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		replaceEntity(ctx, params = ctx.params) {
			// TODO:
		},

		/**
		 * Update an entity (patch)
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		updateEntity(ctx, params = ctx.params) {
			// TODO:
		},

		/**
		 * Delete an entity
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		removeEntity(ctx, params = ctx.params) {
			// TODO:
		},

		/**
		 * Create an index
		 * @param {Object} def
		 */
		createIndex(def) {
			// TODO:
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

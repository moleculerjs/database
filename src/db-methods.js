/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { Context } = require("moleculer");
const _ = require("lodash");

module.exports = function (opts) {
	return {
		/**
		 * Apply scopes for the params query.
		 *
		 * @param {Context} ctx
		 * @param {Object} params
		 */
		applyScopes(ctx, params) {
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
		 * @param {Context} ctx
		 * @param {Object} p
		 */
		sanitizeParams(ctx, p) {
			if (typeof p.sort === "string") p.sort = p.sort.replace(/,/g, " ").split(" ");
			if (typeof p.fields === "string") p.fields = p.fields.replace(/,/g, " ").split(" ");
			if (typeof p.populate === "string")
				p.populate = p.populate.replace(/,/g, " ").split(" ");
			if (typeof p.searchFields === "string")
				p.searchFields = p.searchFields.replace(/,/g, " ").split(" ");

			if (ctx.action.name.endsWith(".list")) {
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
		 */
		findEntities(ctx, params = ctx.params) {
			// TODO:
		},

		/**
		 * Count entities by query & limit
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		countEntities(ctx, params = ctx.params) {
			// TODO:
		},

		/**
		 * Get an entity by ID
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		getEntity(ctx, params = ctx.params) {
			// TODO:
		},

		/**
		 * Get multiple entities by IDs with mapping
		 * @param {Context} ctx
		 * @param {Object?} params
		 */
		getEntities(ctx, params = ctx.params) {
			// TODO:
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
		}
	};
};

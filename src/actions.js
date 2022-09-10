/*
 * @moleculer/database
 * Copyright (c) 2022 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const PARAMS_FIELDS = [
	{ type: "string", optional: true },
	{ type: "array", optional: true, items: "string" }
];

const PARAMS_SEARCHFIELDS = [
	{ type: "string", optional: true },
	{ type: "array", optional: true, items: "string" }
];

const PARAMS_SORT = [
	{ type: "string", optional: true },
	{ type: "array", optional: true, items: "string" }
];

const PARAMS_POPULATE = [
	{ type: "string", optional: true },
	{ type: "array", optional: true, items: "string" }
];

const PARAMS_SCOPE = [
	{ type: "boolean", optional: true },
	{ type: "string", optional: true },
	{ type: "array", optional: true, items: "string" }
];

const PARAMS_QUERY = [
	{ type: "object", optional: true },
	{ type: "string", optional: true }
];

module.exports = function (mixinOpts) {
	const res = {};

	const cacheOpts = mixinOpts.cache && mixinOpts.cache.enabled ? mixinOpts.cache : null;
	const maxLimit = mixinOpts.maxLimit > 0 ? mixinOpts.maxLimit : null;

	const generateCacheOptions = minimalCacheKeys => {
		if (cacheOpts && cacheOpts.enabled) {
			const keys = Array.from(minimalCacheKeys);
			if (cacheOpts.additionalKeys) keys.push(...cacheOpts.additionalKeys);
			return { enabled: true, keys };
		}
		return null;
	};

	const actionEnabled = name => {
		if (typeof mixinOpts.createActions == "object") {
			return mixinOpts.createActions[name] !== false;
		}
		return mixinOpts.createActions !== false;
	};

	/**
	 * Find entities by query.
	 *
	 * @actions
	 * @cached
	 *
	 * @param {Number} limit - Max count of rows.
	 * @param {Number} offset - Count of skipped rows.
	 * @param {Array<String>?} fields - Fields filter.
	 * @param {String} sort - Sorted fields.
	 * @param {String} search - Search text.
	 * @param {String} searchFields - Fields for searching.
	 * @param {String|Array<String>|Boolean?} scope - Scoping
	 * @param {Array<String>?} populate - Populated fields.
	 * @param {Object} query - Query object. Passes to adapter.
	 *
	 * @returns {Array<Object>} List of found entities.
	 */
	if (actionEnabled("find")) {
		res.find = {
			visibility: mixinOpts.actionVisibility,
			rest: mixinOpts.rest ? "GET /all" : null,
			cache: generateCacheOptions([
				"limit",
				"offset",
				"fields",
				"sort",
				"search",
				"searchFields",
				"collation",
				"scope",
				"populate",
				"query"
			]),
			params: {
				limit: {
					type: "number",
					integer: true,
					min: 0,
					max: maxLimit,
					optional: true,
					convert: true
				},
				offset: { type: "number", integer: true, min: 0, optional: true, convert: true },
				fields: PARAMS_FIELDS,
				sort: PARAMS_SORT,
				search: { type: "string", optional: true },
				searchFields: PARAMS_SEARCHFIELDS,
				collation: { type: "object", optional: true },
				scope: PARAMS_SCOPE,
				populate: PARAMS_POPULATE,
				query: PARAMS_QUERY
			},
			async handler(ctx) {
				return this.findEntities(ctx);
			}
		};
	}

	/**
	 * Get count of entities by query.
	 *
	 * @actions
	 * @cached
	 *
	 * @param {String} search - Search text.
	 * @param {String} searchFields - Fields list for searching.
	 * @param {String|Array<String>|Boolean?} scope - Scoping
	 * @param {Object} query - Query object. Passes to adapter.
	 *
	 * @returns {Number} Count of found entities.
	 */
	if (actionEnabled("count")) {
		res.count = {
			visibility: mixinOpts.actionVisibility,
			rest: mixinOpts.rest ? "GET /count" : null,
			cache: generateCacheOptions(["search", "searchFields", "scope", "query"]),
			params: {
				search: { type: "string", optional: true },
				searchFields: PARAMS_SEARCHFIELDS,
				scope: PARAMS_SCOPE,
				query: PARAMS_QUERY
			},
			async handler(ctx) {
				return this.countEntities(ctx);
			}
		};
	}

	/**
	 * List entities by filters and pagination results.
	 *
	 * @actions
	 * @cached
	 *
	 * @param {Number} page - Page number.
	 * @param {Number} pageSize - Size of a page.
	 * @param {Array<String>?} fields - Fields filter.
	 * @param {String} sort - Sorted fields.
	 * @param {String} search - Search text.
	 * @param {String} searchFields - Fields for searching.
	 * @param {String|Array<String>|Boolean?} scope - Scoping
	 * @param {Array<String>?} populate - Populated fields.
	 * @param {Object} query - Query object. Passes to adapter.
	 *
	 * @returns {Object} List of found entities and total count.
	 */
	if (actionEnabled("list")) {
		res.list = {
			visibility: mixinOpts.actionVisibility,
			rest: mixinOpts.rest ? "GET /" : null,
			cache: generateCacheOptions([
				"page",
				"pageSize",
				"fields",
				"sort",
				"search",
				"searchFields",
				"collation",
				"scope",
				"populate",
				"query"
			]),
			params: {
				page: { type: "number", integer: true, min: 1, optional: true, convert: true },
				pageSize: {
					type: "number",
					integer: true,
					min: 1,
					max: maxLimit,
					optional: true,
					convert: true
				},
				fields: PARAMS_FIELDS,
				sort: PARAMS_SORT,
				search: { type: "string", optional: true },
				searchFields: PARAMS_SEARCHFIELDS,
				collation: { type: "object", optional: true },
				scope: PARAMS_SCOPE,
				populate: PARAMS_POPULATE,
				query: PARAMS_QUERY
			},
			async handler(ctx) {
				const params = this.sanitizeParams(ctx.params, { list: true });
				const rows = await this.findEntities(ctx, params);
				const total = await this.countEntities(ctx, params);

				return {
					// Rows
					rows,
					// Total rows
					total,
					// Page
					page: params.page,
					// Page size
					pageSize: params.pageSize,
					// Total pages
					totalPages: Math.floor((total + params.pageSize - 1) / params.pageSize)
				};
			}
		};
	}

	/**
	 * Get entity by ID.
	 *
	 * @actions
	 * @cached
	 *
	 * @param {any} id - ID of entity.
	 * @param {Array<String>?} fields - Fields filter.
	 * @param {Array<String>?} populate - Field list for populate.
	 * @param {String|Array<String>|Boolean?} scope - Scoping
	 *
	 * @returns {Object} Found entity.
	 *
	 * @throws {EntityNotFoundError} - 404 Entity not found
	 */
	if (actionEnabled("get")) {
		res.get = {
			visibility: mixinOpts.actionVisibility,
			rest: mixinOpts.rest ? "GET /:id" : null,
			cache: generateCacheOptions(["id", "fields", "scope", "populate"]),
			params: {
				// The "id" field get from `fields`
				fields: PARAMS_FIELDS,
				scope: PARAMS_SCOPE,
				populate: PARAMS_POPULATE
			},
			async handler(ctx) {
				return this.resolveEntities(ctx, ctx.params, { throwIfNotExist: true });
			}
		};
	}

	/**
	 * Resolve entity(ies) by ID(s).
	 *
	 * @actions
	 * @cached
	 *
	 * @param {any|Array<any>} id - ID(s) of entity.
	 * @param {Array<String>?} fields - Fields filter.
	 * @param {Array<String>?} populate - Field list for populate.
	 * @param {String|Array<String>|Boolean?} scope - Scoping
	 * @param {Boolean?} mapping - Convert the returned `Array` to `Object` where the key is the value of `id`.
	 *
	 * @returns {Object|Array<Object>} Found entity(ies).
	 *
	 * @throws {EntityNotFoundError} - 404 Entity not found
	 */
	if (actionEnabled("resolve")) {
		res.resolve = {
			visibility: mixinOpts.actionVisibility,
			cache: generateCacheOptions([
				"id",
				"fields",
				"scope",
				"populate",
				"mapping",
				"throwIfNotExist",
				"reorderResult"
			]),
			params: {
				// The "id" field get from `fields`
				fields: PARAMS_FIELDS,
				scope: PARAMS_SCOPE,
				populate: PARAMS_POPULATE,
				mapping: { type: "boolean", optional: true },
				throwIfNotExist: { type: "boolean", optional: true },
				reorderResult: { type: "boolean", optional: true }
			},
			async handler(ctx) {
				return this.resolveEntities(ctx, ctx.params, {
					throwIfNotExist: ctx.params.throwIfNotExist,
					reorderResult: ctx.params.reorderResult
				});
			}
		};
	}

	/**
	 * Create a new entity.
	 *
	 * @actions
	 *
	 * @returns {Object} Saved entity.
	 */
	if (actionEnabled("create")) {
		res.create = {
			visibility: mixinOpts.actionVisibility,
			rest: mixinOpts.rest ? "POST /" : null,
			// params: {}, generate from `fields` in the `merged`
			async handler(ctx) {
				return this.createEntity(ctx);
			}
		};
	}

	/**
	 * Create multiple entities.
	 *
	 * @actions
	 *
	 * @returns {Array<Object>} Saved entities.
	 */
	if (actionEnabled("createMany")) {
		res.createMany = {
			visibility: mixinOpts.actionVisibility,
			rest: null,
			// params: {}, generate from `fields` in the `merged`
			async handler(ctx) {
				return this.createEntities(ctx, ctx.params, { returnEntities: true });
			}
		};
	}

	/**
	 * Update an entity by ID. It's patch only the received fields.
	 *
	 * @actions
	 *
	 * @returns {Object} Updated entity.
	 *
	 * @throws {EntityNotFoundError} - 404 Entity not found
	 */
	if (actionEnabled("update")) {
		res.update = {
			visibility: mixinOpts.actionVisibility,
			rest: mixinOpts.rest ? "PATCH /:id" : null,
			// params: {}, generate from `fields` in the `merged`
			async handler(ctx) {
				return this.updateEntity(ctx);
			}
		};
	}

	/**
	 * Replace an entity by ID. Replace the whole entity.
	 *
	 * @actions
	 *
	 * @returns {Object} Replaced entity.
	 *
	 * @throws {EntityNotFoundError} - 404 Entity not found
	 */
	if (actionEnabled("replace")) {
		res.replace = {
			visibility: mixinOpts.actionVisibility,
			rest: mixinOpts.rest ? "PUT /:id" : null,
			// params: {}, generate from `fields` in the `merged`
			async handler(ctx) {
				return this.replaceEntity(ctx);
			}
		};
	}

	/**
	 * Remove an entity by ID.
	 *
	 * @actions
	 *
	 * @param {any} id - ID of entity.
	 * @returns {any} ID of removed entities.
	 *
	 * @throws {EntityNotFoundError} - 404 Entity not found
	 */
	if (actionEnabled("remove")) {
		res.remove = {
			visibility: mixinOpts.actionVisibility,
			rest: mixinOpts.rest ? "DELETE /:id" : null,
			params: {
				// The "id" field get from `fields`
			},
			async handler(ctx) {
				return this.removeEntity(ctx);
			}
		};
	}

	return res;
};

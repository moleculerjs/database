/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
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

module.exports = function (opts) {
	const res = {};

	const cacheOpts = opts.cache && opts.cache.enabled ? opts.cache : null;
	const maxLimit = opts.maxLimit > 0 ? opts.maxLimit : null;

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
	if (opts.createActions === true || opts.createActions.find === true) {
		res.find = {
			visibility: opts.actionVisibility,
			rest: opts.rest ? "GET /all" : null,
			cache: cacheOpts
				? {
						keys: [
							"limit",
							"offset",
							"fields",
							"sort",
							"search",
							"searchFields",
							"scope",
							"populate",
							"query"
						]
				  }
				: null,
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
				sort: { type: "string", optional: true },
				search: { type: "string", optional: true },
				searchFields: PARAMS_SEARCHFIELDS,
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
	if (opts.createActions === true || opts.createActions.count === true) {
		res.count = {
			visibility: opts.actionVisibility,
			rest: opts.rest ? "GET /count" : null,
			cache: cacheOpts
				? {
						keys: ["search", "searchFields", "scope", "query"]
				  }
				: null,
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
	if (opts.createActions === true || opts.createActions.list === true) {
		res.list = {
			visibility: opts.actionVisibility,
			rest: opts.rest ? "GET /" : null,
			cache: cacheOpts
				? {
						keys: [
							"page",
							"pageSize",
							"fields",
							"sort",
							"search",
							"searchFields",
							"scope",
							"populate",
							"query"
						]
				  }
				: null,
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
				sort: { type: "string", optional: true },
				search: { type: "string", optional: true },
				searchFields: PARAMS_SEARCHFIELDS,
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
	if (opts.createActions === true || opts.createActions.get === true) {
		res.get = {
			visibility: opts.actionVisibility,
			rest: opts.rest ? "GET /:id" : null,
			cache: cacheOpts
				? {
						keys: ["id", "populate", "fields"]
				  }
				: null,
			params: {
				id: [{ type: "string" }, { type: "number" }], // TODO: get from `fields`
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
	if (opts.createActions === true || opts.createActions.resolve === true) {
		res.resolve = {
			visibility: opts.actionVisibility,
			cache: cacheOpts
				? {
						keys: ["id", "populate", "fields", "mapping"]
				  }
				: null,
			params: {
				id: [
					// TODO: get from `fields`
					{ type: "string" },
					{ type: "number" },
					{ type: "array", items: "string" },
					{ type: "array", items: "number" }
				],
				fields: PARAMS_FIELDS,
				scope: PARAMS_SCOPE,
				populate: PARAMS_POPULATE,
				mapping: { type: "boolean", optional: true },
				throwIfNotExist: { type: "boolean", optional: true }
			},
			async handler(ctx) {
				return this.resolveEntities(ctx, ctx.params, {
					throwIfNotExist: ctx.params.throwIfNotExist
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
	if (opts.createActions === true || opts.createActions.create === true) {
		res.create = {
			visibility: opts.actionVisibility,
			rest: opts.rest ? "POST /" : null,
			params: {
				// TODO: generate from `fields`
			},
			async handler(ctx) {
				return this.createEntity(ctx);
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
	if (opts.createActions === true || opts.createActions.update === true) {
		res.update = {
			visibility: opts.actionVisibility,
			rest: opts.rest ? "PATCH /:id" : null,
			params: {
				id: [{ type: "string" }, { type: "number" }] // TODO: get from `fields`,
				// TODO: generate from `fields`
			},
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
	if (opts.createActions === true || opts.createActions.replace === true) {
		res.replace = {
			visibility: opts.actionVisibility,
			rest: opts.rest ? "PUT /:id" : null,
			params: {
				id: [{ type: "string" }, { type: "number" }] // TODO: get from `fields`,
				// TODO: generate from `fields`
			},
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
	if (opts.createActions === true || opts.createActions.remove === true) {
		res.remove = {
			visibility: opts.actionVisibility,
			rest: opts.rest ? "DELETE /:id" : null,
			params: {
				id: [{ type: "string" }, { type: "number" }] // TODO: get from `fields`,
			},
			async handler(ctx) {
				return this.removeEntity(ctx);
			}
		};
	}

	return res;
};

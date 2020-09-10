/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { Context } = require("moleculer");

/**
 * Find all entities by query & limit
 * @param {Context} ctx
 * @param {Object?} params
 */
async function findEntities(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Count entities by query & limit
 * @param {Context} ctx
 * @param {Object?} params
 */
async function countEntities(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Get an entity by ID
 * @param {Context} ctx
 * @param {Object?} params
 */
async function getEntity(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Get multiple entities by IDs with mapping
 * @param {Context} ctx
 * @param {Object?} params
 */
async function getEntities(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Create an entity
 * @param {Context} ctx
 * @param {Object?} params
 */
async function createEntity(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Insert entity(ies)
 * @param {Context} ctx
 * @param {Object|Array<Object>?} params
 */
async function insertEntity(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Replace an entity
 * @param {Context} ctx
 * @param {Object?} params
 */
async function replaceEntity(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Update an entity (patch)
 * @param {Context} ctx
 * @param {Object?} params
 */
async function updateEntity(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Delete an entity
 * @param {Context} ctx
 * @param {Object?} params
 */
async function removeEntity(ctx, params = ctx.params) {
	// TODO:
}

/**
 * Create an index
 * @param {Object} def
 */
async function createIndex(def) {
	// TODO:
}

module.exports = function (opts) {
	return {
		findEntities,
		countEntities,
		getEntity,
		getEntities,
		createEntity,
		insertEntity,
		updateEntity,
		replaceEntity,
		removeEntity,
		createIndex
	};
};

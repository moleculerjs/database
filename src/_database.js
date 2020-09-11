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

module.exports = function (adapter, opts) {
	let schema = {};

	/**
	 * Methods
	 */
	schema.methods = {
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

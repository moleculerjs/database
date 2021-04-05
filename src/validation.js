/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { Context } = require("moleculer"); // eslint-disable-line no-unused-vars
const { ServiceSchemaError, ValidationError } = require("moleculer").Errors;
const _ = require("lodash");
const { generateValidatorSchemaFromFields } = require("./schema");

const Validator = require("fastest-validator");
const validator = new Validator({
	useNewCustomCheckerFunction: true
});

module.exports = function (mixinOpts) {
	return {
		/**
		 * Processing the `fields` definition.
		 *
		 * @private
		 */
		_processFields() {
			this.$fields = null;
			this.$primaryField = null;
			this.$softDelete = false;
			this.$shouldAuthorizeFields = false;

			if (_.isObject(this.settings.fields)) {
				this.$fields = this._processFieldObject(this.settings.fields);

				// Compile validators for basic methods
				this.$validators = {
					create: validator.compile(
						generateValidatorSchemaFromFields(this.settings.fields, {
							type: "create"
						})
					),
					update: validator.compile(
						generateValidatorSchemaFromFields(this.settings.fields, {
							type: "update"
						})
					),
					replace: validator.compile(
						generateValidatorSchemaFromFields(this.settings.fields, {
							type: "replace"
						})
					)
				};
			}

			if (!this.$primaryField) this.$primaryField = { name: "_id", columnName: "_id" };
			if (this.$softDelete) this.logger.debug("Soft delete mode: ENABLED");
		},

		_processFieldObject(fields) {
			return _.compact(
				_.map(fields, (def, name) => {
					// Disabled field
					if (def === false) return;

					// Shorthand format { title: true } => { title: {} }
					if (def === true) def = { type: "any" };

					// Parse shorthand format: { title: "string|min:3" } => { title: { type: "string", min: 3 } }
					if (_.isString(def)) def = validator.parseShortHand(def);

					// Copy the properties
					const field = _.cloneDeep(def);

					// Set name of field
					field.name = name;

					if (!field.columnName) field.columnName = field.name;
					if (!field.columnType) field.columnType = field.type;

					if (field.primaryKey === true) this.$primaryField = field;

					if (field.onRemove) this.$softDelete = true;

					if (field.permission || field.readPermission) {
						this.$shouldAuthorizeFields = true;
					}

					if (field.required == null) {
						if (field.optional != null) field.required = !field.optional;
						else field.required = false;
					}

					if (field.populate) {
						if (_.isFunction(field.populate)) {
							field.populate = { handler: field.populate };
						} else if (_.isString(field.populate)) {
							field.populate = { action: field.populate };
						} else if (_.isObject(field.populate)) {
							if (!field.populate.action && !field.populate.handler) {
								throw new ServiceSchemaError(
									`Invalid 'populate' definition in '${this.fullName}' service. Missing 'action' or 'handler'.`,
									{ populate: field.populate }
								);
							}
						} else {
							throw new ServiceSchemaError(
								`Invalid 'populate' definition in '${this.fullName}' service. It should be a 'Function', 'String' or 'Object'.`,
								{ populate: field.populate }
							);
						}
					}

					// Handle nested object properties
					if (field.type == "object" && _.isPlainObject(field.properties)) {
						field.itemProperties = this._processFieldObject(field.properties);
					}

					// Handle array items
					if (field.type == "array" && _.isObject(field.items)) {
						let itemsDef = field.items;
						if (_.isString(field.items)) itemsDef = { type: field.items };

						if (itemsDef.type == "object" && itemsDef.properties) {
							field.itemProperties = this._processFieldObject(itemsDef.properties);
						}
					}

					return field;
				})
			);
		},

		/**
		 * Check the field authority. Should be implemented in the service.
		 *
		 * @param {Context} ctx
		 * @param {any} permission
		 * @param {Object} params
		 * @param {Object} field
		 */
		async checkAuthority(/*ctx, permission, params, field*/) {
			return true;
		},

		/**
		 * Authorize the fields based on logged in user (from ctx).
		 *
		 * @param {Array<Object>} fields
		 * @param {Context} ctx
		 * @param {Object} params
		 * @param {boolean} write
		 * @returns {Array<Object>}
		 */
		async _authorizeFields(fields, ctx, params, write) {
			if (!this.$shouldAuthorizeFields) return fields;

			const res = [];
			await Promise.all(
				_.compact(
					fields.map(field => {
						if (!write && field.readPermission) {
							return this.checkAuthority(
								ctx,
								field.readPermission,
								params,
								field
							).then(has => (has ? res.push(field) : null));
						} else if (field.permission) {
							return this.checkAuthority(
								ctx,
								field.permission,
								params,
								field
							).then(has => (has ? res.push(field) : null));
						}

						res.push(field);
					})
				)
			);
			return res;
		},

		/**
		 * Validate incoming parameters.
		 *
		 * @param {Context} ctx
		 * @param {Object} params
		 * @param {Object?} opts
		 */
		async validateParams(ctx, params, opts = {}) {
			const type = opts.type || "create";

			// Drop all fields if hard delete
			if (type == "remove" && !this.$softDelete) {
				return {};
			}

			// Copy all fields if fields in not defined in settings.
			if (!this.$fields) {
				return Object.assign({}, params);
			}

			const fields = Array.from(this.$fields);
			const entity = await this._validateObject(ctx, fields, params, opts);

			return entity;
		},

		/**
		 * Validate an object against field definitions.
		 *
		 * @param {Context} ctx
		 * @param {Array<Object>} fields
		 * @param {Object} params
		 * @param {Object} opts
		 * @returns
		 */
		async _validateObject(ctx, fields, params, opts) {
			const type = opts.type || "create";
			const oldEntity = opts.oldEntity;

			let entity = {};

			// Removing & Soft delete
			if (type == "remove" && this.$softDelete) {
				fields = fields.filter(field => !!field.onRemove);
			}

			// Validating (only the root level)
			if (!opts.nested) {
				const check = this.$validators[type];
				if (check) {
					const res = check(params);
					if (res !== true) {
						//console.log(res);
						throw new ValidationError("Parameters validation error!", null, res);
					}
				}
			}

			const sanitizeValue = async (field, value) => {
				if (value !== undefined) {
					// Custom validator
					// Syntax: `validate: (value, entity, field, ctx) => value.length > 6`
					if (field.validate) {
						const res = field.validate.call(this, value, params, field, ctx);
						if (res !== true) {
							throw new ValidationError(res, "VALIDATION_ERROR", {
								field: field.name,
								value
							});
						}
					}

					// Nested-object
					if (field.type == "object" && field.itemProperties) {
						value = await this._validateObject(ctx, field.itemProperties, value, {
							...opts,
							nested: true
						});
					}

					// Array
					if (field.type == "array") {
						if (!Array.isArray(value)) {
							throw new ValidationError(
								`The field '${field.name}' must be an Array.`,
								"VALIDATION_ERROR",
								{
									field: field.name,
									value
								}
							);
						}

						if (field.items) {
							if (field.itemProperties) {
								for (let i = 0; i < value.length; i++) {
									value[i] = await this._validateObject(
										ctx,
										field.itemProperties,
										value[i],
										{
											...opts,
											nested: true
										}
									);
								}
							} else if (field.items.type) {
								for (let i = 0; i < value.length; i++) {
									value[i] = await sanitizeValue(field.items, value[i]);
								}
							}
						}
					}
				}

				return value;
			};

			const setValue = async (field, value) => {
				value = await sanitizeValue(field, value);

				if (value !== undefined) {
					if (field.type == "array" || field.type == "object") {
						if (!opts.nestedFieldSupport) {
							if (Array.isArray(value) || _.isObject(value)) {
								value = JSON.stringify(value);
							}
						}
					}

					// Set the value to the entity, it's valid.
					_.set(entity, field.columnName, value);
				}
			};

			const authorizedFields = await this._authorizeFields(fields, ctx, params, false);

			await Promise.all(
				authorizedFields.map(async field => {
					let value = _.get(params, field.name);

					// Custom formatter (can be async)
					// Syntax: `set: (value, entity, field, ctx) => value.toUpperCase()`
					if (field.set) {
						value = await field.set.call(this, value, params, field, ctx);
					}

					// Handlers
					if (type == "create" && field.onCreate) {
						if (_.isFunction(field.onCreate)) {
							value = await field.onCreate.call(this, value, params, ctx);
						} else {
							value = field.onCreate;
						}
						return setValue(field, value);
					} else if (type == "update" && field.onUpdate) {
						if (_.isFunction(field.onUpdate)) {
							value = await field.onUpdate.call(this, value, params, ctx);
						} else {
							value = field.onUpdate;
						}
						return setValue(field, value);
					} else if (type == "replace" && field.onReplace) {
						if (_.isFunction(field.onReplace)) {
							value = await field.onReplace.call(this, value, params, ctx);
						} else {
							value = field.onReplace;
						}
						return setValue(field, value);
					} else if (type == "remove" && field.onRemove) {
						if (_.isFunction(field.onRemove)) {
							value = await field.onRemove.call(this, value, params, ctx);
						} else {
							value = field.onRemove;
						}
						return setValue(field, value);
					}

					// Readonly
					if (field.readonly || field.virtual) return;

					if (["create", "replace"].includes(type)) {
						// Default value
						if (value === undefined) {
							if (field.default !== undefined) {
								if (_.isFunction(field.default)) {
									value = await field.default.call(this, value, params, ctx);
								} else {
									value = field.default;
								}
							}
						}

						// Required/optional
						if (field.required) {
							if ((value === null && !field.nullable) || value === undefined) {
								throw new ValidationError(
									"Parameters validation error!",
									"VALIDATION_ERROR",
									[
										{
											type: "required",
											field: field.name,
											message: `The '${field.name}' field is required.`,
											actual: value
										}
									]
								);
							}
						}
					}

					// Immutable (should check the previous value, if not set yet, we should enable)
					if (["update", "replace"].includes(type) && field.immutable === true) {
						const prevValue = _.get(oldEntity, field.columnName);
						if (prevValue != null) {
							if (type == "update") {
								// Skip on update
								return;
							} else {
								// Use the previous value on replace
								value = prevValue;
							}
						}
					}

					await setValue(field, value);
				})
			);

			return entity;
		}
	};
};

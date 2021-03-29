/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { Context } = require("moleculer");
const { ServiceSchemaError, ValidationError } = require("moleculer").Errors;
const _ = require("lodash");

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

					// Shorthand format: { title: "string" } => { title: { type: "string" } }
					// TODO: | handling like if FastestValidator
					if (_.isString(def)) def = { type: def };

					// Copy the properties TOOD: deep clone due to nested fields
					const field = Object.assign({}, def);

					// Set name of field
					field.name = name;

					if (!field.columnName) field.columnName = field.name;

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

					if (field.type == "object" && _.isPlainObject(field.properties)) {
						field.properties = this._processFieldObject(field.properties);
					}

					if (field.type == "array") {
						if (_.isPlainObject(field.items)) {
							field.items = this._processFieldObject(field.items);
						} else if (_.isString(field.items)) {
							// ?
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
			const entity = await this._validateObject(ctx, fields, params, type);

			return entity;
		},

		/**
		 * Validate an object against field definitions.
		 *
		 * @param {Context} ctx
		 * @param {Array<Object>} fields
		 * @param {Object} params
		 * @param {String} type
		 * @returns
		 */
		async _validateObject(ctx, fields, params, type) {
			let entity = {};

			// Removing & Soft delete
			if (type == "remove" && this.$softDelete) {
				fields = fields.filter(field => !!field.onRemove);
			}

			const setValue = async (field, value) => {
				if (value !== undefined) {
					// Type conversion
					if (field.type == "string" && typeof value != "string" && value != null) {
						value = String(value);
					}
					if (field.type == "number" && typeof value != "number" && value != null) {
						const newVal = Number(value);
						if (Number.isNaN(newVal)) {
							throw new ValidationError(
								`Cast to Number failed for value '${value}'`,
								"CAST_ERROR",
								{
									field: field.name,
									value
								}
							);
						}
						value = newVal;
					}
					if (field.type == "boolean" && typeof value != "boolean" && value != null) {
						if (value === 1 || value === "true" || value === "1" || value === "on") {
							value = true;
						} else if (
							value === 0 ||
							value === "false" ||
							value === "0" ||
							value === "off"
						) {
							value = false;
						}
					}
					if (field.type == "date" && !(value instanceof Date) && value != null) {
						const newVal = new Date(value);
						if (isNaN(newVal.getTime())) {
							throw new ValidationError(
								`Cast to Date failed for value '${value}'`,
								"CAST_ERROR",
								{
									field: field.name,
									value
								}
							);
						}
						value = newVal;
					}

					// Sanitizations
					if (field.trim && typeof value == "string") {
						if (field.trim === true) value = value.trim();
						else if (field.trim === "right") value = value.trimRight();
						else if (field.trim === "left") value = value.trimLeft();
					}

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
					if (field.type == "object" && field.properties) {
						value = await this._validateObject(ctx, field.properties, value, type);
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
							if (typeof field.items == "string") {
								// ?
							} else if (typeof field.items == "object") {
								for (let i = 0; i < value.length; i++) {
									value[i] = await this._validateObject(
										ctx,
										field.items,
										value[i],
										type
									);
								}
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
					if (field.readonly) return;

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
									`The '${field.name}' field is required`,
									"REQUIRED_FIELD",
									{
										field: field.name,
										value
									}
								);
							}
						}
					}

					// Immutable (TODO: should check the previous value, if not set yet, we should enable)
					if (["update", "replace"].includes(type) && field.immutable === true) {
						// TODO throwing error instead of skipping?
						return;
					}

					await setValue(field, value);
				})
			);

			return entity;
		},

		_generateValidatorSchema(opts) {
			const type = opts.type || "create";

			const res = {
				$$strict: true
			};

			if (this.$fields == null) return res;

			this.$fields.forEach(field => {
				const schema = this._generateFieldValidatorSchema(field, opts);
				if (schema != null) res[field.name] = schema;
			});

			return res;
		},

		_generateFieldValidatorSchema(field, opts) {
			const schema = _.omit(field, [
				"name",
				"columnName",
				"primaryKey",
				"optional",
				"hidden",
				"readonly",
				"required",
				"onCreate",
				"onUpdate",
				"onReplace",
				"onRemove",
				"permission",
				"readPermission",
				"populate"
			]);

			// Type
			schema.type = field.type || "any";

			// Readonly -> Forbidden
			if (field.readonly == true) return null;

			// Primary key forbidden
			if (field.primaryKey && opts.type == "create") return null;

			// Required/Optional
			if (field.required === false) schema.optional = true;

			// Type conversion (enable by default)
			if (["number", "date", "boolean"].includes(field.type))
				schema.convert = field.convert != null ? field.convert : true;

			// Default value
			if (field.default !== undefined) schema.default = field.default;
			return schema;
		}
	};
};

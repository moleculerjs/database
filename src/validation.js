/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { Context } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const _ = require("lodash");

module.exports = function (mixinOpts) {
	return {
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
		 * Validate incoming parameters.
		 *
		 * @param {Context} ctx
		 * @param {Object} params
		 * @param {Object?} opts
		 */
		async validateParams(ctx, params, opts = {}) {
			const type = opts.type || "create";

			let entity = {};

			// Drop all fields if hard delete
			if (type == "remove" && !this.$softDelete) {
				return {};
			}

			// Copy all fields if fields in not defined in settings.
			if (!this.$fields) {
				return Object.assign(entity, params);
			}

			const setValue = function (field, value) {
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

					// Custom formatter
					// Syntax: `set: (value, entity, field, ctx) => value.toUpperCase()`
					if (field.set) {
						value = field.set.call(this, value, params, field, ctx);
					}

					// Set the value to the entity, it's valid.
					_.set(entity, field.columnName, value);
				}
			};

			let fields = Array.from(this.$fields);
			// Removing & Soft delete
			if (type == "remove" && this.$softDelete) {
				fields = fields.filter(field => !!field.onRemove);
			}

			const authorizedFields = await this._authorizeFields(fields, ctx, params, false);

			await Promise.all(
				authorizedFields.map(async field => {
					let value = _.get(params, field.name);

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
							if (field.default) {
								if (_.isFunction(field.default)) {
									value = await field.default.call(this, value, params, ctx);
								} else {
									value = field.default;
								}
							}
						}

						// Required
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

					// Immutable
					if (["update", "replace"].includes(type) && field.immutable === true) return;

					setValue(field, value);
				})
			);

			return entity;
		}
	};
};

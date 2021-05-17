/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { ServiceSchemaError, ValidationError } = require("moleculer").Errors;
const _ = require("lodash");

function deepResolve(values, resolvedObj) {
	if (!resolvedObj) return values;

	return values.map(v => {
		if (v != null) {
			if (Array.isArray(v)) return deepResolve(v, resolvedObj);
			else {
				const res = resolvedObj[v];
				// If not found, return the original value (which can be `null`)
				return res != null ? res : v;
			}
		}
		return v;
	});
}

module.exports = function (mixinOpts) {
	return {
		/**
		 * Transform the result rows.
		 *
		 * @param {Adapter?} adapter
		 * @param {Object|Array<Object>} docs
		 * @param {Object?} params
		 * @param {Context?} ctx
		 */
		async transformResult(adapter, docs, params, ctx) {
			let isDoc = false;
			if (!Array.isArray(docs)) {
				if (_.isObject(docs)) {
					isDoc = true;
					docs = [docs];
				} else {
					// Any other primitive value
					return docs;
				}
			}

			const span = this.startSpan(ctx, "Transforming result", { params });

			if (!adapter) adapter = await this.getAdapter(ctx);
			docs = docs.map(doc => adapter.entityToJSON(doc));

			if (this.$fields) {
				docs = await this._transformFields(adapter, docs, params, ctx);
			}

			this.finishSpan(ctx, span);

			return isDoc ? docs[0] : docs;
		},

		/**
		 * Transform fields on documents.
		 *
		 * @param {Adapter} adapter
		 * @param {Array<Object>} docs
		 * @param {Object} params
		 * @param {Context?} ctx
		 */
		async _transformFields(adapter, docs, params, ctx) {
			let customFieldList = false;
			let selectedFields = this.$fields;
			if (Array.isArray(params.fields)) {
				selectedFields = this.$fields.filter(f => params.fields.includes(f.name));
				customFieldList = true;
			}
			const authorizedFields = await this._authorizeFields(selectedFields, ctx, params, {
				isWrite: false
			});

			const res = Array.from(docs).map(() => ({}));

			let needPopulates = this.settings.defaultPopulates;
			if (params.populate === false) needPopulates = null;
			else if (_.isString(params.populate)) needPopulates = [params.populate];
			else if (Array.isArray(params.populate)) needPopulates = params.populate;

			await Promise.all(
				authorizedFields.map(async field => {
					if (field.hidden === true) return;
					else if (field.hidden == "byDefault" && !customFieldList) return;

					// Field values
					let values = docs.map(doc => _.get(doc, field.columnName));

					if (!adapter.hasNestedFieldSupport) {
						if (field.type == "array" || field.type == "object") {
							values = values.map(v => {
								if (typeof v === "string") {
									try {
										return JSON.parse(v);
									} catch (e) {
										this.logger.warn("Unable to parse the JSON value", v);
									}
								}
								return v;
							});
						}
					}

					// Populating
					if (
						field.populate &&
						needPopulates != null &&
						needPopulates.includes(field.name)
					) {
						if (field.populate.keyField) {
							// Using different field values as key values
							const keyField = this.$fields.find(
								f => f.name == field.populate.keyField
							);
							if (!keyField) {
								throw new ServiceSchemaError(
									`The 'keyField' is not exist in populate definition of '${field.name}' field.`,
									{ field }
								);
							}

							values = docs.map(doc => _.get(doc, keyField.columnName));
						}

						const resolvedObj = await this._populateValues(field, values, docs, ctx);
						// Received the values from custom populate
						if (Array.isArray(resolvedObj)) values = resolvedObj;
						// Received the values from action resolving
						else values = deepResolve(values, resolvedObj);
					}

					// Virtual or formatted field
					if (_.isFunction(field.get)) {
						values = await Promise.all(
							values.map(async (v, i) => field.get.call(this, v, docs[i], field, ctx))
						);
					}

					// Secure ID field
					if (field.secure) {
						values = values.map(v => this.encodeID(v));
					}

					// Set values to result
					res.map((doc, i) => {
						if (values[i] !== undefined) _.set(doc, field.name, values[i]);
					});
				})
			);

			return res;
		},

		/**
		 * Populate values.
		 *
		 * @param {Object} field
		 * @param {Array<any>} values
		 * @param {Array<Object>} docs
		 * @param {Context?} ctx
		 * @returns {Object}
		 */
		async _populateValues(field, values, docs, ctx) {
			values = _.uniq(_.compact(_.flattenDeep(values)));

			const rule = field.populate;
			if (rule.handler) {
				return await rule.handler.call(this, ctx, values, docs, field);
			}

			if (values.length == 0) return {};

			const params = {
				...(rule.params || {}),
				id: values,
				mapping: true,
				throwIfNotExist: false
			};

			return await (ctx || this.broker).call(rule.action, params, rule.callOptions);
		}
	};
};

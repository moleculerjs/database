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
		 * Transform the result rows.
		 *
		 * @param {Object|Array<Object>} docs
		 * @param {Object?} params
		 * @param {Context} ctx
		 */
		async transformResult(docs, params, ctx) {
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

			docs = docs.map(doc => this.adapter.entityToJSON(doc));

			if (this.$fields) {
				docs = await this._transformFields(docs, ctx, params);
			}

			return isDoc ? docs[0] : docs;
		},

		/**
		 * Transform fields on documents.
		 *
		 * @param {Array<Object>} docs
		 * @param {Context} ctx
		 * @param {Object} params
		 */
		async _transformFields(docs, ctx, params) {
			const selectedFields = params.fields || this.$fields;
			const authorizedFields = await this._authorizeFields(
				selectedFields,
				ctx,
				params,
				false
			);

			const res = Array.from(docs).map(() => ({}));

			await Promise.all(
				authorizedFields.map(async field => {
					if (field.hidden === true) return;

					// Get field values
					let values = docs.map(doc => _.get(doc, field.columnName));

					// TODO: populates

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
					res.map((doc, i) => _.set(doc, field.name, values[i]));
				})
			);

			return res;
		}
	};
};

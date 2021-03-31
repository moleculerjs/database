/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");

const Validator = require("fastest-validator");
const validator = new Validator({
	useNewCustomCheckerFunction: true
});

function generateValidatorSchemaFromFields(fields, opts) {
	const res = {};

	if (fields == null || Object.keys(fields).length == 0) return res;

	res.$$strict = true;

	opts == opts || {};
	if (opts.level == null) opts.level = 0;

	_.map(fields, (field, name) => {
		if (field === false) return;
		if (typeof field == "string") field = validator.parseShortHand(field);

		const schema = generateFieldValidatorSchema(field, opts);
		if (schema != null) res[name] = schema;
	});

	return res;
}

function generateFieldValidatorSchema(field, opts) {
	const schema = _.omit(field, [
		"name",
		"required",
		"optional",
		"columnName",
		"primaryKey",
		"optional",
		"hidden",
		"readonly",
		"required",
		"immutable",
		"onCreate",
		"onUpdate",
		"onReplace",
		"onRemove",
		"permission",
		"readPermission",
		"populate",
		"itemProperties",
		"set",
		"get",
		"validate"
	]);

	// Type
	schema.type = field.type || "any";

	// Readonly -> Forbidden
	if (field.readonly == true) return null;

	// Primary key forbidden on create
	if (field.primaryKey && opts.type == "create") return null;

	// Required/Optional
	if (!field.required) schema.optional = true;

	// On update, every field is optional except primaryKey
	if (opts.type == "update") schema.optional = !field.primaryKey;

	// On replace, the primaryKey is required
	if (opts.type == "replace" && field.primaryKey) schema.optional = false;

	// Type conversion (enable by default)
	if (["number", "date", "boolean"].includes(field.type))
		schema.convert = field.convert != null ? field.convert : true;

	// Default value
	if (field.default !== undefined) schema.default = _.cloneDeep(field.default);

	// Nested object
	if (field.type == "object" && field.properties) {
		schema.properties = generateValidatorSchemaFromFields(field.properties, {
			...opts,
			level: opts.level + 1
		});
	}

	// Array
	if (field.type == "array" && field.items) {
		schema.items = generateFieldValidatorSchema(field.items, opts);
	}

	return schema;
}

module.exports = {
	generateValidatorSchemaFromFields,
	generateFieldValidatorSchema
};

/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const Schema = require("./src/schema");

module.exports = {
	Service: require("./src"),
	Adapters: require("./src/adapters"),
	Errors: require("./src/errors"),
	generateValidatorSchemaFromFields: Schema.generateValidatorSchemaFromFields,
	generateFieldValidatorSchema: Schema.generateFieldValidatorSchema
};

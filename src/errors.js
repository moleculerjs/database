/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

class EntityNotFoundError extends MoleculerClientError {
	constructor(id) {
		super("Entity not found", 404, null, {
			id
		});
	}
}

module.exports = { EntityNotFoundError };

/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { isObject, isString } = require("lodash");
const { ServiceSchemaError } = require("moleculer").Errors;

const Connectors = {
	Base: require("./base.connector"),
	CouchDB: require("./couchdb.connector"),
	Mongo: require("./mongo.connector"),
	Mongoose: require("./mongoose.connector"),
	NeDB: require("./nedb.connector"),
	Sequelize: require("./sequelize.connector")
};

function getByName(name) {
	if (!name) return null;

	let n = Object.keys(Connectors).find(n => n.toLowerCase() == name.toLowerCase());
	if (n) return Connectors[n];
}

/**
 * Resolve connector by name
 *
 * @param {object|string} opt
 * @returns {Connector}
 */
function resolve(opt) {
	if (opt instanceof Connectors.Base) {
		return opt;
	} else if (isString(opt)) {
		const ConnectorClass = getByName(opt);
		if (ConnectorClass) {
			return new ConnectorClass();
		} else {
			throw new ServiceSchemaError(`Invalid Connector type '${opt}'.`, { type: opt });
		}
	} else if (isObject(opt)) {
		const ConnectorClass = getByName(opt.type || "NeDB");
		if (ConnectorClass) {
			return new ConnectorClass(opt.options);
		} else {
			throw new ServiceSchemaError(`Invalid Connector type '${opt.type}'.`, {
				type: opt.type
			});
		}
	}

	return new Connectors.NeDB();
}

function register(name, value) {
	Connectors[name] = value;
}

module.exports = Object.assign(Connectors, { resolve, register });

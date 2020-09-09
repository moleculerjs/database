/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { isObject, isString } = require("../utils");
const { MoleculerError } = require("moleculer").Errors;

const Connectors = {
	Base: require("./base"),
	CouchDB: require("./couchdb"),
	Mongo: require("./mongo"),
	Mongoose: require("./mongoose"),
	NeDB: require("./nedb"),
	Sequelize: require("./sequelize")
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
			throw new MoleculerError(`Invalid Connector type '${opt}'.`, { type: opt });
		}
	} else if (isObject(opt)) {
		const ConnectorClass = getByName(opt.type || "NeDB");
		if (ConnectorClass) {
			return new ConnectorClass(opt.options);
		} else {
			throw new MoleculerError(`Invalid Connector type '${opt.type}'.`, {
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

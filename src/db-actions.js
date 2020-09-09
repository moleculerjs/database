/*
 * @moleculer/database
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const ACTION_FIND = {};
const ACTION_COUNT = {};
const ACTION_LIST = {};
const ACTION_GET = {};
const ACTION_RESOLVE = {};
const ACTION_CREATE = {};
const ACTION_INSERT = {};
const ACTION_UPDATE = {};
const ACTION_REMOVE = {};

module.exports = function (opts) {
	const res = {};

	if (opts.createActions === true || opts.createActions.find === true) res.find = ACTION_FIND;
	if (opts.createActions === true || opts.createActions.count === true) res.find = ACTION_COUNT;
	if (opts.createActions === true || opts.createActions.list === true) res.find = ACTION_LIST;
	if (opts.createActions === true || opts.createActions.get === true) res.find = ACTION_GET;
	if (opts.createActions === true || opts.createActions.resolve === true)
		res.find = ACTION_RESOLVE;
	if (opts.createActions === true || opts.createActions.create === true) res.find = ACTION_CREATE;
	if (opts.createActions === true || opts.createActions.insert === true) res.find = ACTION_INSERT;
	if (opts.createActions === true || opts.createActions.update === true) res.find = ACTION_UPDATE;
	if (opts.createActions === true || opts.createActions.remove === true) res.find = ACTION_REMOVE;

	return res;
};

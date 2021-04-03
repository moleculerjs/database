/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

module.exports = {
	/**
	 * Flatten an object.
	 * Credits: "flat" library
	 *
	 * @param {Object} target
	 * @param {Object?} opts
	 * @returns {Object}
	 */
	flatten: (target, opts) => {
		opts = opts || {};

		const delimiter = opts.delimiter || ".";
		const maxDepth = opts.maxDepth;
		const transformKey = opts.transformKey || (key => key);
		const output = {};

		const step = (object, prev, currentDepth) => {
			currentDepth = currentDepth || 1;
			Object.keys(object).forEach(key => {
				const value = object[key];
				const isarray = opts.safe && Array.isArray(value);
				const type = Object.prototype.toString.call(value);
				const isbuffer = Buffer.isBuffer(value);
				const isobject = type === "[object Object]" || type === "[object Array]";

				const newKey = prev ? prev + delimiter + transformKey(key) : transformKey(key);

				if (
					!isarray &&
					!isbuffer &&
					isobject &&
					Object.keys(value).length &&
					(!opts.maxDepth || currentDepth < maxDepth)
				) {
					return step(value, newKey, currentDepth + 1);
				}

				output[newKey] = value;
			});
		};

		step(target);

		return output;
	}
};

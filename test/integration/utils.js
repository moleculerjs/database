"use strict";

function equalAtLeast(test, orig) {
	Object.keys(orig).forEach(key => {
		expect(test[key]).toEqual(orig[key]);
	});
}

function addExpectAnyFields(doc, def) {
	const res = Object.assign({}, doc);
	Object.keys(def).forEach(key => {
		res[key] = expect.any(def[key]);
	});
	return res;
}

module.exports = {
	equalAtLeast,
	addExpectAnyFields
};

"use strict";

function equalAtLeast(test, orig) {
	Object.keys(orig).forEach(key => {
		expect(test[key]).toEqual(orig[key]);
	});
}

module.exports = {
	equalAtLeast
};

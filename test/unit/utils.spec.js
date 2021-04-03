"use strict";

const utils = require("../../src/utils");

describe("Test Utils", () => {
	describe("Test flatten method", () => {
		it("should flatten objects", async () => {
			const obj = {
				name: "John Doe",
				email: "john.doe@moleculer.services",
				address: {
					zip: "1234",
					street: "Main Street 15",
					city: "London",
					country: "England",
					extra: "some"
				},
				roles: ["admin", 1234],
				phones: [
					{ type: "home", number: "+1-555-1234", primary: true },
					{ type: "mobile", number: "+1-555-9999" }
				]
			};

			expect(utils.flatten(obj)).toStrictEqual({
				name: "John Doe",
				email: "john.doe@moleculer.services",
				"address.city": "London",
				"address.country": "England",
				"address.extra": "some",
				"address.street": "Main Street 15",
				"address.zip": "1234",
				"phones.0.number": "+1-555-1234",
				"phones.0.primary": true,
				"phones.0.type": "home",
				"phones.1.number": "+1-555-9999",
				"phones.1.type": "mobile",
				"roles.0": "admin",
				"roles.1": 1234
			});
		});
	});
});

"use strict";

const { generateValidatorSchemaFromFields } = require("../..");

describe("Test validator schema generation", () => {
	const fields = {
		id: { type: "string", primaryKey: true, columnName: "_id" },
		name: { type: "string", required: true },
		username: { type: "string", required: true, min: 3, max: 100 },
		email: "email",
		password: { type: "string", hidden: true, min: 6 },
		age: { type: "number", positive: true, integer: true },
		bio: true,
		token: false,
		address: {
			type: "object",
			properties: {
				zip: { type: "number" },
				street: { type: "string" },
				state: { type: "string" },
				city: { type: "string", required: true },
				country: { type: "string" },
				primary: { type: "boolean", default: true }
			}
		},
		roles: {
			type: "array",
			max: 3,
			items: { type: "string" }
		},

		phones: {
			type: "array",
			items: {
				type: "object",
				properties: {
					type: "string",
					number: { type: "string", required: true },
					primary: { type: "boolean", default: false }
				}
			}
		},
		settings: {
			type: "object",
			optional: true,
			default: {}
		},

		createdAt: { type: "date", readonly: true, onCreate: () => new Date() },
		updatedAt: { type: "date", readonly: true, onUpdate: () => new Date() },
		replacedAt: { type: "date", readonly: true, onReplace: () => new Date() },
		status: { type: "string", default: "A", onRemove: "D" }
	};

	it("generate validator schema for 'create'", async () => {
		expect(generateValidatorSchemaFromFields(fields, { type: "create" })).toEqual({
			$$strict: true,
			name: { type: "string" },
			username: { type: "string", max: 100, min: 3 },
			email: { type: "email", optional: true },
			password: { type: "string", min: 6, optional: true },
			age: {
				type: "number",
				positive: true,
				integer: true,
				optional: true,
				convert: true
			},
			address: {
				type: "object",
				optional: true,
				properties: {
					$$strict: true,
					zip: { type: "number", optional: true, convert: true },
					street: { type: "string", optional: true },
					state: { type: "string", optional: true },
					city: { type: "string" },
					country: { type: "string", optional: true },
					primary: { type: "boolean", convert: true, optional: true, default: true }
				}
			},
			roles: {
				type: "array",
				max: 3,
				optional: true,
				items: {
					type: "string",
					optional: true
				}
			},
			phones: {
				type: "array",
				optional: true,
				items: {
					type: "object",
					optional: true,
					properties: {
						$$strict: true,
						type: { type: "string", optional: true },
						number: { type: "string" },
						primary: {
							type: "boolean",
							convert: true,
							optional: true,
							default: false
						}
					}
				}
			},
			settings: {
				type: "object",
				optional: true,
				default: {}
			},
			bio: { type: "any", optional: true },
			status: { type: "string", default: "A", optional: true }
		});
	});

	it("generate validator schema for 'update'", async () => {
		expect(generateValidatorSchemaFromFields(fields, { type: "update" })).toEqual({
			$$strict: true,
			id: { type: "string", optional: false },
			name: { type: "string", optional: true },
			username: { type: "string", max: 100, min: 3, optional: true },
			email: { type: "email", optional: true },
			password: { type: "string", min: 6, optional: true },
			age: {
				type: "number",
				positive: true,
				integer: true,
				optional: true,
				convert: true
			},
			address: {
				type: "object",
				optional: true,
				properties: {
					$$strict: true,
					zip: { type: "number", optional: true, convert: true },
					street: { type: "string", optional: true },
					state: { type: "string", optional: true },
					city: { type: "string", optional: true },
					country: { type: "string", optional: true },
					primary: { type: "boolean", convert: true, optional: true, default: true }
				}
			},
			roles: {
				type: "array",
				max: 3,
				optional: true,
				items: {
					type: "string",
					optional: true
				}
			},
			phones: {
				type: "array",
				optional: true,
				items: {
					type: "object",
					optional: true,
					properties: {
						$$strict: true,
						type: { type: "string", optional: true },
						number: { type: "string", optional: true },
						primary: {
							type: "boolean",
							convert: true,
							optional: true,
							default: false
						}
					}
				}
			},
			settings: {
				type: "object",
				optional: true,
				default: {}
			},
			bio: { type: "any", optional: true },
			status: { type: "string", default: "A", optional: true }
		});
	});

	it("generate validator schema for 'replace'", async () => {
		expect(generateValidatorSchemaFromFields(fields, { type: "replace" })).toEqual({
			$$strict: true,
			id: { type: "string", optional: false },
			name: { type: "string" },
			username: { type: "string", max: 100, min: 3 },
			email: { type: "email", optional: true },
			password: { type: "string", min: 6, optional: true },
			age: {
				type: "number",
				positive: true,
				integer: true,
				optional: true,
				convert: true
			},
			address: {
				type: "object",
				optional: true,
				properties: {
					$$strict: true,
					zip: { type: "number", optional: true, convert: true },
					street: { type: "string", optional: true },
					state: { type: "string", optional: true },
					city: { type: "string" },
					country: { type: "string", optional: true },
					primary: { type: "boolean", convert: true, optional: true, default: true }
				}
			},
			roles: {
				type: "array",
				max: 3,
				optional: true,
				items: {
					type: "string",
					optional: true
				}
			},
			phones: {
				type: "array",
				optional: true,
				items: {
					type: "object",
					optional: true,
					properties: {
						$$strict: true,
						type: { type: "string", optional: true },
						number: { type: "string" },
						primary: {
							type: "boolean",
							convert: true,
							optional: true,
							default: false
						}
					}
				}
			},
			settings: {
				type: "object",
				optional: true,
				default: {}
			},
			bio: { type: "any", optional: true },
			status: { type: "string", default: "A", optional: true }
		});
	});
});

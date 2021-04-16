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
		expect(
			generateValidatorSchemaFromFields(fields, {
				type: "create",
				strict: "remove",
				enableParamsConversion: true
			})
		).toEqual({
			$$strict: "remove",
			name: { type: "string", convert: true },
			username: { type: "string", max: 100, min: 3, convert: true },
			email: { type: "email", optional: true },
			password: { type: "string", min: 6, optional: true, convert: true },
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
				strict: "remove",
				properties: {
					zip: { type: "number", optional: true, convert: true },
					street: { type: "string", optional: true, convert: true },
					state: { type: "string", optional: true, convert: true },
					city: { type: "string", convert: true },
					country: { type: "string", optional: true, convert: true },
					primary: { type: "boolean", convert: true, optional: true, default: true }
				}
			},
			roles: {
				type: "array",
				max: 3,
				optional: true,
				items: {
					type: "string",
					optional: true,
					convert: true
				}
			},
			phones: {
				type: "array",
				optional: true,
				items: {
					type: "object",
					optional: true,
					strict: "remove",
					properties: {
						type: { type: "string", optional: true, convert: true },
						number: { type: "string", convert: true },
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
			status: { type: "string", default: "A", optional: true, convert: true }
		});
	});

	it("generate validator schema for 'create' with strict && disable convert", async () => {
		expect(
			generateValidatorSchemaFromFields(fields, {
				type: "create",
				strict: true,
				enableParamsConversion: false
			})
		).toEqual({
			$$strict: true,
			name: { type: "string" },
			username: { type: "string", max: 100, min: 3 },
			email: { type: "email", optional: true },
			password: { type: "string", min: 6, optional: true },
			age: {
				type: "number",
				positive: true,
				integer: true,
				optional: true
			},
			address: {
				type: "object",
				optional: true,
				strict: true,
				properties: {
					zip: { type: "number", optional: true },
					street: { type: "string", optional: true },
					state: { type: "string", optional: true },
					city: { type: "string" },
					country: { type: "string", optional: true },
					primary: { type: "boolean", optional: true, default: true }
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
					strict: true,
					properties: {
						type: { type: "string", optional: true },
						number: { type: "string" },
						primary: {
							type: "boolean",

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
		expect(
			generateValidatorSchemaFromFields(fields, {
				type: "update",
				strict: "remove",
				enableParamsConversion: true
			})
		).toEqual({
			$$strict: "remove",
			id: { type: "string", optional: false, convert: true },
			name: { type: "string", optional: true, convert: true },
			username: { type: "string", max: 100, min: 3, optional: true, convert: true },
			email: { type: "email", optional: true },
			password: { type: "string", min: 6, optional: true, convert: true },
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
				strict: "remove",
				properties: {
					zip: { type: "number", optional: true, convert: true },
					street: { type: "string", optional: true, convert: true },
					state: { type: "string", optional: true, convert: true },
					city: { type: "string", optional: true, convert: true },
					country: { type: "string", optional: true, convert: true },
					primary: { type: "boolean", convert: true, optional: true }
				}
			},
			roles: {
				type: "array",
				max: 3,
				optional: true,
				items: {
					type: "string",
					optional: true,
					convert: true
				}
			},
			phones: {
				type: "array",
				optional: true,
				items: {
					type: "object",
					optional: true,
					strict: "remove",
					properties: {
						type: { type: "string", optional: true, convert: true },
						number: { type: "string", optional: true, convert: true },
						primary: {
							type: "boolean",
							convert: true,
							optional: true
						}
					}
				}
			},
			settings: {
				type: "object",
				optional: true
			},
			bio: { type: "any", optional: true },
			status: { type: "string", optional: true, convert: true }
		});
	});

	it("generate validator schema for 'replace'", async () => {
		expect(
			generateValidatorSchemaFromFields(fields, {
				type: "replace",
				strict: "remove",
				enableParamsConversion: true
			})
		).toEqual({
			$$strict: "remove",
			id: { type: "string", optional: false, convert: true },
			name: { type: "string", convert: true },
			username: { type: "string", max: 100, min: 3, convert: true },
			email: { type: "email", optional: true },
			password: { type: "string", min: 6, optional: true, convert: true },
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
				strict: "remove",
				properties: {
					zip: { type: "number", optional: true, convert: true },
					street: { type: "string", optional: true, convert: true },
					state: { type: "string", optional: true, convert: true },
					city: { type: "string", convert: true },
					country: { type: "string", optional: true, convert: true },
					primary: { type: "boolean", convert: true, optional: true, default: true }
				}
			},
			roles: {
				type: "array",
				max: 3,
				optional: true,
				items: {
					type: "string",
					optional: true,
					convert: true
				}
			},
			phones: {
				type: "array",
				optional: true,
				items: {
					type: "object",
					optional: true,
					strict: "remove",
					properties: {
						type: { type: "string", optional: true, convert: true },
						number: { type: "string", convert: true },
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
			status: { type: "string", default: "A", optional: true, convert: true }
		});
	});
});

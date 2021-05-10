"use strict";

const _ = require("lodash");
const AdapterTests = require("./adapter.test");
const MethodTests = require("./methods.test");
const ScopeTests = require("./scopes.test");
const ActionsTests = require("./actions.test");
const TransformTests = require("./transform.test");
const PopulateTests = require("./populate.test");
const ValidationTests = require("./validation.test");
const RESTTests = require("./rest.test");
const TenantTests = require("./tenants.test");

let Adapters;
if (process.env.GITHUB_ACTIONS_CI) {
	Adapters = [
		{ type: "NeDB" },
		{ type: "MongoDB", options: { dbName: "db_int_test" } },
		{
			name: "Knex-SQLite",
			type: "Knex",
			options: {
				knex: {
					client: "sqlite3",
					connection: {
						filename: ":memory:"
					},
					useNullAsDefault: true,
					log: {
						warn(message) {},
						error(message) {},
						deprecate(message) {},
						debug(message) {}
					}
				}
			}
		},
		{
			name: "Knex-Postgresql",
			type: "Knex",
			options: {
				knex: {
					client: "pg",
					connection: {
						//"postgres://postgres:moleculer@127.0.0.1:5432/db_int_test"
						host: "127.0.0.1",
						port: 5432,
						user: "postgres",
						password: "moleculer",
						database: "db_int_test"
					}
				}
			}
		},
		{
			name: "Knex-MySQL",
			type: "Knex",
			options: {
				knex: {
					client: "mysql",
					connection: {
						host: "127.0.0.1",
						user: "root",
						password: "moleculer",
						database: "db_int_test"
					},
					log: {
						warn(message) {},
						error(message) {},
						deprecate(message) {},
						debug(message) {}
					}
				}
			}
		},
		{
			name: "Knex-MySQL2",
			type: "Knex",
			options: {
				knex: {
					client: "mysql2",
					connection: {
						host: "127.0.0.1",
						user: "root",
						password: "moleculer",
						database: "db_int_test"
					},
					log: {
						warn(message) {},
						error(message) {},
						deprecate(message) {},
						debug(message) {}
					}
				}
			}
		},
		{
			name: "Knex-MSSQL",
			type: "Knex",
			options: {
				knex: {
					client: "mssql",
					connection: {
						host: "127.0.0.1",
						port: 1433,
						user: "sa",
						password: "Moleculer@Pass1234",
						database: "db_int_test",
						encrypt: false
					}
				}
			}
		}
	];
} else {
	// Local development tests
	Adapters = [
		{
			type: "NeDB"
		},
		{ type: "MongoDB", options: { dbName: "db_int_test" } },
		{
			name: "Knex-SQLite",
			type: "Knex",
			options: {
				knex: {
					client: "sqlite3",
					connection: {
						filename: ":memory:"
					},
					useNullAsDefault: true,
					log: {
						warn(message) {},
						error(message) {},
						deprecate(message) {},
						debug(message) {}
					}
				}
			}
		} /*,
		{
			name: "Knex-Postgresql",
			type: "Knex",
			options: {
				knex: {
					client: "pg",
					connection: {
						host: "127.0.0.1",
						port: 5432,
						user: "postgres",
						password: "moleculer",
						database: "db_int_test"
					}
				}
			}
		},
		{
			name: "Knex-MySQL",
			type: "Knex",
			options: {
				knex: {
					client: "mysql",
					connection: {
						host: "127.0.0.1",
						user: "root",
						password: "moleculer",
						database: "db_int_test"
					},
					log: {
						warn(message) {},
						error(message) {},
						deprecate(message) {},
						debug(message) {}
					}
				}
			}
		},
		{
			name: "Knex-MySQL2",
			type: "Knex",
			options: {
				knex: {
					client: "mysql2",
					connection: {
						host: "127.0.0.1",
						user: "root",
						password: "moleculer",
						database: "db_int_test"
					},
					log: {
						warn(message) {},
						error(message) {},
						deprecate(message) {},
						debug(message) {}
					}
				}
			}
		},
		{
			name: "Knex-MSSQL",
			type: "Knex",
			options: {
				knex: {
					client: "mssql",
					connection: {
						host: "127.0.0.1",
						port: 1433,
						user: "sa",
						password: "Moleculer@Pass1234",
						database: "db_int_test",
						encrypt: false
					}
				}
			}
		}*/
	];
}

describe("Integration tests", () => {
	for (const adapter of Adapters) {
		const getAdapter = options => {
			if (adapter.options) return _.defaultsDeep({}, { options }, adapter);

			return adapter;
		};

		getAdapter.adapterName = adapter.name;
		getAdapter.isNoSQL = ["NeDB", "MongoDB", "Mongoose"].includes(adapter.type);
		getAdapter.isSQL = ["Knex"].includes(adapter.type);
		getAdapter.IdColumnType = ["Knex"].includes(adapter.type) ? "integer" : "string";

		describe(`Adapter: ${adapter.name || adapter.type}`, () => {
			describe("Test adapter", () => AdapterTests(getAdapter, adapter.type));
			describe("Test methods", () => MethodTests(getAdapter, adapter.type));
			describe("Test scopes", () => ScopeTests(getAdapter, adapter.type));
			describe("Test actions", () => ActionsTests(getAdapter, adapter.type));
			describe("Test transformations", () => TransformTests(getAdapter, adapter.type));
			describe("Test populating", () => PopulateTests(getAdapter, adapter.type));
			describe("Test Validations", () => ValidationTests(getAdapter, adapter.type));
			describe("Test REST", () => RESTTests(getAdapter, adapter.type));
			describe("Test Tenants", () => TenantTests(getAdapter, adapter.type));
		});
	}
});

# Knex adapter
This adapter gives access to SQL database engines using the [Knex.js](https://knexjs.org/) library.

> Knex.js (pronounced /kəˈnɛks/) is a "batteries included" SQL query builder for Postgres, MSSQL, MySQL, MariaDB, SQLite3, Oracle, and Amazon Redshift designed to be flexible, portable, and fun to use.

## Install
This module contains the source code of the adapter. You just need to install the dependent library.

```bash
npm install knex@^1.0.1
```

## Usage

### Connect to SQLite memory database
> To connect SQLite database, you should install the `@vscode/sqlite3` module with `npm install @vscode/sqlite3` command (or `better-sqlite3`).

```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({ 
        adapter: { 
            type: "Knex",
            options: {
                knex: {
                    client: "sqlite3",
                    connection: {
                        filename: ":memory:"
                    },
                    useNullAsDefault: true
                }
            }
        }
    })]
}
```

### Connect to PostgreSQL database
> To connect PostgreSQL database you should install the `pg` module with `npm install pg` command.

```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({ 
        adapter: { 
            type: "Knex",
            options: {
                knex: {
                    client: "pg",
                    connection: "postgres://postgres@localhost:5432/moleculer"
                }
            }
        }
    })]
}
```

### Connect to MySQL database
> To connect MySQL database you should install the `mysql` module with `npm install mysql` command.

```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({ 
        adapter: { 
            type: "Knex",
            options: {
                knex: {
                    client: "pg",
                    connection: {
                        host: "127.0.0.1",
                        user: "root",
                        password: "pass1234",
                        database: "moleculer"
                    }
                }
            }
        }
    })]
}
```

### Connect to MSSQL database
> To connect MSSQL database you should install the `tedious` module with `npm install tedious` command.

```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({ 
        adapter: { 
            type: "Knex",
            options: {
                knex: {
                    client: "mssql",
                    connection: {
                        host: "127.0.0.1",
                        port: 1433,
                        user: "sa",
                        password: "Moleculer@Pass1234",
                        database: "moleculer",
                        encrypt: false
                    }
                }
            }
        }
    })]
}
```


## Options
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `knex` | `Object` | `null` | Available options: http://knexjs.org/#Installation-client |
| `tableName` | `String` | `null` | Table name. If empty, use the service name. |

## Raw update
If you want to update an entity and using raw changes, use the [`updateEntity`](../README.md#updateentity) method with `{ raw: true }` options. In this case, you can use the MongoDB-like `$set` and `$inc` operators in the `params` parameter.

### Example
```js
const row = await this.updateEntity(ctx, {
    id: "YVdnh5oQCyEIRja0",

    $set: {
        status: false,
        height: 192
    },
    $inc: {
        age: 1
    }
}, { raw: true });
```

## Additional methods

### `createTable`
`createTable(fields?: Array<Object>, opts?: Object): Promise<void>`
It creates the table based on the specified fields in the service settings.

> Use it in testing & prototyping. In production use the [Knex migration](http://knexjs.org/#Migrations) feature.

#### Options
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `dropTableIfExists` | `boolean` | `true` | Drop the table if exists. |
| `createIndexes` | `boolean` | `false` | Create indexes based on service `settings.indexes`. |


#### Example

```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({ 
        adapter: { 
            type: "Knex",
            options: {
                knex: {
                    client: "mssql",
                    connection: {
                        host: "127.0.0.1",
                        port: 1433,
                        user: "sa",
                        password: "Moleculer@Pass1234",
                        database: "moleculer",
                        encrypt: false
                    }
                }
            }
        }
    })],

    settings: {
        fields: {
            id: { type: "number", primaryKey: true, columnName: "_id", columnType: "integer" },
            title: { type: "string", required: true, max: 100, trim: true },
            content: { type: "string", columnType: "text" }
        }
    },
    
    async started() {
        const adapter = await this.getAdapter();
        await adapter.createTable();
    }
}
```

### `dropTable`
`dropTable(tableName?: String): Promise<void>`

It drops the table. If the `tableName` is empty, uses the `opts.tableName` property.

> Use it in testing & prototyping. In production use the [Knex migration](http://knexjs.org/#Migrations) feature.

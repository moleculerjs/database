# TODO

- [ ] **More integration tests**
  - [ ] createIndex, removeIndex
  - [ ] Knex createCursor operators `$`
  - [ ] global pool handling

## Actions
- [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`
- [ ] option to add additional cache keys (e.g. `#userID`)

## Fields
- [ ] `hidden: "inLists"`

## Methods
- [x] wrap the args to obj in custom functions: `({ ctx, id, field })`
  - [x] add `id` to custom functions
  - [x] add `operation` _(create|update|remove)_ to custom functions
  - [x] add `root` _(for nested properties)_ to custom functions
  - [ ] same for `get`
  - [x] same for `set`
  - [x] same for `default`
  - [x] same for `onXXXX` hooks
- [ ] multiple get option for `get` in transform (same as populating to avoid hundreds sub-calls)
- [x] if `field.validate` is string, call the method by name
  - [ ] same for `get`
  - [x] same for `set`

## Features
- [x] Multi model/tenant solutions
    - [ ] schema-based for integration tests
- [ ] generate GraphQL types & resolvers
- [x] add custom tracing spans (validating, transforming)
- [x] add custom metrics (for all basic functions (create, update, replace, remove))

## Adapters
- [ ] Cassandra
- [ ] Couchbase
- [ ] CouchDB
- [x] Knex
  - [ ] support schemas like https://github.com/ltv/moleculer-db-adapter-knex/blob/master/src/index.js#L23
- [x] MongoDB
- [ ] Mongoose
- [x] NeDB
- [ ] Sequelize
- [ ] OrientDB
  - [ ] https://orientdb.org/docs/3.0.x/orientjs/OrientJS.html
- [ ] ArangoDB
  - [ ] https://www.arangodb.com/docs/stable/aql/tutorial-crud.html



## Just if I bored to death
- [ ] generate OpenAPI schema
- [ ] `introspect: true`
  - [ ] create REST API to get the field definitions, and actions with params
- [ ] Generate sample data based on fields with Fakerator. `username: { type: "string", fake: "entity.user.userName" }`
- [ ] validate `raw: true` update fields (`$set`, `$inc`)
- [ ] client-side (Vue) module which can communicate with service via REST or GraphQL.
- [ ] ad-hoc populate in find/list actions `populate: ["author", { key: "createdBy", action: "users.resolve", fields: ["name", "avatar"] }]` { }
- [ ] auto revision handling (`_rev: 1`). Autoincrement on every update/replace and always checks the rev value to avoid concurrent updating.
- [ ] 

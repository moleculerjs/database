# TODO

- [ ] **More integration tests**
  - [ ] createIndex, removeIndex
  - [ ] Knex createCursor operators `$`
  - [ ] global pool handling

## Actions
- [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`

## Fields


## Methods
- [ ] add `entityID` to custom functions: `(value, entity, entityID, field, ctx)`
- [ ] wrap the args to obj in custom functions: `({ entityID, ctx })`

## Features
- [x] Multi model/tenant solutions
    - [ ] schema-based for integration tests
- [ ] generate GraphQL types & resolvers
- [x] add custom tracing spans (validating, transforming)
- [x] add custom metrics (for all basic functions (create, update, replace, remove))
  - [ ] https://gist.github.com/intech/b6e809c729835cb1da6411c4a940846b

## Adapters
- [ ] Cassandra
- [ ] Couchbase
- [ ] CouchDB
- [x] Knex
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
- [ ] auto revision handling (`_rev: 1`). Auto increment on every update/replace and always checks the rev value to avoid concurrent updating.
- [ ] 

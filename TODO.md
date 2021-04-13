# TODO

## Actions
- [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`

## Fields
- [ ] add option to disable auto value conversion in validator schema.
- [ ] `validate` somehow should return the error message text if not valid. E.g. it's `true` or `"The value is not valid"`


## Methods
- [ ] create methods for `updateMany` and `removeMany` (clear cache, send notify event without entities)
- [ ] ad-hoc populate in find/list actions `populate: ["author", { key: "createdBy", action: "users.resolve", fields: ["name", "avatar"] }]` { }
- [ ] limiting the maximum opened adapters (multi-tenancy)


## Features
- [x] Multi model/tenant solutions
    - [ ] schema-based for integration tests
- [ ] `bulkCreate` action without REST
- [ ] option to add other service cache cleaning events in the Mixin options
- [ ] generate GraphQL types & resolvers


## Adapters
- [ ] Cassandra
- [ ] Couchbase
- [ ] CouchDB
- [x] Knex
  - [ ] Add `$inc`, `$dec` handling in `updateById` and `updateMany`
- [x] MongoDB
- [ ] Mongoose
- [x] NeDB
- [ ] Sequelize



## Just if I bored to death
- [ ] generate OpenAPI schema
- [ ] Generate sample data based on fields with Fakerator. `username: { type: "string", fake: "entity.user.userName" }`
- [ ] client-side (Vue) module which can communicate with service via REST or GraphQL.
- [ ] auto revision handling (`_rev: 1`). Auto increment on every update/replace and always checks the rev value to avoid concurrent updating.

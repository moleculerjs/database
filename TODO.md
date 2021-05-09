# TODO

- [x] add more debug log messages
- [x] `sort` fields should be converted to `columnName`
- [x] in Knex if MSSQL and has offset but no sort, if should add a sort to the primary key field
  - [x] https://github.com/knex/knex/issues/1527

- [ ] **More integration tests**
  - [ ] createIndex, removeIndex
  - [ ] Knex createCursor operators `$`
  - [ ] global pool handling

## Actions
- [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`

## Fields
- [x] add option to disable auto value conversion in validator schema.
- [x] `validate` somehow should return the error message text if not valid. E.g. it's `true` or `"The value is not valid"`


## Methods
- [ ] create methods for `updateMany` and `removeMany`
  - [ ] or find with query validate every entity, clear cache, send notify (batch)
- [x] limiting the maximum opened adapters (in case of multi-tenancy)
  - [x] add an `adapterConnected` and `adapterDisconnected` hooks.
- [x] `findEntity` with sorting
- [x] CRUD methods 
  - [x] `opts.permissive: true` to disable `readonly`, `immutable` validation to save these fields, and skip permission checks in validation.
  - [x] `opts.skipOnHooks` to skip the `onCreate`, `onUpdate` ...etc hooks.
- [x] `afterResolveEntities` custom hook (using to check permissions, rights, status, owner...etc)

## Features
- [x] Multi model/tenant solutions
    - [ ] schema-based for integration tests
- [ ] `createMany` action without REST
- [x] option to add other service cache cleaning events in the Mixin options
- [ ] generate GraphQL types & resolvers
- [ ] validate `raw: true` update fields (`$set`, `$inc`)
- [ ] add custom tracings (validating, transforming)
- [ ] add custom metrics (for all basic functions (create, update, replace, remove))
  - [ ] https://gist.github.com/intech/b6e809c729835cb1da6411c4a940846b

## Adapters
- [x] `findOne` with sorting

- [ ] Cassandra
- [ ] Couchbase
- [ ] CouchDB
- [x] Knex
- [x] MongoDB
- [ ] Mongoose
- [x] NeDB
- [ ] Sequelize



## Just if I bored to death
- [ ] generate OpenAPI schema
- [ ] `introspect: true`
  - [ ] create REST API to get the field definitions, and actions with params
- [ ] Generate sample data based on fields with Fakerator. `username: { type: "string", fake: "entity.user.userName" }`
- [ ] client-side (Vue) module which can communicate with service via REST or GraphQL.
- [ ] ad-hoc populate in find/list actions `populate: ["author", { key: "createdBy", action: "users.resolve", fields: ["name", "avatar"] }]` { }
- [ ] auto revision handling (`_rev: 1`). Auto increment on every update/replace and always checks the rev value to avoid concurrent updating.
- [ ] 

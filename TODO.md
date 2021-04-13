# TODO

## Actions
- [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`

## Fields
- [ ] add option to disable auto value conversion in validator schema.
- [ ] `validate` somehow should return the error message text if not valid. E.g. it's `true` or `"The value is not valid"`


## Methods
- [ ] create methods for `updateMany` and `removeMany`
- [ ] ad-hoc populate in find/list actions `populate: ["author", { key: "createdBy", action: "users.resolve", fields: ["name", "avatar"] }]` { }


## Features
- [x] Multi model/tenant solutions
    - [ ] schema-based for integration tests
- [ ] `bulkCreate` action without REST
- [ ] option to add other service cache cleaning events in the Mixin options

## Adapters
- [ ] Cassandra
- [ ] Couchbase
- [ ] CouchDB
- [x] Knex
- [x] MongoDB
- [ ] Mongoose
- [x] NeDB
- [ ] Sequelize

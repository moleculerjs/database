# TODO

- [ ] **More integration tests**
  - [ ] createIndex, removeIndex
  - [ ] Knex createCursor operators `$`
  - [ ] global pool handling
  - [x] soft delete

## Actions
- [ ] `aggregate` action with params: `type: "sum", "avg", "count", "min", "max"` & `field: "price"`

## Fields
- [ ] `hidden: "inLists"`
- [ ] using projections, get only required fields in adapters.
  - [ ] `projection: []` for getter/setters

## Methods
- [x] wrap the args to obj in custom functions: `({ ctx, id, field })`
  - [ ] same for `get`
- [ ] multiple get option for `get` in transform (same as populating to avoid hundreds sub-calls)
- [x] if `field.validate` is string, call the method by name
  - [ ] same for `get`
  - [x] same for `set`
- [ ] option to disable validators `opts.validation: false`
- [x] add `scope` param for `removeEntities` and `updateEntities` and pass to the `findEntities` call inside the method.
- [x] skipping softDelete in methods `opts.softDelete: false` to make real delete in maintenance processes
- [ ] Add `events: false` to options to disable entity changed events. (e.g. when `softDelete: false` we don't want to send event about changes)


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

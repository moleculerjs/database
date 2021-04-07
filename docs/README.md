
# Mixin options

The options of the Mixin.

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `createActions` | `Boolean` | `true` | Generate CRUD actions. |
| `actionVisibility` | `String` | `published` | Default visibility of generated actions |
| `generateActionParams` | `Boolean` | `true` | Generate `params` schema for generated actions based on the `fields` |
| `strict` | `Boolean\|String` | `remove` | Strict mode in validation schema for objects. Values: `true`, `false`, `"remove"` |
| `cache` | `Object` | | Action caching settings |
| `cache.enabled` | `Boolean` | `true` | Enable caching on actions |
| `cache.eventName` | `String` | `null` | Name of the broadcasted event for clearing cache at modifications (update, replace, remove). If `false` disable event broadcasting & subscription |
| `rest` | `Boolean` | `true` | Set the API Gateway auto-aliasing REST properties in the service & actions |
| `autoReconnect` | `Boolean` | `true` | Auto reconnect if the DB server is not available at first connecting |
| `maxLimit` | `Number` | `-1` | Maximum value of `limit` in `find` action and `pageSize` in `list` action. Default: `-1` (no limit) |
| `defaultPageSize` | `Number` | `10` | Default page size in `list` action. |



# Settings

The settings of the service.
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `fields` | `Object` | `null` | Field definitions. [More info](#fields) |
| `scopes` | `Object` | `null` | Scope definitions. [More info](#scopes) |
| `defaultScopes` | `Array<String>` | `null` | Default scope names. [More info](#scopes) |
| `indexes` | `Object` | `null` | Index definitions. [More info](#indexes) |


# Fields

The field definition is similar to [Fastest Validator](https://github.com/icebob/fastest-validator) schemas. You can define it in the same format and the service uses the Fastest Validator to validate & sanitize the input data.

>The difference between this schema and FV schema is that here every defined fields are optional (same as fields in Database engines). You should set the `required: true` property for fields what are mandatory.

**Example**
```js
// posts.service.js
module.exports = {
    // ...
	settings: {
		fields: {
			id: { type: "string", primaryKey: true, columnName: "_id" },
			title: { type: "string", required: true, max: 100, trim: true },
			content: { type: "string", required: false, columnType: "text" },
            status: { type: "boolean", default: true },
            createdAt: { type: "number", readonly: true, onCreate: () => Date.now() }
            updatedAt: { type: "number", readonly: true, onUpdate: () => Date.now() }
		}
	}
    // ...
}
```

## Field properties

### `type`: \<string\> _(no default value, it's required property)_
The `type` defines the type of the field value. It can be any primitive types (`boolean`, `number`, `string`, `object`, `array`) or any types from Fastest Validator types. If the type is not a valid database type, you should define the `columnType` property as well with a valid database field type.

**Example schema**
```js
{
    id: { type: "string", primaryKey: true, columnName: "_id" },
    username: { type: "string" },
    age: { type: "number" },
    dateOfBirth: { type: "date" },
    address: { type: "object", properties: {
        country: { type: "string", required: true },
        city: "string|required", // shorthand format
        street: { type: "string" }
        zip: { type: "number" }
    } },
    phones: { type: "array", items: "string" }
}
```

**Example valid data**
```js
{
    id: "abc123",
    username: "John Doe",
    age: 34,
    dateOfBirth: new Date(),
    address: {
        country: "UK",
        city: "London",
        street: "Main Street 156",
        zip: 12345
    },
    phones: ["555-1234", "555-9876"]
}
```


### `required`: \<boolean\> _(Default: `false`)_
TODO

### `primaryKey`: \<boolean\> _(Default: `false`)_
TODO

### `secure`: \<boolean\> _(Default: `false`)_
TODO

### `columnName`: \<string\> _(Default: name of field)_
TODO

### `columnType`: \<string\> _(Default: value of the `type` property)_
TODO

### `default`: \<string|Function\> _(Default: `null`)_
TODO

### `readonly`: \<boolean\> _(Default: `false`)_
TODO

### `immutable`: \<boolean\> _(Default: `false`)_
TODO

### `virtual`: \<boolean\> _(Default: `false`)_
TODO

### `hidden`: \<boolean|String\> _(Default: `false`)_
TODO

### `validate`: \<Function\> _(Default: `null`)_
TODO

### `get`: \<Function\> _(Default: `null`)_
TODO

### `set`: \<Function\> _(Default: `null`)_
TODO

### `populate`: \<string|Object|Function\> _(Default: `null`)_
TODO

### `permission`: \<string\> _(Default: `null`)_
TODO

### `readPermission`: \<string\> _(Default: `null`)_
TODO

### `onCreate`: \<Function\> _(Default: `null`)_
TODO

### `onUpdate`: \<Function\> _(Default: `null`)_
TODO

### `onReplace`: \<Function\> _(Default: `null`)_
TODO

### `onRemove`: \<Function\> _(Default: `null`)_
TODO


### Additional field properties
You can use any additional properties for validation & sanitization from the Fastest Validator rule properties like `min`, `max`, `trim` ...etc.
[Check the documentation of Fastest Validator.](https://github.com/icebob/fastest-validator#readme)

# Actions

## `find` Find entities
TODO

## `list` List entities
TODO

## `count` Count entities
TODO

## `get` Get an entity by ID
TODO

## `resolve` Get entit(ies) by ID(s)
TODO

## `create` Create an entity
TODO

## `update` Update an entity
TODO

## `replace` Replace an entity
TODO

## `remove` Delete an entity
TODO

## Add a custom action
TODO

# Methods

## `getAdapter(ctx?: Context)`
TODO

## `sanitizeParams(params: object, opts?: object)`
TODO

## `findEntities(ctx?: Context, params: object, opts?: object)`
TODO

## `streamEntities(ctx?: Context, params: object, opts?: object)`
TODO

## `countEntities(ctx?: Context, params: object)`
TODO

## `findEntity(ctx?: Context, params: object, opts?: object)`
TODO

## `resolveEntities(ctx?: Context, params: object, opts?: object)`
TODO

## `createEntity(ctx?: Context, params: object, opts?: object)`
TODO

## `createEntities(ctx?: Context, params: Array<object>, opts?: object)`
TODO

## `updateEntity(ctx?: Context, params: object, opts?: object)`
TODO

## `replaceEntity(ctx?: Context, params: object, opts?: object)`
TODO

## `removeEntity(ctx?: Context, params: object, opts?: object)`
TODO

## `clearEntity(ctx?: Context, params: object, opts?: object)`
TODO

## `validateParams(ctx?: Context, params: object, opts?: object)`
TODO

## `transformResult(adapter: Adapter, docs: object|Array<object>, params?: object, ctx?: Context)`
TODO

# Implementable methods

## `getAdapterByContext(ctx?: Context, adapterDef?: object)`
TODO

## `entityChanged(type: String, data?: any, ctx?: Context, opts?: object)`
TODO

## `encodeID(id: any)`
TODO

## `decodeID(id: any)`
TODO

## `checkFieldAuthority(ctx?: Context, permission: any, params: object, field: object)`
TODO

## `checkScopeAuthority(ctx?: Context, name: string, scope: object|Function)`
TODO


# Scopes
TODO

# Indexes
TODO

# Populating
TODO

# Permissions
TODO

# Soft delete
TODO

# Tenants
TODO

# Events
TODO

# Adapters
TODO

## Cassandra
TODO

## Couchbase
TODO

## CouchDB
TODO

## Knex
[Knex adapter documentation](/docs/adapters/Knex.md)

## MongoDB
[MongoDB adapter documentation](/docs/adapters/MongoDB.md)

## Mongoose
TODO

## NeDB
[NeDB adapter documentation](/docs/adapters/NeDB.md)

## Sequelize
TODO

## Adapter common methods

## `connect()`
TODO

## `disconnect()`
TODO

## `find(params: object)`
TODO

## `findOne(query: object)`
TODO

## `findById(id: any)`
TODO

## `findByIds(id: Array<any>)`
TODO

## `findStream(params: object)`
TODO

## `count(params: object)`
TODO

## `insert(entity: object)`
TODO

## `insertMany(entities: Array<object>)`
TODO

## `updateById(id: any, changes: object)`
TODO

## `updateMany(query: object, changes: object)`
TODO

## `replaceById(id: any, changes: object)`
TODO

## `removeById(id: any, changes: object)`
TODO

## `removeMany(query: object, changes: object)`
TODO

## `clear()`
TODO

## `entityToJSON(entity: object)`
TODO

## `createIndex(def: any)`
TODO




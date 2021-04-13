
# Mixin options

The options of the Mixin.

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `adapter` | `Object` | `NeDB` | Configure the adapter. [Read more](#adapters) |
| `createActions` | `Boolean` | `true` | Generate CRUD actions. |
| `actionVisibility` | `String` | `published` | Default visibility of generated actions |
| `generateActionParams` | `Boolean` | `true` | Generate `params` schema for generated actions based on the `fields` |
| `strict` | `Boolean\|String` | `remove` | Strict mode in validation schema for objects. Values: `true`, `false`, `"remove"` |
| `cache` | `Object` | | Action caching settings |
| `cache.enabled` | `Boolean` | `true` | Enable caching on actions |
| `cache.eventName` | `String` | `cache.clean.{serviceName}` | Name of the broadcasted event for clearing cache at modifications (update, replace, remove). |
| `cache.eventType` | `String` | `"broadcast"` | Type of the broadcasted event. It can be `"broadcast"`, or `"emit"`. If `null`, it disabled the event sending. |
| `rest` | `Boolean` | `true` | Set the API Gateway auto-aliasing REST properties in the service & actions |
| `entityChangedEventMode` | `String` | `"broadcast"` | Entity changed lifecycle event mode. Values: `null`, `"broadcast"`, `"emit"`. The `null` disables event sending. |
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
            content: { type: "string", columnType: "text" },
            votes: "number|integer", // Shorthand format
            status: { type: "boolean", default: true },
            createdAt: { type: "number", readonly: true, onCreate: () => Date.now() },
            updatedAt: { type: "number", readonly: true, onUpdate: () => Date.now() }
        }
    }
    // ...
}
```

>You can find more info about shorthand format in the [Fastest Validator documentation](https://github.com/icebob/fastest-validator#shorthand-definitions).


## Field properties

### `type`: \<string\> _(no default value, it's a required property)_
The `type` defines the type of the field value. It can be any primitive types (`boolean`, `number`, `string`, `object`, `array`) or any types from Fastest Validator types. If the type is not a valid database type, you should define the `columnType` property as well with a valid database field type.

**Example schema**
```js
{
    id: { type: "string", primaryKey: true, columnName: "_id" },
    username: { type: "string" },
    age: "number", // Shorthand format
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

>Please note, if the value type and the defined type mismatches, the service will try to convert the value to the defined type. In the above example, if you set `age: "34"`, the service won't throw `ValidationError`, instead convert it to `Number`.

### `required`: \<boolean\> _(Default: `false`)_
Every field is optional by default. To make it mandatory, set `required: true` in the field properties. If this fields is nullish, the service throws a `ValidationError` in the `create` & `replace` actions.

**Example**
```js
{
    title: { type: "string", required: true }
}
```

**Validation error**
```js
{
    type: "VALIDATION_ERROR",
    code: 422,
    data: [{
        type: "required",
        message: "The 'title' field is required.",
        field: "title",
        actual: undefined,
        nodeID: "<nodeID>",
        action: "posts.create"
    }],
    retryable: false
}
```

### `primaryKey`: \<boolean\> _(Default: `false`)_
For ID fields set the `primaryKey` to true. The service know the name of the ID field and type according to this property.

>Please note, the service doesn't support composite primary keys.

**Example**
```js
{
    id: { type: "string", primaryKey: true, columnName: "_id" }
}
```


### `secure`: \<boolean\> _(Default: `false`)_
With the `secure` property you can encode the value of the ID field. It can be useful to avoid that the users find out the IDs of other documents when the database uses incremental ID values.

To utilize it, you should define `encodeID(id)` and `decodeID(id)` methods in the service which handles the encoding/decoding operations. 

> The [`hashids`](https://hashids.org/javascript/) lib can generate Youtube-like alphanumerical IDs from number(s) or from Mongo's `ObjectID`.


**Example secure ID using `hashids` lib`**
```js
const Hashids = require("hashids/cjs");
const hashids = new Hashids("this is my salt");

module.exports = {
    name: "posts",
    mixins: [DbService()],

    settings: {
        fields: {
            id: { type: "string", primaryKey: true, secure: true, columnName: "_id" },
            // ... more fields
        }
    },
    
    methods: {
        encodeID(id) {
            return id != null ? hashids.encodeHex(id) : id;
        },

        decodeID(id) {
            return id != null ? hashids.decodeHex(id) : id;
        }
    }
}
```
>Please note, the methods should be synchronous.

### `columnName`: \<string\> _(Default: name of field)_
With the `columnName` property, you can use a different field name in the database collection/table. 

**Example**
```js
{
    id: { type: "string", primaryKey: true, columnName: "_id" },
    fullName: { type: "string", columnName: "full_name" }
}
```


### `columnType`: \<string\> _(Default: value of the `type` property)_
With the `columnName` property, you can use a different field type in the database collection/table. It should be set in SQL databases because e.g. `number` is not a valid database field type.

**Example**
```js
{
    age: { type: "number", columnType: "integer" },
    lastLogin: { type: "date", columnType: "datetime" },
    createdAt: { type: "number", columnType: "bigInteger" }
}
```

>The value of `columnType` depends on the used adapter and database engine.


### `default`: \<string|Function\> _(Default: `null`)_
For the non-required fields, you can set default values. If the field value is nullish in the `create` and `replace`actions, the service will set the defined default value. If the `default` is a Function, the service will call it to get the default value. _The function can be asynchronous._

**Example**
```js
{
    votes: { type: "number", default: 0 },
    role: { type: "string", default: async (entity, field, ctx) => await ctx.call("config.getDefaultRole") }
    status: { type: "boolean", default: true },
}
```

### `readonly`: \<boolean\> _(Default: `false`)_
You can make a field read-only with the `readonly: true`. In this case, the property can't be set by the user, only the service can do it. It means, for read-only fields, you should define `default` or `set` or any operation hooks.

### `immutable`: \<boolean\> _(Default: `false`)_
The immutable field means you can set the value once. It cannot be changed in the future.

**Example**
```js
{
    accountType: { type: "string", immutable: true }
}
```

### `virtual`: \<boolean\> _(Default: `false`)_
The virtual field returns value which is not exist in the database. It's mandatory to define the `get` method which returns the value of the field.

**Example**
```js
{
    fullName: { 
        type: "string", 
        virtual: true, 
        get: (value, entity, field, ctx) => `${entity.firstName} ${entity.lastName}` 
    }
}
```

### `hidden`: \<boolean|String\> _(Default: `false`)_
The hidden fields are skipped from the response during the transformation.
The field can be marked as hidden only by default. But if the `fields` of the request `params` contains it, it will be placed.

**Example**
```js
{
    name: { type: "string" },
    password: { type: "string", min: 8, hidden: true },
    createdAt: { type: "number", hidden: "byDefault" }
}
```

**List the users**
```js
const res = broker.call("users.find", {
    fields: ["name", "password"]
})
```
The response contains only the `name` fields. The `password` is skipped.

**List the users with `createdAt`**
```js
const res = broker.call("users.find", {
    fields: ["name", "createdAt", "password"]
})
```
The response contains the `name` and `createdAt` fields.


### `validate`: \<Function\> _(Default: `null`)_
With `validate`, you can configure a custom validator function. _It can be asynchronous._

**Example**
```js
{
    username: { 
        type: "string", 
        validate: (value, entity, field, ctx) => value && /^[a-zA-Z0-9]+$/.test(value) 
    }
}
```


### `get`: \<Function\> _(Default: `null`)_
The `get` function is called at transformation of entities. With this function, you can modify an entity value before sending back to the caller or calculate a value from other fields of entity in virtual fields.

**Example**
```js
{
    creditCardNumber: { 
        type: "string", 
        // Mask the credit card number
        get: (value, entity, field, ctx) => value.replace(/(\d{4}-){3}/g, "****-****-****-")
    }
}
```


### `set`: \<Function\> _(Default: `null`)_
The `set` function called at entity creating or updating. You can modify the input value or compute a new one from other values of the entity. _It can be asynchronous._

**Example**
```js
{
    firstName: { type: "string", required: true },
    lastName: { type: "string", required: true },
    fullName: { 
        type: "string", 
        readonly: true, 
        set: (value, entity, field, ctx) => `${entity.firstName} ${entity.lastName}` 
    },
    email: { type: "string", set: value => value.toLowerCase() }
}
```

### `permission`: \<string\> _(Default: `null`)_
With `permission` property, you can control who can view & modify the value of the field. [Read more here.](#permissions)

### `readPermission`: \<string\> _(Default: `null`)_
With `readPermission` property, you can control who can view the value of the field. [Read more here.](#permissions)

### `populate`: \<string|Object|Function\> _(Default: `null`)_
The populate is similar as reference in SQL-based database engines, or populate in Mongoose ORM. [Read more here.](#populating)

### `onCreate`: \<Function\> _(Default: `null`)_
This is an operation hook which is called at new entity creating (`create` action, `createEntity` and `createEntities` methods). You can use it to set `createdAt` timestamp for entity.

_It can be asynchronous._

**Example**
```js
{
    createdAt: { 
        type: "number", 
        readonly: true, 
        onCreate: () => Date.now() 
    },
    createdBy: { 
        type: "string", 
        readonly: true, 
        onCreate: (value, entity, field, ctx) => ctx.meta.user.id 
    }
}
```

### `onUpdate`: \<Function\> _(Default: `null`)_
This is an operation hook which is called at entity updating (`update` action, `updateEntity`). You can use it to set `updatedAt` timestamp for entity.

_It can be asynchronous._

**Example**
```js
{
    updatedAt: { 
        type: "number", 
        readonly: true, 
        onUpdate: () => Date.now() 
    },
    updatedBy: { 
        type: "string", 
        readonly: true, 
        onUpdate: (value, entity, field, ctx) => ctx.meta.user.id 
    }
}
```

### `onReplace`: \<Function\> _(Default: `null`)_
This is an operation hook which is called at entity replacing (`replace` action, `replaceEntity`).

_It can be asynchronous._

**Example**
```js
{
    updatedAt: { 
        type: "number", 
        readonly: true, 
        onReplace: () => Date.now() 
    },
    updatedBy: { 
        type: "string", 
        readonly: true, 
        onReplace: (value, entity, field, ctx) => ctx.meta.user.id 
    }
}
```

### `onRemove`: \<Function\> _(Default: `null`)_
This is an operation hook which is called at entity removing (`remove` action, `removeEntity`).
If you define it, the service switch to **soft delete mode**. It means, the record won't be deleted in the table/collection. [Read more about soft delete feature.](#soft-delete)

_It can be asynchronous._

**Example**
```js
{
    removeAt: { 
        type: "number", 
        readonly: true, 
        onReplace: () => Date.now() 
    },
    removeBy: { 
        type: "string", 
        readonly: true, 
        onReplace: (value, entity, field, ctx) => ctx.meta.user.id 
    }
}
```


### Additional field properties
You can use any additional properties for validation & sanitization from the Fastest Validator rule properties like `min`, `max`, `trim`, `lowercase` ...etc.

[Check the documentation of Fastest Validator.](https://github.com/icebob/fastest-validator#readme)

# Actions

The service generates common CRUD actions if the `createActions` mixin option is not `false`.
You can fine control which actions should be created.

**Example to disable all action creation**
```js
module.exports = {
    mixins: [DbService({
        createActions: false
    })]
}
```

**Example to disable specified action creation**
```js
module.exports = {
    mixins: [DbService({
        createActions: {
            find: false,
            replace: false
        }
    })]
}
```

## `find` Find entities
Find entitites by query.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `limit` | `Number` | `null` | Max count of rows. |
| `offset` | `Number` | `null` | Count of skipped rows. |
| `fields` | `String\|Array<String>` | `null` | Fields to return. |
| `sort` | `String` | `null` | Sorted fields. |
| `search` | `String` | `null` | Search text. |
| `searchFields` | `String\|Array<String>` | `null` | Fields for searching. |
| `collation` | `Object` | `null` | Collaction settings. Passed for adapter directly. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for query. If `false`, disables the default scopes. |
| `populate` | `String\|Array<String>` | `null` | Populated fields. |
| `query` | `String\|Object` | `null` | Query object. If `String`, it's converted with `JSON.parse` |

### REST endpoint
```js
GET /{serviceName}/all
```

### Results

```js
[
    {
        id: "akTRSKTKzGCg9EMz",
        title: "Third post",
        content: "Content of my 3rd post...",
        votes: 0,
        status: false,
        createdAt: 1618077045354,
    },
    {
        id: "0YZQR0oqyjKILaRn",
        title: "My second post",
        content: "Content of my second post...",
        votes: 3,
        status: true,
        createdAt: 1618077045352,
    }
]
```


### Examples

#### Limit & offset
```js
const posts = await broker.call("posts.find", { limit: 10, offset: 50 });
```

#### Fields
```js
const posts = await broker.call("posts.find", { fields: ["id", "title", "votes"] });
```

#### Sorting (one field)
```js
const posts = await broker.call("posts.find", { sort: "createdAt" });
```

#### Sorting (multiple fields)
_The `-` negative sign prefix means descendant sorting._
```js
const posts = await broker.call("posts.find", { sort: ["-votes", "title"] });
```

#### Searching
```js
const posts = await broker.call("posts.find", {
    search: "content",
    searchText: ["title", "content"]
});
```
> MongoDB supports full-text search, so the `searchText` is not used because MongoDB searches the documents according to the defined `text` indexes.

#### Scope
```js
const posts = await broker.call("posts.find", { scope: "onlyActive" });
```

#### Multiple scopes
```js
const posts = await broker.call("posts.find", { scope: ["onlyActive", "hasVotes"] });
```

#### Disable all default scopes
```js
const posts = await broker.call("posts.find", { scope: false });
```

#### Populate
```js
const posts = await broker.call("posts.find", { populate: "author" });
```

#### Multiple populates
```js
const posts = await broker.call("posts.find", { populate: ["author", "voters"] });
```

#### Using query
```js
const posts = await broker.call("posts.find", {
    query: {
        status: false
    }
});
```

```js
const posts = await broker.call("posts.find", {
    query: {
        status: true,
        votes: {
            $gt: 5
        }
    }
});
```

#### 

## `list` List entities
List entitites with pagination. It returns with the total number of rows, as well.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `page` | `Number` | `null` | Page number. |
| `pageSize` | `Number` | `null` | Size of a page. |
| `fields` | `String\|Array<String>` | `null` | Fields to return. |
| `sort` | `String` | `null` | Sorted fields. |
| `search` | `String` | `null` | Search text. |
| `searchFields` | `String\|Array<String>` | `null` | Fields for searching. |
| `collation` | `Object` | `null` | Collaction settings. Passed for adapter directly. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for query. If `false`, disables the default scopes. |
| `populate` | `String\|Array<String>` | `null` | Populated fields. |
| `query` | `String\|Object` | `null` | Query object. If `String`, it's converted with `JSON.parse` |

### REST endpoint
```js
GET /{serviceName}/
```

### Results

```js
{
    rows: [
        {
            id: "2bUwg4Driim3wRhg",
            title: "Third post",
            content: "Content of my 3rd post...",
            votes: 0,
            status: false,
            createdAt: 1618077609105,
        },
        {
            id: "Di5T8svHC9nT6MTj",
            title: "My second post",
            content: "Content of my second post...",
            votes: 3,
            status: true,
            createdAt: 1618077609103,
        },
        {
            id: "YVdnh5oQCyEIRja0",
            title: "My first post",
            content: "Content of my first post...",
            votes: 0,
            status: true,
            createdAt: 1618077608593,
        },
    ],
    total: 3,
    page: 1,
    pageSize: 10,
    totalPages: 1,
}
```

### Examples

#### Pagination
```js
const posts = await broker.call("posts.list", { page: 3, pageSize: 10 });
```

------
The other parameter examples are same as [`find`](#find-find-entities) action.

## `count` Count entities
Get count of entities by query.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `search` | `String` | `null` | Search text. |
| `searchFields` | `String\|Array<String>` | `null` | Fields for searching. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for query. If `false`, disables the default scopes. |
| `query` | `String\|Object` | `null` | Query object. If `String`, it's converted with `JSON.parse` |

### REST endpoint
```js
GET /{serviceName}/count
```

### Results

```js
15
```

### Examples

```js
const postCount = await broker.call("posts.count");
```

The parameter examples are same as [`find`](#find-find-entities) action.


## `get` Get an entity by ID
Get an entity by ID.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any` | `null` | ID of entity. The name of property comes from the primaryKey field. |
| `fields` | `String\|Array<String>` | `null` | Fields to return. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for query. If `false`, disables the default scopes. |
| `populate` | `String\|Array<String>` | `null` | Populated fields. |

### REST endpoint
```js
GET /{serviceName}/{id}
```

### Results

```js
{
    id: "YVdnh5oQCyEIRja0",
    title: "My first post",
    content: "Content of my first post...",
    votes: 0,
    status: true,
    createdAt: 1618077608593,
}
```

### Examples

```js
const post = await broker.call("posts.get", { id: "YVdnh5oQCyEIRja0" });
```

#### Different ID field
If you can use different primary key field name instead of `id`, you should use it in the action params, as well.

**Primary key definition in `fields`**
```js
{
    key: { type: "string", primaryKey: true, columnName: "_id" }
}
```

**Call the action**
```js
const post = await broker.call("posts.get", { key: "YVdnh5oQCyEIRja0" });
```

------
The other parameter examples are same as [`find`](#find-find-entities) action.


## `resolve` Get entit(ies) by ID(s)
Resolve an entity by one or multiple IDs.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any\|Array<any>` | `null` | ID of entity(ies). The name of property comes from the primary key field. |
| `fields` | `String\|Array<String>` | `null` | Fields to return. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for query. If `false`, disables the default scopes. |
| `populate` | `String\|Array<String>` | `null` | Populated fields. |
| `mapping` | `boolean` | `false` | Convert the result to `Object` where the key is the ID. |
| `throwIfNotExist` | `boolean` | `false` | If `true`, throw `EntityNotFound` error if the entity is not exist. |


### REST endpoint
No endpoint.

### Examples

#### Call with a single ID
```js
const post = await broker.call("posts.resolve", { id: "YVdnh5oQCyEIRja0" });
```

**Result**
```js
{
    id: "YVdnh5oQCyEIRja0",
    title: "My first post",
    content: "Content of my first post...",
    votes: 0,
    status: true,
    createdAt: 1618077608593,
}
```

#### Call with multiple IDs
```js
const post = await broker.call("posts.resolve", { id: ["YVdnh5oQCyEIRja0", "Di5T8svHC9nT6MTj"] });
```

**Result**
```js
{
    id: "YVdnh5oQCyEIRja0",
    title: "My first post",
    content: "Content of my first post...",
    votes: 0,
    status: true,
    createdAt: 1618077608593,
},
{
    id: 'Di5T8svHC9nT6MTj',
    title: 'My second post',
    content: 'Content of my second post...',
    votes: 3,
    status: true,
    createdAt: 1618077609103
}
```

### Call with mapping
```js
const post = await broker.call("posts.resolve", { 
    id: ["YVdnh5oQCyEIRja0", "Di5T8svHC9nT6MTj"], 
    mapping: true 
});
```

**Result**
```js
{
    aJpbex55yO6qvpbL: {
        id: 'aJpbex55yO6qvpbL',
        title: 'Third post',
        content: 'Content of my 3rd post...',
        votes: 0,
        status: false,
        createdAt: 1618079528329
    },
    FbuK1O5tcmUIRrQL: {
        id: 'FbuK1O5tcmUIRrQL',
        title: 'My second post',
        content: 'Content of my second post...',
        votes: 3,
        status: true,
        createdAt: 1618079528327
    }
}
```

------
The other parameter examples are same as [`find`](#find-find-entities) action.


## `create` Create an entity
Create an entity.

### Parameters
No any special parameters. All fields will be used for entity after validation.

### REST endpoint
```js
POST /{serviceName}
```

### Results
Return with the new entity.

### Examples

```js
const post = await broker.call("posts.create", {
    title: "My first post",
    content: "Content of my first post..."
});
```

**Result**
```js
{
    id: "YVdnh5oQCyEIRja0",
    title: "My first post",
    content: "Content of my first post...",
    votes: 0,
    status: true,
    createdAt: 1618077608593,
}
```


## `update` Update an entity
Update an existing entity. Only the provided fields will be updated.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any` | `null` | ID of entity. The name of property comes from the primary key field. |

No any special parameters. All fields will be used for entity after validation.

### REST endpoint
```js
PATCH /{serviceName}/{id}
```

### Results
Return with the updated entity.

### Examples

```js
const post = await broker.call("posts.update", {
    id: "YVdnh5oQCyEIRja0",
    title: "Modified title",
    votes: 3
});
```

**Result**
```js
{
    id: "YVdnh5oQCyEIRja0",
    title: "Modified title",
    content: "Content of my first post...",
    votes: 3,
    status: true,
    createdAt: 1618077608593,
    updatedAt: 1618082167005
}
```


## `replace` Replace an entity
Replace an existing entity. The difference between replace and update that replace will replace the entiry entity. It means you should provide all required entity fields. This function doesn't merge the new and old entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any` | `null` | ID of entity. The name of property comes from the primary key field. |

No any special parameters. All fields will be used for entity after validation.

### REST endpoint
```js
PUT /{serviceName}/{id}
```

### Results
Return with the replaced entity.

### Examples

```js
const post = await broker.call("posts.update", {
    id: "YVdnh5oQCyEIRja0",
    title: "Replaced title",
    content: "Content of my first post...",
    votes: 10,
    status: true,
    createdAt: 1618077608593,
    updatedAt: 1618082167005
});
```

**Result**
```js
{
    id: "YVdnh5oQCyEIRja0",
    title: "Replaced title",
    content: "Content of my first post...",
    votes: 10,
    status: true,
    createdAt: 1618077608593,
    updatedAt: 1618082167005
}
```

## `remove` Delete an entity
Delete an entity by ID.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any` | `null` | ID of entity. The name of property comes from the primary key field. |

### REST endpoint
```js
DELETE /{serviceName}/{id}
```

### Results
Return with the deleted entity ID.

### Examples

```js
const post = await broker.call("posts.delete", { id: "YVdnh5oQCyEIRja0" });
```

**Result**
```js
"YVdnh5oQCyEIRja0"
```


## Custom actions
To add custom actions, just create them under `actions` and call the built-in methods.

**Example**
```js
// posts.service.js
module.exports = {
    // ...
    actions: {
        voteUp: {
            rest: "POST /:id/vote-up",
            params: {
                id: "string|required"
            },
            handler(ctx) {
                const entity = this.resolveEntity(ctx, params);
                return this.updateEntity(ctx, {
                    id: ctx.params.id,
                    votes: entity.votes + 1
                });
            }
        },

        voteDown: {
            rest: "POST /:id/vote-down",
            params: {
                id: "string|required"
            },
            handler(ctx) {
                const entity = this.resolveEntity(ctx, params);
                return this.updateEntity(ctx, {
                    id: ctx.params.id,
                    votes: entity.votes - 1
                });
            }
        }
    }
    // ...
}
```

# Methods

## `getAdapter`
`getAdapter(ctx?: Context)`

It returns an adapter instance based on the `Context`. If not found adapter, then it creates a new one. _It's important only in multi-tenant mode if custom `getAdapterByContext` method is implemented._

## `sanitizeParams`
`sanitizeParams(params: object, opts?: object)`

Sanitize the input parameters for `find`, `list` and `count` actions.

### Options
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `removeLimit` | `Boolean` | `false` | Remove the limit & offset properties (for `count` action). |
| `list` | `Boolean` | `false` | If `true`, it sanitize the `page` and `pageSize` parameters (for `list` action). |


## `findEntities`
`findEntities(ctx?: Context, params: object, opts?: object)`

Find entities by query. 

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for finding. It's same as [`find` action parameters](#parameters) |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `streamEntities`
`streamEntities(ctx?: Context, params: object, opts?: object)`

Find entitites by query like the `findEntities` but it returns a `Stream` 

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for finding. It's same as [`find` action parameters](#parameters) |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `countEntities`
`countEntities(ctx?: Context, params: object)`

Get count of entities by query.

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for finding. It's same as [`count` action parameters](#parameters-2) |


## `findEntity`
`findEntity(ctx?: Context, params: object, opts?: object)`

Find an entityby query. It returns only the first row of the result.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for finding. It's same as [`find` action parameters](#parameters) |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `resolveEntities`
`resolveEntities(ctx?: Context, params: object, opts?: object)`

Get entity(ies) by ID(s).

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for finding. It's same as [`resolve` action parameters](#parameters-4) |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |
| `opts.throwIfNotExist` | `boolean` | `false` | If `true`, throw `EntityNotFound` error if the entity is not exist. |


## `createEntity`
`createEntity(ctx?: Context, params: object, opts?: object)`

Create an entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Entity fields. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `createEntities`
`createEntities(ctx?: Context, params: Array<object>, opts?: object)`

Create multiple entities.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Array<Object>` | `null` | Array of entities. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `updateEntity`
`updateEntity(ctx?: Context, params: object, opts?: object)`

Update an existing entity. Only the provided fields will be updated.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | It contains the ID of the entity and the changed field values. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `replaceEntity`
`replaceEntity(ctx?: Context, params: object, opts?: object)`

Replace an existing entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | It contains the entire entity, which will be replaced. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `removeEntity`
`removeEntity(ctx?: Context, params: object, opts?: object)`

Delete an entity by ID.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | It contains the entity ID. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |

The method returns the deleted entity ID only.

## `clearEntities`
`clearEntities(ctx?: Context, params: object)`

Clear all entities in the table/collection.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | It contains the entity ID. |


## `validateParams`
`validateParams(ctx?: Context, params: object, opts?: object)`

It validates & sanitizes the input data in `params` against the `fields` definition. It's called in `createEntity`, `createEntities`, `updateEntity` and `replaceEntity` methods.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Entitiy field values. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.type` | `String` | `"create"` | Type of method. |


## `transformResult`
`transformResult(adapter: Adapter, docs: object|Array<object>, params?: object, ctx?: Context)`

It transforms the entities which comes from the database according to `fields` definitions.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `adapter` | `Adapter` | **required** | Adapter instance. |
| `docs` | `Object\|Array<Object>` | **required** | Entity or entities. |
| `params` | `Object` | `null` | Entitiy field values. |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |


## `createIndexes`
`createIndexes(adapter: Adapter, indexes: Array<object>)`

Create indexes by definitions. [Read more here](#indexes).

## `createIndex`
`createIndex(adapter: Adapter, index: object)`

Create an index by definition. [Read more here](#indexes).

# Implementable methods

## `getAdapterByContext`
`getAdapterByContext(ctx?: Context, adapterDef?: object)`

For multi-tenancy, you should define this method which creates an Adapter definition by the `Context`. 

It should return an `Array` with two values. First is a cache key, the second is the adapter definition.
The service uses the cache key to store the created adapter. Therefore in the next time, if the cache key is exist in the cache, the service won't create a new Adapter instance, instead using the previous one.

[About multi-tenant configuration, read more here](#multi-tenancy).

## `entityChanged`
`entityChanged(type: String, data?: any, ctx?: Context, opts?: object)`

It's a method which is called when an entity created, updated, replaced or removed. You can use it to clear the cache or send an event.

There is a default implementation which sends an entity changed events. [Read more about it here](#events).

### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `String` | Type of changes. Available values: `create`, `update`, `replace`, `remove`, `clear`. |
| `data` | `Object\|Array<Object>` | Changed entity or entities. |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `opts` | `Object` | Additional options. |
| `opts.batch` | `Boolean` | It's true if the operation affected multiple entities. |
| `opts.softDelete` | `Boolean` | It's true in case of soft deleting. |


## `encodeID`
`encodeID(id: any)`

You should define it, if you use secure primary key to encode the IDs before returning.

## `decodeID`
`decodeID(id: any)`

You should define it, if you use secure primary key to decode the received IDs.

## `checkFieldAuthority`
`checkFieldAuthority(ctx?: Context, permission: any, params: object, field: object)`

If you use `permission` and `readPermission` in field definitions, you should define this method and write the permission checking logic. 

_It can be asynchronous._

### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `permission` | `any` | The configured `permission` or `readPermission` value of field. |
| `params` | `Object` | Incoming data. |
| `field` | `Object` | Field definition. |


## `checkScopeAuthority`
`checkScopeAuthority(ctx?: Context, name?: string, scope?: any)`

You should implement it, if you want to check the permission of scopes.

_It can be asynchronous._

### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `name` | `String?` | Name of the scope. |
| `scope` | `any?` | Scope definition. |

_If `name` and `scope` are `null`, it means you should check the authority of default scope disabling._

# Scopes
The scopes allow you to add constraints for all query methods, like `find`, `list` or `count`. You can use it with soft-delete feature when you want to list only non-deleted entities, by default.

You can define your scopes in the service settings and define the default scopes.

## Example
In this example we create some scopes and show how you can use it at action calling.

**Define the service with scopes**
```js
// posts.service.js
{
    name: "posts",
    mixins: [DbService(/*...*/)],
    settings: {
        scopes: {
            // Define a scope which lists only the active status posts
            onlyActive: {
                status: true
            },
            // Define a scope which lists only the public posts 
            // where the `visibility` field of entity is "public"
            public: {
                visibility: "public"
            },
            // It's a custom Function to modify the query object directly.
            topVotes: q => {
                q.votes = {
                    $gt: 100
                };
                return q;
            }
        },

        // Define the default scopes which will be used for every 
        // listing methods if the `scope` is not defined in the `params`
        // In this case we want to always lists the "active" posts.
        defaultScopes: ["onlyActive"]
    }
}
```

**List the active posts without defining the scope**
```js
const activePosts = await broker.call("posts.find");
```

**List all public posts**
```js
const activePublicPosts = await broker.call("posts.find", { scope: "public" });
```

**List the active & public posts**
```js
const activePublicPosts = await broker.call("posts.find", { scope: ["onlyActive", "public"] });
```

**List all posts disabling the default scope(s)**
```js
const activePosts = await broker.call("posts.find", { scope: false });
```

You can do the same in REST calls:
```
GET /posts?scope=public
GET /posts?scope=onlyActive,public
```

# Indexes
You can define the indexes in the service `settings.indexes` property. It has a common format and every adapter will process and creates the indexes. Other option, if you call the `this.createIndex` method directly. [More info](#createindex)

## Index definition

### Properties
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `fields` | `String\|Array<String>\|Object` | **required** | Fields of the index. |
| `name` | `String` | `null` | Name of the index. _Optional._ |
| `unique` | `Boolean` | `false` | Unique index. |
| `sparse` | `Boolean` | `false` | Sparse index. _Not supported by all adapters._ |
| `type` | `String` | `null` | Type of index. _Not supported by all adapters._ |
| `expireAfterSeconds` | `Number` | `null` | Expiration. _Not supported by all adapters._ |

### Example

### Define a normal index for one field

```js
{
    fields: "title"
}
```

### Define a normal index for multiple fields

```js
{
    fields: ["title", "content"]
}
```

### Define a unique & sparse index

```js
{
    fields: "username",
    unique: true,
    sparse: true
}
```

### Define a MongoDB full-text search index

```js
{
    fields: { 
        title: "text",
        content: "text",
        tags: "text"
    }
}
```

# Streaming
The service has a [`streamEntities`](#streamentities) method which similar to the `findEntities` which returns the entities by query. But this method returns a `Stream` instance instead of the all rows. 

There is no pre-defined action for the method, by default. But you can create one easily:

## Create action for streaming
```js
module.exports = {
    name: "posts",
    // ...
    actions: {
        findStream: {
            rest: "/stream",
            handler(ctx) {
                return this.streamEntities(ctx, ctx.params);
            }
        }
    }
}
```

**Handle the `Stream` response**
```js
const rows = [];

const ss = await broker.call("posts.findStream");

ss.on("data", row => rows.push(row));
ss.on("end", () => {
    console.log("Received all entities via stream:", rows)
});
```

# Nested objects & arrays
The document-based database engines handles nested objects & arrays generally. You can use them in the field definitions, as well.
The definition is similar to [Fastest Validator nested object schema](https://github.com/icebob/fastest-validator#object).

## Example for nested object field
```js
module.exports = {
    // ...
    settings: {
        fields: {
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
            }
        }
    }
};
```

## Example for string array
```js
module.exports = {
    // ...
    settings: {
        fields: {
            roles: {
                type: "array",
                max: 3,
                items: { type: "string" }
            }
        }
    }
};
```

## Example for array with objects
```js
module.exports = {
    // ...
    settings: {
        fields: {
            phones: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        type: { type: "string" },
                        number: { type: "string", required: true },
                        primary: { type: "boolean", default: false }
                    }
                }
            }
        }
    }
};
```

Mostly, the SQL-based adapters (Knex, Sequelize) can't handle them, so that they convert the `object` and `array` to a JSON string and store them as a `String`. But when you receives the entity, the adapter converts back to `object` and `array`. So you won't notice that it stores in different type. The only disadvantage is that you can't filter to properties of nested objects. 

## Example for nested object field as stored as a `String`
```js
module.exports = {
    // ...
    settings: {
        fields: {
            address: {
                type: "object",
                columnType: "string",
                properties: {
                    // ...
                }
            }
        }
    }
};
```


# Populating
The service allows you to easily populate fields from other services. For example: If you have an `author` field in the `posts` entity, you can populate it with `users` service by ID of the author. If the field is an `Array` of IDs, it will populate all entities via only one request

## Example of populate fields
```js
module.exports = {
    // ...
    settings: {
        fields: {
            // Shorthand populate, only set the action name.
            voters: {
                type: "array", 
                items: "string",
                populate: "users.resolve" 
            },

            // Define the action name and the params. It will resolve the `username` and `fullName` of the author.
            author: {
                type: "string",
                populate: {
                    action: "users.resolve",
                    params: {
                        fields: ["username", "fullName"]
                    }
                }
            },

            // In this case the ID is in the `reviewerID` field.
            // But we create a `reviewer` virtual field which contains the populated reviewer entity.
            reviewer: {
                type: "object",
                virtual: true,
                populate: {
                    action: "users.resolve",
                    keyField: "reviewerID",
                    params: {
                        fields: ["name", "email", "avatar"]
                    },
                    callOptions: {
                        timeout: 3000
                    }
                }
            },            

            // Custom populate handler function for a virtual field
            postCount: {
                type: "number",
                virtual: true,
                populate: (ctx, values, entities, field) => {
                    return Promise.all(
                        entities.map(entity =>
                            ctx.call("posts.count", { query: { authorID: entity.id } })
                        )
                    );
                }
            }
        }
    }
    // ...
}
```

# Permissions
You can configure the readable & writable fields in the field definitions. It's useful when you want to return more fields if the logged in user is an administrator but less fields for the regular users.
To check the authority, you should define the [`checkFieldAuthority`](#checkfieldauthority) method.

## Example field definitions
```js
// users.service.js
module.exports = {
    name: "users",
    mixins: [DbService(/*...*/)],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            name: { type: "string" },
            // Only the administrators can receives this field in responses.
            email: { type: "email", readPermission: "admin" },
            // Only the administrators can read & write this field.
            verified: { type: "boolean", permission: "admin" }
        }
    },

    methods: {
        // If we defined the necessary permissions in the fields, we should write 
        // the permission checking logic into the `checkFieldAuthority` method.
        async checkFieldAuthority(ctx, permission, params, field) {
            const roles = ctx.meta.user.roles || [];

            // Returns `true` if the logged in user's role field contains the required role.
            return roles.includes(permission);
		}
    }
}
```

# Soft delete
For using the soft-delete feature, you should just define the [`onRemove`](#onremove-function-default-null) property for a field. The service detects it at the initialization and turn on this feature. Then, you can call the `remove` action or `removeEntity` method, they won't remove the entities physically, just set the value of the defined field.

Please note, you should configure scopes, as well in order to skip the deleted entities in the listing methods.

## Example
```js
// posts.service.js
module.exports = {
    name: "posts",
    mixins: [DbService(/*...*/)],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            title: { type: "string" },
            content: { type: "string" },
            // The `onRemove` will turn on the soft-deleting feature
            deletedAt: { type: "number", readonly: true, onRemove: () => Date.now() }
        },

        scopes: {
            notDeleted: { 
                deletedAt: { $exists: false } 
            },
        },

        // Configure the scope as default scope
        defaultScopes: ["notDeleted"]
    }
};
```

**List all available posts (excluding deleted entities)**
```js
const posts = await broker.call("posts.find");
```

**List all posts (including deleted entities, as well)**
```js
const allPosts = await broker.call("posts.find", { scope: false });
```

As you see, it can cause a security issue if the user in the browser can request the deleted posts, as well. To avoid it, you can control the authority of scopes and default scopes disabling with the [`checkScopeAuthority`](#checkscopeauthority) method.

## Example with authority
```js
// posts.service.js
module.exports = {
    name: "posts",
    mixins: [DbService(/*...*/)],
    settings: {
        /* ... */
    },

    methods: {
        /**
         * Check the scope authority. Should be implemented in the service.
         * If `name and `scope` are null, it means you should check the permissions
         * when somebody wants to turn off the default scopes (e.g. list
         * deleted records, as well).
         *
         * @param {Context} ctx
         * @param {String?} name
         * @param {Object?} scope
         */        
        async checkScopeAuthority(ctx, name, scope) {
            // We enable default scope disabling only for administrators.
            if (scope == null) {
                return ctx.meta.user.roles.includes("admin");
            }

            // Enable all other scopes for everybody.
            return true;
        },  
    }
};
```

# Caching
The service has a built-in caching mechanism. If a cacher is configured in the ServiceBroker, the service stores the responses of `find`, `list`, `get` and `resolve` actions and clear the cache if any entities have been changed.

The caching is enabled by default and uses the `cache.clean.{serviceName}` (e.g. `cache.clean.posts`) event name for clearing the cached entries. To disable it, set `cache.enabled = false` in [Mixin options](#mixin-options).

## Under the hood
To store the responses in the cache, service uses the ServiceBroker built-in action caching mechanism. The cache clearing is a little bit complicated because if you are running multiple instances of the service with a local Memory cache, you should notify the other instances if an entity changed. To cover it, the service broadcasts a cache clearing event (e.g. `cache.clean.posts`) and also subscribes to this event. In the subscription handler, it calls the `broker.cacher.clean` method.

So if you have multiple instances of the service, and the first instance updates an entity, then it broadcasts the cache clearing event. Both instances receives the event and both will clear the cache entries. It's simple but works any number of instances.

## Clear cached populated data
When you use populated data in your service, it means that the service will store data from other services in the cache.

Let's say, you have two services, `posts` and `users`. Every post entity has an `author` which points to a `user` entity. You configure `populate` for the `author` field in `posts` service which resolves the author from the `users` service. So if you get a post with author, the cache will store the user entity inside the post entity. For example:
```js
// GET /api/posts/12345?populate=author
{
    id: "12345",
    title: "My post",
    author: {
        name: "John Doe"
    }
}
```
Imagine that, the author updates his name to "Mr. John Doe" in the `users` service. But if he gets the post response, he will see still his old name because the response comes from the `posts` service cache. The changes happened in the `users` service, but the `posts` service doesn't know about it.

To avoid it, you should subscribe to the cache cleaning events of the dependent services.

### Example
```js
module.exports = {
    name: "posts",
    mixins: [DbService(/*...*/)],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            title: { type: "string" },
            content: { type: "string" },
            author: { 
                type: "string", 
                required: true,
                populate: "users.resolve"
            }
        }
    },

    events: {
        async "cache.clean.users"() {
            if (this.broker.cacher) {
                // Clear the local cache entries
				await this.broker.cacher.clean(`${this.fullName}.**`);
		    }
        }
    }
};
```


# Events
The [`entityChanged`](#entitychanged) method has a default implementation which sends entity lifecycle events. You can use it to subscribe them in other dependent services.

| Action | Method | Event | Description |
| -------- | ---- | ------- | ----------- |
| `create` | `createEntity` | `{serviceName}.created` | Sent after a new entity created and saved to the database. |
| - | `createEntities` | `{serviceName}.created` | Sent after multiple entities created and saved to the database. In this case the `opts.batch == true` |
| `update` | `updateEntity` | `{serviceName}.updated` | Sent after an entity updated. |
| `replace` | `replaceEntity` | `{serviceName}.replaced` | Sent after an entity replaced. |
| `remove` | `removeEntity` | `{serviceName}.removed` | Sent after an entity deleted. |
| - | `clearEntities` | `{serviceName}.cleared` | Sent after the table/collection cleared (deleted all entities). |

If you want to change it, just simply overwrite the [`entityChanged`](#entitychanged) method and implement your own logic.

# Cascade delete
In DBMS, you can configure `CASCADE DELETE` function for relations between tables. It means, if a record is deleted from the parent table, the database engine will delete the related child records, as well. In microservices projects and in this database services you can't define relations because it's a common case that some services use different database engines.

But you can use this cascade delete feature with a simple event subscription. If an entity changed in the parent table/collection, the service broadcasts entity lifecycle events. So you can subscribe to this event in your child services and remove the relevant entities.

## Example
Let's say, you have a `users` service and a `posts` service. If a user is deleted, we should delete the user's posts, as well.

**users.service.js**

It's just a simple service, no need to set any special.
```js
module.exports = {
    name: "users",
    mixins: [DbService(/*...*/)],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            name: { type: "string" },
            email: { type: "email" }
        }
    }
};
```

**posts.service.js**

Subscribe to the `users.removed` event and remove posts by `adapter.removeMany`.
```js
module.exports = {
    name: "posts",
    mixins: [DbService(/*...*/)],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            title: { type: "string" },
            content: { type: "string" },
            author: { type: "string", required: true }
        }
    },

    events: {
        async "users.removed"(ctx) {
            const user = ctx.params.data;
            const adapter = await this.getAdapter(ctx);
            await adapter.removeMany({ author: user.id });
            this.logger.info(`The ${user.name} user's posts removed.`);
        }
    }
};
```

# Multi-tenancy
The service supports many multi-tenancy methods. But every method has different configuration.
For every method it's mandatory that you store the tenant ID in the `ctx.meta`. The best practice is to resolve the logged in user in the API gateway `authenticate` or `authorize` method and set the resolved user into the `ctx.meta.user`.

## Record-based tenancy
This mode uses the same database server, same database and same collection/table. But there is a tenant ID field in the collection/table for filtering.

### Steps for configuration
1. Create a tenant ID field in the `fields` and create a `set` method which reads the tenant ID from the `ctx.meta`.
2. Create a custom scope which filtering the entities by tenant ID.
3. Set this scope as default scope.

### Example
```js
// posts.service.js
module.exports = {
    name: "posts",
    mixins: [DbService({ adapter: "MongoDB" })],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            title: { type: "string", required: true, min: 5 },
            content: { type: "string", required: true },
            tenantId: {
                type: "string",
                required: true,
                set: (value, entity, field, ctx) => ctx.meta.user.tenantId
            }
        },
        scopes: {
            tenant(q, ctx) {
                const tenantId = ctx.meta.user.tenantId;
                if (!tenantId) throw new Error("Missing tenantId!");

                q.tenantId = tenantId;
                return q;
            }
        },
        defaultScopes: ["tenant"]
    }
};
```

## Table/Collection-based tenancy
This mode uses the same database server, same database but different collection/table. It means every tenant has an individual table/collection.

### Steps for configuration
1. Define the `getAdapterByContext` method to generate adapter options for every tenant.

### Example
```js
// posts.service.js
module.exports = {
    name: "posts",
    mixins: [DbService({ adapter: "MongoDB" })],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            title: { type: "string", required: true, min: 5 },
            content: { type: "string", required: true }
        }
    },

    methods: {
        getAdapterByContext(ctx, adapterDef) {
            const tenantId = ctx && ctx.meta.user.tenantId;
            if (!tenantId) throw new Error("Missing tenantId!");

            return [
                // cache key
                tenantId, 

                // Adapter options
                {
                    type: "MongoDB",
                    options: {
                        uri: "mongodb://localhost:27017/moleculer-demo",
                        collection: `posts-${tenantId}`
                    }
                }
            ];
        }      
    }
};
```

## Database/Server-based tenancy
This mode uses different connection string. It means every tenant has an individual database or server.

### Steps for configuration
1. Define the `getAdapterByContext` method to generate adapter options for every tenant.

### Example
```js
// posts.service.js
module.exports = {
    name: "posts",
    mixins: [DbService({ adapter: "MongoDB" })],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            title: { type: "string", required: true, min: 5 },
            content: { type: "string", required: true }
        }
    },

    methods: {
        getAdapterByContext(ctx, adapterDef) {
            const tenantId = ctx && ctx.meta.user.tenantId;
            if (!tenantId) throw new Error("Missing tenantId!");

            return [
                // cache key
                tenantId, 

                // Adapter options
                {
                    type: "MongoDB",
                    options: {
                        uri: `mongodb://localhost:27017/moleculer-demo--${tenantId}`,
                        collection: `posts`
                    }
                }
            ];
        }      
    }
};
```

# Adapters
The adapter is a class that executes the database operations with NPM libraries. This project contains many built-in adapters. 

If the `adapter` is not defined in the Mixin options, the service will use the NeDB adapter with memory database. It can be enough for testing & prototyping. It has the same API as MongoDB client library.

>Note: The adapter connects to the database only at the first request. It means your service will start properly even if the database server is not available. The reason is that in multi-tenancy mode, the service can't establish a connection without tenant ID.

## Cassandra
*Not implemented yet.*

## Couchbase
*Not implemented yet.*

## CouchDB
*Not implemented yet.*

## Knex
[Knex adapter documentation](/docs/adapters/Knex.md)

## MongoDB
[MongoDB adapter documentation](/docs/adapters/MongoDB.md)

## Mongoose
*Not implemented yet.*

## NeDB
[NeDB adapter documentation](/docs/adapters/NeDB.md)

## Sequelize
*Not implemented yet.*

## Adapter common methods

## Constructor
`constructor(opts?: object)`

The constructor has an optional `opts` parameter which is adapter-specific. Every adapter has custom options.

## `hasNestedFieldSupport`
`get hasNestedFieldSupport`

It's a getter that returns whether the adapter can handle nested objects & arrays or not.

## `connect`
`connect()`

Connect to the database. Don't call directly!

## `disconnect`
`disconnect()`

Disconnect from the database. Don't call directly!

## `find`
`find(params: object)`

Find entities by `params`. The `params` contains the same properties as [`find` action](#find-find-entities).

## `findOne`
`findOne(query: object)`

Find only first entity by `query`.

## `findById`
`findById(id: any)`

Find an entity by primary key.

## `findByIds`
`findByIds(id: Array<any>)`

Find multiple entities by primary keys.

## `findStream`
`findStream(params: object)`

Find entities by `params`. The `params` contains the same properties as [`find` action](#find-find-entities).
The response is a `Stream`.

>Please note, not every adapter support it.

## `count`
`count(params: object)`

Count entities by `params`. The `params` contains the same properties as [`count` action](#count-count-entities).

## `insert`
`insert(entity: object)`

Insert an entity. It returns the saved entity.

## `insertMany`
`insertMany(entities: Array<object>)`

Insert multiple entities. It returns the saved entities.

## `updateById`
`updateById(id: any, changes: object, opts: object)`

Update an entity by ID. The `changes` contains the changed properties of entity. It returns the updated entity.

> If the adapter supports the raw changes, you can enable it with `opts.raw = true`. In this case, the changes is not manipulated, instead passed directly to the database client.

## `updateMany`
`updateMany(query: object, changes: object, opts: object)`

Update multiple entities by query. The `changes` contains the changed properties of entity. It returns the number of updated entities.

> If the adapter supports the raw changes, you can enable it with `opts.raw = true`. In this case, the changes is not manipulated, instead passed directly to the database client.

## `replaceById`
`replaceById(id: any, entity: object)`

Replace an entity by ID. It returns the updated entity.

## `removeById`
`removeById(id: any)`

Remove an entity by ID. It returns the removed entity ID.

## `removeMany`
`removeMany(query: object)`

Remove multiple entity by `query`. It returns the number of removed entities.

## `clear`
`clear()`

Clear (truncate) the whole table/collection. It returns the number of removed entities.

## `entityToJSON`
`entityToJSON(entity: object)`

Convert the received data from database client to [POJO](https://masteringjs.io/tutorials/fundamentals/pojo).

## `createIndex`
`createIndex(def: any)`

Create an index on the table/collection. [Read more about the `def` parameter](#index-definition).

## `removeIndex`
`removeIndex(def: any)`

Remove an index from the table/collection. [Read more about the `def` parameter](#index-definition).




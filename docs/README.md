
# Mixin options

The options of the Mixin.

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `adapter` | `Object` | `NeDB` | Configure the adapter. |
| `createActions` | `Boolean` | `true` | Generate CRUD actions. |
| `actionVisibility` | `String` | `published` | Default visibility of generated actions |
| `generateActionParams` | `Boolean` | `true` | Generate `params` schema for generated actions based on the `fields` |
| `strict` | `Boolean\|String` | `remove` | Strict mode in validation schema for objects. Values: `true`, `false`, `"remove"` |
| `cache` | `Object` | | Action caching settings |
| `cache.enabled` | `Boolean` | `true` | Enable caching on actions |
| `cache.eventName` | `String` | `cache.clean.{serviceName}` | Name of the broadcasted event for clearing cache at modifications (update, replace, remove). If `false`, it disables event broadcasting & subscription |
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


## Add a custom action
TODO

# Methods

## `getAdapter`
`getAdapter(ctx?: Context)`

TODO

## `sanitizeParams`
`sanitizeParams(params: object, opts?: object)`

TODO

## `findEntities`
`findEntities(ctx?: Context, params: object, opts?: object)`

TODO

## `streamEntities`
`streamEntities(ctx?: Context, params: object, opts?: object)`

TODO

## `countEntities`
`countEntities(ctx?: Context, params: object)`

TODO

## `findEntity`
`findEntity(ctx?: Context, params: object, opts?: object)`

TODO

## `resolveEntities`
`resolveEntities(ctx?: Context, params: object, opts?: object)`

TODO

## `createEntity`
`createEntity(ctx?: Context, params: object, opts?: object)`

TODO

## `createEntities`
`createEntities(ctx?: Context, params: Array<object>, opts?: object)`

TODO

## `updateEntity`
`updateEntity(ctx?: Context, params: object, opts?: object)`

TODO

## `replaceEntity`
`replaceEntity(ctx?: Context, params: object, opts?: object)`

TODO

## `removeEntity`
`removeEntity(ctx?: Context, params: object, opts?: object)`

TODO

## `clearEntities`
`clearEntities(ctx?: Context, params: object, opts?: object)`

TODO

## `validateParams`
`validateParams(ctx?: Context, params: object, opts?: object)`

TODO

## `transformResult`
`transformResult(adapter: Adapter, docs: object|Array<object>, params?: object, ctx?: Context)`

TODO

# Implementable methods

## `getAdapterByContext`
`getAdapterByContext(ctx?: Context, adapterDef?: object)`

TODO

## `entityChanged`
`entityChanged(type: String, data?: any, ctx?: Context, opts?: object)`

TODO

## `encodeID`
`encodeID(id: any)`

TODO

## `decodeID`
`decodeID(id: any)`

TODO

## `checkFieldAuthority`
`checkFieldAuthority(ctx?: Context, permission: any, params: object, field: object)`

TODO

## `checkScopeAuthority`
`checkScopeAuthority(ctx?: Context, name: string, scope: object|Function)`

TODO


# Scopes
TODO

# Indexes
You can define the indexes in the service `settings.indixes` property. It has a common format and every adapter will process and creates the indexes.
Other option, if you call the adapter.createIndex` method directly. [More info](#createindexdef-any)

# Populating
TODO

# Permissions
TODO

# Soft delete
TODO

# Cascade delete
TODO (with events)

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

## `connect`
`connect()`

TODO

## `disconnect`
`disconnect()`

TODO

## `find`
`find(params: object)`

TODO

## `findOne`
`findOne(query: object)`

TODO

## `findById`
`findById(id: any)`

TODO

## `findByIds`
`findByIds(id: Array<any>)`

TODO

## `findStream`
`findStream(params: object)`

TODO

## `count`
`count(params: object)`

TODO

## `insert`
`insert(entity: object)`

TODO

## `insertMany`
`insertMany(entities: Array<object>)`

TODO

## `updateById`
`updateById(id: any, changes: object)`

TODO

## `updateMany`
`updateMany(query: object, changes: object)`

TODO

## `replaceById`
`replaceById(id: any, changes: object)`

TODO

## `removeById`
`removeById(id: any, changes: object)`

TODO

## `removeMany`
`removeMany(query: object, changes: object)`

TODO

## `clear`
`clear()`

TODO

## `entityToJSON`
`entityToJSON(entity: object)`

TODO

## `createIndex`
`createIndex(def: any)`

TODO




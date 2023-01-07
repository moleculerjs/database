
# Mixin options

The options of the Mixin.

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `adapter` | `Object` | `NeDB` | Configure the adapter. [Read more](#adapters) |
| `createActions` | `Boolean` | `true` | Create CRUD actions. |
| `actionVisibility` | `String` | `published` | Default visibility of generated actions. |
| `generateActionParams` | `Boolean` | `true` | Create `params` schema for generated actions based on the `fields`. |
| `strict` | `Boolean\|String` | `remove` | Strict mode in the validation schema for objects. Values: `true`, `false`, `"remove"`. |
| `cache` | `Object` | | Action caching settings. |
| `cache.enabled` | `Boolean` | `true` | Enable caching for actions. |
| `cache.eventName` | `String` | `cache.clean.{serviceName}` | Name of the broadcasted event for clearing the cache in case of changes (update, replace, remove). |
| `cache.eventType` | `String` | `"broadcast"` | Type of the broadcasted event. It can be `"broadcast"`, or `"emit"`. If `null`, the sending of the event is disabled. |
| `cache.cacheCleanOnDeps` | `Boolean\|Array<String>` | `true` | Subscribe to the cache clean event of the service dependencies and clear the local cache entries. If it's an `Array<String>`, it should be the exact event names. |
| `cache.additionalKeys` | `Array<String>` | `null` | Additional cache keys. |
| `cache.cacheCleaner` | `Function` | `null` | Custom cache cleaner function. |
| `rest` | `Boolean` | `true` | Set the API Gateway auto-aliasing REST properties in the service & actions. |
| `entityChangedEventType` | `String` | `"broadcast"` | Type of the entity changed event. Values: `null`, `"broadcast"`, `"emit"`. The value `null` disables the sending of events. |
| `entityChangedOldEntity` | `Boolean` | `false` | Add previous entity data to the entity changed event payload in case of update or replace. |
| `autoReconnect` | `Boolean` | `true` | Automatic reconnect if the DB server is not available when connecting for the first time. |
| `maximumAdapters` | `Number` | `null` | Maximum number of connected adapters. In case of multi-tenancy. |
| `maxLimit` | `Number` | `-1` | Maximum value of `limit` in `find` action and `pageSize` in `list` action. Default: `-1` (no limit) |
| `defaultPageSize` | `Number` | `10` | Default page size in the `list` action. |


# Settings

The settings of the service.

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `fields` | `Object` | `null` | Field definitions. [More info](#fields) |
| `scopes` | `Object` | `null` | Scope definitions. [More info](#scopes) |
| `defaultScopes` | `Array<String>` | `null` | Default scope names. [More info](#scopes) |
| `defaultPopulates` | `Array<String>` | `null` | Default populated fields. [More info](#populating) |
| `indexes` | `Object` | `null` | Index definitions. [More info](#indexes) |


# Fields

The field definition is similar to [Fastest Validator](https://github.com/icebob/fastest-validator) schemas. You can define them in the same format and the service uses the Fastest Validator to validate and sanitize the input data.

>The difference between this schema and FV schema is that here all defined fields are optional (just like the fields in the Database Engines). You should set the property `required: true` for mandatory fields.

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

>You can find more information about shorthand format in the [Fastest Validator documentation](https://github.com/icebob/fastest-validator#shorthand-definitions).


## Field properties

### `type`: \<string\> _(no default value, it's a required property)_
The `type` defines the type of the field value. It can be any primitive type (`boolean`, `number`, `string`, `object`, `array`) or any type from Fastest Validator types. If the type is not a valid database type, you should define the `columnType` property with a valid database field type as well.

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

>Please note, if the value type and the defined type do not match, the service will try to convert the value to the defined type. In the above example, if you set `age: "34"`, the service will not throw a `ValidationError`, but will convert it to `Number`.

### `required`: \<boolean\> _(Default: `false`)_
Each field is optional by default. To make it mandatory, set `required: true` in the field properties. If this field is `null` or `undefined`, the service throws a `ValidationError` in the `create` & `replace` actions.

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
For ID fields set the `primaryKey` to true. The service knows the name of the ID field and the type according to this property.

>Please note that the service does not support composite primary keys.

**Example**
```js
{
    id: { type: "string", primaryKey: true, columnName: "_id" }
}
```

#### User-defined primary key
If you would like to set the primary key values instead of database generate them, set the `generated: "user"` property into the primary key field definition.

**Example**
```js
{
    id: { type: "string", primaryKey: true, generated: "user", columnName: "_id" }
}
```


### `secure`: \<boolean\> _(Default: `false`)_
With the `secure` property you can encrypt the value of the ID field. This can be useful to prevent users from finding out the IDs of other documents when the database uses incremental ID values.

To use it, you should define `encodeID(id)` and `decodeID(id)` methods in the service that performs the encoding/decoding operations.

> The [`hashids`](https://hashids.org/javascript/) lib can generate Youtube-like alphanumeric IDs from number(s) or from Mongo's `ObjectID`.


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
>Please note that the methods should be synchronous.

### `columnName`: \<string\> _(Default: name of field)_
With the `columnName` property you can use another field name in the database collection/table. 

**Example**
```js
{
    id: { type: "string", primaryKey: true, columnName: "_id" },
    fullName: { type: "string", columnName: "full_name" }
}
```


### `columnType`: \<string\> _(Default: value of the `type` property)_
With the `columnType` property you can use another field type in the database collection/table. It should be set in SQL databases because e.g. `number` is not a valid database field type.

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
For the non-required fields, you can set default values. If the field value is `null` or `undefined` in the `create` and `replace` actions, the service will set the defined default value. If the `default` is a Function, the service will call it to get the default value. _The function may be asynchronous._

### Callback parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `value` | `any` | Value of the field. |
| `params` | `Object` | The whole received object (`ctx.params`). |
| `field` | `Object` | Field schema. |
| `id` | `any` | ID of the entity. It's `null` at entity creating. |
| `operation` | `String` | Type of operation. Available values: `create`, `update`, `replace`, `remove`. |
| `entity` | `Object` | At updating, replacing and removing, it contains the original raw (not transformed) entity. |
| `root` | `Object` | The root received object. Useful for nested object validations. |


**Example**
```js
{
    votes: { type: "number", default: 0 },
    role: { type: "string", default: async ({ ctx }) => await ctx.call("config.getDefaultRole") }
    status: { type: "boolean", default: true },
}
```

### `readonly`: \<boolean\> _(Default: `false`)_
You can make a field read-only with the `readonly: true`. In this case, the property can't be set by the user, only the service can do that. This means that you should define `default` or `set` or other operation hooks for read-only fields.

### `immutable`: \<boolean\> _(Default: `false`)_
The immutable field means that you can set the value once. It cannot be changed in the future.

**Example**
```js
{
    accountType: { type: "string", immutable: true }
}
```

### `virtual`: \<boolean\> _(Default: `false`)_
The virtual field returns a value that does not exist in the database. It's mandatory to define the `get` method that returns the value of the field.

**Example**
```js
{
    fullName: { 
        type: "string", 
        virtual: true, 
        get: ({ entity }) => `${entity.firstName} ${entity.lastName}` 
    }
}
```

### `hidden`: \<boolean|String\> _(Default: `false`)_
The hidden fields are skipped from the response during transformation.
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


### `validate`: \<Function|String\> _(Default: `null`)_
With `validate`, you can configure your custom validation function. If it is a `String`, it should be a service method name that will be called.
_It can be asynchronous._

The function should return `true` if the input value is valid or with a `String` if not valid. The returned text will be used in the `ValidationError` as the message of error.

### Callback parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `value` | `any` | Value of the field. |
| `params` | `Object` | The whole received object (`ctx.params`). |
| `field` | `Object` | Field schema. |
| `id` | `any` | ID of the entity. It's `null` at entity creating. |
| `operation` | `String` | Type of operation. Available values: `create`, `update`, `replace`, `remove`. |
| `entity` | `Object` | At updating, replacing and removing, it contains the original raw (not transformed) entity. |
| `root` | `Object` | The root received object. Useful for nested object validations. |


**Example**
```js
{
    username: { 
        type: "string", 
        validate: ({ value }) => /^[a-zA-Z0-9]+$/.test(value) || "Wrong input value"
    }
}
```

**Example with method name to check the username is unique**
```js
module.exports = {
    // ...
    settings: {
        fields: {
            username: { type: "string", validate: "validateUsername" }
        }
    },

    // ...
    methods: {
        async validateUsername({ ctx, value, operation, entity }) {
            if (operation == "create" || (entity && entity.username != value)) {
                const found = await ctx.call("users.find", { username: value });
                if (found.length > 0)
                    return `Username '${value}' is not available.`
            }
            return true;
        }
    }
};
```

### `get`: \<Function\> _(Default: `null`)_
The `get` function is called when transforming entities. With this function, you can modify an entity value before sending it back to the caller or calculate a value from other fields of the entity in virtual fields.
_It can be asynchronous._

### Callback parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `value` | `any` | Value of the field. |
| `params` | `Object` | The whole received object (`ctx.params`). |
| `field` | `Object` | Field schema. |
| `entity` | `Object` | The entity object. |

**Example**
```js
{
    creditCardNumber: { 
        type: "string", 
        // Mask the credit card number
        get: ({ value }) => value.replace(/(\d{4}-){3}/g, "****-****-****-")
    }
}
```


### `set`: \<Function\> _(Default: `null`)_
The `set` function is called when creating or updating entities. You can change the input value or calculate a new one from other values of the entity. If it is a `String`, it should be a service method name that will be called. 
_It can be asynchronous._

### Callback parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `value` | `any` | Value of the field. |
| `params` | `Object` | The whole received object (`ctx.params`). |
| `field` | `Object` | Field schema. |
| `id` | `any` | ID of the entity. It's `null` at entity creating. |
| `operation` | `String` | Type of operation. Available values: `create`, `update`, `replace`, `remove`. |
| `entity` | `Object` | At updating, replacing and removing, it contains the original raw (not transformed) entity. |
| `root` | `Object` | The root received object. Useful for nested object validations. |


**Example**
```js
{
    firstName: { type: "string", required: true },
    lastName: { type: "string", required: true },
    fullName: { 
        type: "string", 
        readonly: true, 
        set: ({ params }) => `${params.firstName} ${params.lastName}` 
    },
    email: { type: "string", set: value => value.toLowerCase() }
}
```

### `permission`: \<string\> _(Default: `null`)_
With the `permission` property, you can control who can see & change the value of the field. [Read more here.](#permissions)

### `readPermission`: \<string\> _(Default: `null`)_
With the `readPermission` property, you can control who can see the value of the field. [Read more here.](#permissions)

### `populate`: \<string|Object|Function\> _(Default: `null`)_
The populate is similar to reference in SQL-based database engines, or populate in Mongoose ORM. [Read more here.](#populating)

### `onCreate`: \<Function\> _(Default: `null`)_
This is an operations hook that is called when creating a new entity (`create` action, `createEntity` and `createEntities` methods). You can use it to set the `createdAt` timestamp for the entity.

_It can be asynchronous._

### Callback parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `value` | `any` | Value of the field. |
| `params` | `Object` | The whole received object (`ctx.params`). |
| `field` | `Object` | Field schema. |
| `id` | `any` | ID of the entity. It's `null` at entity creating. |
| `operation` | `String` | Type of operation. Available values: `create`, `update`, `replace`, `remove`. |
| `entity` | `Object` | At updating, replacing and removing, it contains the original raw (not transformed) entity. |
| `root` | `Object` | The root received object. Useful for nested object validations. |


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
        onCreate: ({ ctx }) => ctx.meta.user.id 
    }
}
```

### `onUpdate`: \<Function\> _(Default: `null`)_
This is an operations hook that is called when updating entities (`update` action, `updateEntity`). You can use it to set the `updatedAt` timestamp for entity.

_It can be asynchronous._

### Callback parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `value` | `any` | Value of the field. |
| `params` | `Object` | The whole received object (`ctx.params`). |
| `field` | `Object` | Field schema. |
| `id` | `any` | ID of the entity. It's `null` at entity creating. |
| `operation` | `String` | Type of operation. Available values: `create`, `update`, `replace`, `remove`. |
| `entity` | `Object` | At updating, replacing and removing, it contains the original raw (not transformed) entity. |
| `root` | `Object` | The root received object. Useful for nested object validations. |


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
        onUpdate: ({ ctx }) => ctx.meta.user.id 
    }
}
```

### `onReplace`: \<Function\> _(Default: `null`)_
This is an operations hook that is called when replacing entities (`replace` action, `replaceEntity`).

_It can be asynchronous._

### Callback parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `value` | `any` | Value of the field. |
| `params` | `Object` | The whole received object (`ctx.params`). |
| `field` | `Object` | Field schema. |
| `id` | `any` | ID of the entity. It's `null` at entity creating. |
| `operation` | `String` | Type of operation. Available values: `create`, `update`, `replace`, `remove`. |
| `entity` | `Object` | At updating, replacing and removing, it contains the original raw (not transformed) entity. |
| `root` | `Object` | The root received object. Useful for nested object validations. |


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
        onReplace: ({ ctx }) => ctx.meta.user.id 
    }
}
```

### `onRemove`: \<Function\> _(Default: `null`)_
This is an operations hook that is called when removing entities (`remove` action, `removeEntity`).
If you define it, the service will switch to **soft delete mode**. This means that the record won't be deleted in the table/collection. [Read more about the soft delete feature.](#soft-delete)

_It can be asynchronous._

### Callback parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `value` | `any` | Value of the field. |
| `params` | `Object` | The whole received object (`ctx.params`). |
| `field` | `Object` | Field schema. |
| `id` | `any` | ID of the entity. It's `null` at entity creating. |
| `operation` | `String` | Type of operation. Available values: `create`, `update`, `replace`, `remove`. |
| `entity` | `Object` | At updating, replacing and removing, it contains the original raw (not transformed) entity. |
| `root` | `Object` | The root received object. Useful for nested object validations. |


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
        onReplace: ({ ctx }) => ctx.meta.user.id 
    }
}
```


### Additional field properties
You can use all additional properties for validation & sanitization from the Fastest Validator rule properties like `min`, `max`, `trim`, `lowercase` ...etc.

[Check Fastest Validator documentation.](https://github.com/icebob/fastest-validator#readme)

# Actions

The service generates common CRUD actions if the `createActions` mixin option is not `false`.
You can finely control which actions should be created.

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
| `offset` | `Number` | `null` | Number of skipped rows. |
| `fields` | `String\|Array<String>` | `null` | Fields to return. |
| `sort` | `String\|Array<String>` | `null` | Sorted fields. |
| `search` | `String` | `null` | Search text. |
| `searchFields` | `String\|Array<String>` | `null` | Fields for search. |
| `collation` | `Object` | `null` | Collation settings. Passed for adapter directly. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for the query. If `false`, the default scopes are disabled. |
| `populate` | `String\|Array<String>` | `null` | Populated fields. |
| `query` | `String\|Object` | `null` | Query object. If `String`, it will be converted with `JSON.parse` |

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
_The `-` prefix with a negative sign means descending sort._
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
List entities with pagination. It returns also the total number of rows.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `page` | `Number` | `null` | Page number. |
| `pageSize` | `Number` | `null` | Size of a page. |
| `fields` | `String\|Array<String>` | `null` | Fields to return. |
| `sort` | `String\|Array<String>` | `null` | Sorted fields. |
| `search` | `String` | `null` | Search text. |
| `searchFields` | `String\|Array<String>` | `null` | Fields for search. |
| `collation` | `Object` | `null` | Collaction settings. Passed for adapter directly. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for the query. If `false`, the default scopes are disabled. |
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
The other parameter examples are the same as for the [`find`](#find-find-entities) action.

## `count` Count entities
Get the number of entities by query.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `search` | `String` | `null` | Search text. |
| `searchFields` | `String\|Array<String>` | `null` | Fields for search. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for the query. If `false`, the default scopes are disabled. |
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

The parameter examples are the same as for the [`find`](#find-find-entities) action.


## `get` Get an entity by ID
Get an entity by ID.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any` | `null` | ID of the entity. The name of the property comes from the primary key field. |
| `fields` | `String\|Array<String>` | `null` | Fields to return. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for the query. If `false`, the default scopes are disabled. |
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
If you can use another primary key field name instead of `id`, you should also use it in the action parameters.

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
The other parameter examples are the same as for the [`find`](#find-find-entities) action.


## `resolve` Get entit(ies) by ID(s)
Resolve an entity based on one or more IDs.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any\|Array<any>` | `null` | ID of the entity(ies). The name of property comes from the primary key field. |
| `fields` | `String\|Array<String>` | `null` | Fields to return. |
| `scope` | `String\|Array<String>\|Boolean` | `null` | Scopes for the query. If `false`, the default scopes are disabled. |
| `populate` | `String\|Array<String>` | `null` | Populated fields. |
| `mapping` | `boolean` | `false` | Convert the result to `Object` where the key is the ID. |
| `throwIfNotExist` | `boolean` | `false` | If `true`, the error `EntityNotFound` is thrown if the entity does not exist. |
| `reorderResult` | `boolean` | `false` | If `true` and the ID is an array, the result will be reordered according to the order of IDs. |


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
The other parameter examples are the same as for the [`find`](#find-find-entities) action.


## `create` Create an entity
Create an entity.

### Parameters
There are no special parameters. All fields are used after validation for the entity.

### REST endpoint
```js
POST /{serviceName}
```

### Results
Return the new entity.

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


## `createMany` Create multiple entities
Create multiple entities.

### Parameters
There are no special parameters. All fields are used after validation for the entities.

### REST endpoint
*Not configured.*

### Results
Return the new entities as an array.

### Examples

```js
const post = await broker.call("posts.createMany", [
    {
        title: "My first post",
        content: "Content of my first post..."
    },
    {
        title: "My second post",
        content: "Content of my second post..."
    }
]);
```

**Result**
```js
[
    {
        id: "YVdnh5oQCyEIRja0",
        title: "My first post",
        content: "Content of my first post...",
        votes: 0,
        status: true,
        createdAt: 1618077608593,
    },
    {
        id: "NLHAC39hJuISIoYp",
        title: "My second post",
        content: "Content of my second post...",
        votes: 0,
        status: true,
        createdAt: 1618077608597,
    }
]
```

## `update` Update an entity
Update an existing entity. Only the specified fields will be updated.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any` | `null` | ID of the entity. The name of property comes from the primary key field. |

There are no special parameters. All fields are used after validation for the entity.

### REST endpoint
```js
PATCH /{serviceName}/{id}
```

### Results
Return the updated entity.

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
Replace an existing entity. The difference between replace and update that replace replaces the whole entity. This means that you should specify all required entity fields. This function doesn't merge the new and old entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `<id>` | `any` | `null` | ID of entity. The name of property comes from the primary key field. |

There are no special parameters. All fields will be used after validation for the entity.

### REST endpoint
```js
PUT /{serviceName}/{id}
```

### Results
Return the replaced entity.

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
Return the ID of the deleted entity.

### Examples

```js
const post = await broker.call("posts.delete", { id: "YVdnh5oQCyEIRja0" });
```

**Result**
```js
"YVdnh5oQCyEIRja0"
```


## Custom actions
To add your own actions, simply create them under `actions` and call the built-in methods.

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

It returns an adapter instance based on the `Context`. If no adapter is found, then a new one is created. _It's only important in multi-tenant mode if a custom `getAdapterByContext` method is implemented._

## `sanitizeParams`
`sanitizeParams(params: object, opts?: object)`

Sanitize the input parameters for `find`, `list` and `count` actions.

### Options
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `removeLimit` | `Boolean` | `false` | Remove the limit & offset properties (for `count` action). |
| `list` | `Boolean` | `false` | If `true`, the `page` and `pageSize` parameters (for `list` action) are sanitized. |


## `findEntities`
`findEntities(ctx?: Context, params: object, opts?: object)`

Find entities by query. 

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for search. It's same as [`find` action parameters](#parameters) |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `streamEntities`
`streamEntities(ctx?: Context, params: object, opts?: object)`

Find entitites by query like the `findEntities` but it returns a `Stream` 

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for search. It's same as [`find` action parameters](#parameters) |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `countEntities`
`countEntities(ctx?: Context, params: object)`

Return the number of entities by query.

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for search. It's same as [`count` action parameters](#parameters-2) |


## `findEntity`
`findEntity(ctx?: Context, params: object, opts?: object)`

Find an entity by query & sort. It returns only the first row of the result.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for search. It's same as [`find` action parameters](#parameters) but only `query` and `sort` are used. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |


## `resolveEntities`
`resolveEntities(ctx?: Context, params: object, opts?: object)`

Return entity(ies) by ID(s).

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for search. It's same as [`resolve` action parameters](#parameters-4) |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |
| `opts.throwIfNotExist` | `boolean` | `false` | If `true`, the error `EntityNotFound` is thrown if the entity does not exist. |
| `opts.reorderResult` | `boolean` | `false` | If `true` and the ID is an array, the result will be reordered according to the order of IDs. |


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
| `opts.permissive` | `Boolean` | `false` | If `true`, readonly and immutable fields can be set and update and field permission is not checked. |


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
| `opts.permissive` | `Boolean` | `false` | If `true`, readonly and immutable fields can be set and update and field permission is not checked. |
| `opts.returnEntities` | `Boolean` | `false` | If `true`, it returns the inserted entities instead of IDs. |


## `updateEntity`
`updateEntity(ctx?: Context, params: object, opts?: object)`

Update an existing entity. Only the specified fields will be updated.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | It contains the entity ID and the changed field values. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.raw` | `Boolean` | `false` | If `true`, the `params` is passed directly to the database client. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |
| `opts.permissive` | `Boolean` | `false` | If `true`, readonly and immutable fields can be set and update and field permission is not checked. |
| `opts.scope` | `String|Array<String>|Boolean` | `null` |Scopes for the query. If false, the default scopes are disabled. |

It returns the updated entity.

## `updateEntities`
`updateEntities(ctx?: Context, params: object, opts?: object)`

Update multiple entities by a query. Only the specified fields will be updated.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for method. |
| `params.query` | `Object` | `null` | The query for finding entities. |
| `params.changes` | `Object` | `null` | It contains the changed field values. |
| `params.scope` | `String|Array<String>|Boolean` | `null` |Scopes for the query. If false, the default scopes are disabled. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.raw` | `Boolean` | `false` | If `true`, the `params` is passed directly to the database client. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |
| `opts.permissive` | `Boolean` | `false` | If `true`, readonly and immutable fields can be set and update and field permission is not checked. |

It returns all updated entities.

## `replaceEntity`
`replaceEntity(ctx?: Context, params: object, opts?: object)`

Replace an existing entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | It contains the entire entity that is to be replaced. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |
| `opts.permissive` | `Boolean` | `false` | If `true`, readonly and immutable fields can be set and update and field permission is not checked. |
| `opts.scope` | `String|Array<String>|Boolean` | `null` |Scopes for the query. If false, the default scopes are disabled. |

It returns the replaced entity.

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
| `opts.scope` | `String|Array<String>|Boolean` | `null` |Scopes for the query. If false, the default scopes are disabled. |
| `opts.softDelete` | `Boolean` | `null` | Disable the enabled soft-delete feature. Only `false` value is acceptable. |

The method returns only the ID of the deleted entity.

## `removeEntities`
`removeEntities(ctx?: Context, params: object, opts?: object)`

Delete multiple entities by a query.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Parameters for method. |
| `params.query` | `Object` | `null` | The query for finding entities. |
| `params.scope` | `String|Array<String>|Boolean` | `null` |Scopes for the query. If false, the default scopes are disabled. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.transform` | `Boolean` | `true` | If `false`, the result won't be transformed. |
| `opts.softDelete` | `Boolean` | `null` | Disable the enabled soft-delete feature. Only `false` value is acceptable. |

The method returns only the ID of all deleted entities.

## `clearEntities`
`clearEntities(ctx?: Context, params: object)`

Delete all entities in the table/collection. _Please note, it doesn't take into account the scopes and soft delete features._

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Not used. |


## `validateParams`
`validateParams(ctx?: Context, params: object, opts?: object)`

It validates & sanitizes the input data in `params` against the `fields` definition. It's called in the `createEntity`, `createEntities`, `updateEntity` and `replaceEntity` methods.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | `null` | Moleculer `Context` instance. It can be `null`. |
| `params` | `Object` | `null` | Values of the entity fields. |
| `opts` | `Object` | `{}` | Other options for internal methods. |
| `opts.type` | `String` | `"create"` | Type of method. |
| `opts.permissive` | `Boolean` | `false` | If `true`, readonly and immutable fields can be set and update and field permission is not checked. |
| `opts.skipOnHooks` | `Boolean` | `false` | If `true`, the `onCreate`, `onUpdate`...etc hooks of fields will be skipped. |


## `transformResult`
`transformResult(adapter: Adapter, docs: object|Array<object>, params?: object, ctx?: Context)`

It transforms the entities coming from the database according to the definitions of the `fields`.

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

It should return an `Array` with two values. The first is a cache key, the second is the adapter definition.
The service uses the cache key to store the created adapter. Therefore in the next time, if the cache key is present in the cache, the service won't create a new adapter instance but will use the previous one.

[About multi-tenant configuration, read more here](#multi-tenancy).

Please note that if you have many tenants, the service will open many connections to the database. This is not optimal and can lead to resource problems. To limit the number of connected adapters, use the `maximumAdapters` mixin options. When the number of adapters reaches this number, the service will close the oldest used adapter.

_It can be asynchronous._

## `entityChanged`
`entityChanged(type: String, data?: any, oldData?: any ctx?: Context, opts?: object)`

It's a method that is called when an entity is created, updated, replaced or removed. You can use it to clear the cache or send an event.

There is a default implementation that sends an entity change events. [Read more about it here](#events).

### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `String` | Type of changes. Available values: `create`, `update`, `replace`, `remove`, `clear`. |
| `data` | `Object\|Array<Object>` | Changed entity or entities. |
| `oldData` | `Object` | Previous entity in case of update/replace. |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `opts` | `Object` | Additional options. |
| `opts.batch` | `Boolean` | It's true when the operation has affected more entities. |
| `opts.softDelete` | `Boolean` | It's true in case of soft delete. |


## `encodeID`
`encodeID(id: any)`

You should define it when you use secure primary key to encrypt the IDs before returning them.

## `decodeID`
`decodeID(id: any)`

You should define it when you use secure primary key to decrypt the received IDs.

## `checkFieldAuthority`
`checkFieldAuthority(ctx?: Context, permission: any, params: object, field: object)`

If you use `permission` and `readPermission` in field definitions, you should define this method and write the logic for permission checking. 

_It can be asynchronous._

### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `permission` | `any` | The configured `permission` or `readPermission` value of field. |
| `params` | `Object` | Incoming data. |
| `field` | `Object` | Field definition. |


## `checkScopeAuthority`
`checkScopeAuthority(ctx?: Context, name: string, operation: string, scope: any)`

You should implement it if you want to check the authorization of scopes.

_It can be asynchronous._

### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| `ctx` | `Context` | Moleculer `Context` instance. It can be `null`. |
| `name` | `String` | Name of the scope. |
| `operation` | `String` | Type of operation. Available values: `add`, `remove`. |
| `scope` | `any` | Scope definition. |

# Scopes
The scopes allow you to add constraints for all query methods, like `find`, `list` or `count`. You can use them with soft-delete feature if you want to list only non-deleted entities.

You can define your scopes in the service settings and set the default scopes.

## Example
In this example, we'll create some scopes and show how you can use them when calling actions.

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
            // It's a custom Function to modify the query object directly. It can be async, as well.
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

**List the active posts without scope definition**
```js
const activePosts = await broker.call("posts.find");
```

**List the active & public posts**
```js
const activePublicPosts = await broker.call("posts.find", { scope: "public" });
```

**List all public posts (disabling `onlyActive` scope)**

> To disable a default scope, use the `-` (minus) prefix for scope names. You can control the authority of scopes and default scopes disabling with the [`checkScopeAuthority`](#checkscopeauthority) method.


```js
const activePublicPosts = await broker.call("posts.find", { scope: ["-onlyActive", "public"] });
```

**List all posts disabling the default scope(s)**
```js
const activePosts = await broker.call("posts.find", { scope: false });
```

You can do the same thing in REST calls:
```
GET /posts?scope=public
GET /posts?scope=-onlyActive,public
```


# Indexes
You can define the indexes in the service `settings.indexes` property. It has a common format and each adapter will process and create the indexes. Another way, if you call the `this.createIndex` method directly. [More info](#createindex)

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
The service has a [`streamEntities`](#streamentities) method that returns the entities by the query similar to the `findEntities`. But this method returns a `Stream` instance instead of all rows. 

## Action for streaming
There is no predefined action for the method, by default. But you can easily create one:

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
The document-based database engines generally handle nested objects & arrays. You can also use them in the field definitions.
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

## Example for an array with objects
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

## Storing with non-supported adapters
Mostly, the SQL-based adapters (Knex, Sequelize) can't handle this, so they convert the `object` and `array` to a JSON string and store it as a `String`. But when you get the entity, the adapter converts back to `object` and `array`. So you won't notice that it stores in different types. The only drawback is that you can't filter by properties of nested objects. 

### Example
```js
module.exports = {
    // ...
    settings: {
        fields: {
            address: {
                type: "object",
                // Set columnType to string because it will be converted to JSON string.
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
The service allows you to easily populate fields from other services. For example: If you have an `author` field in the `posts` entity, you can populate it with `users` service by the author's ID. If the field is an `Array` of IDs, it will populate all entities with only one request.

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
                        entities.map(async entity =>
                            entity.postCount = await ctx.call("posts.count", { query: { authorID: entity.id } });
                        )
                    );
                }
            }
        },

        // Default populates that are always populated
        defaultPopulates: ["author", "postCount"]
    }
    // ...
}
```

# Permissions
You can configure the readable & writable fields in the field definitions. This is useful if you want to return more fields when the logged in user is an administrator but less fields for the normal users.
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
To use the soft-delete feature, you should simply define the [`onRemove`](#onremove-function-default-null) property for a field. The service will detect this during initialization and enable this feature. Then, you can call the `remove` action or `removeEntity` method, they will not physically remove the entities but only set the value of the defined field.

Please note that you should also configure scopes to skip the deleted entities in the listing methods.

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

**List all available posts (without deleted entities)**
```js
const posts = await broker.call("posts.find");
```

**List all posts (also deleted entities)**
```js
const allPosts = await broker.call("posts.find", { scope: false });
```

As you can see, it can cause a security problem if the user can also request the deleted posts in the browser. To avoid this, you can control the authority of scopes and default scopes disabling with the [`checkScopeAuthority`](#checkscopeauthority) method.

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
         *
         * @param {Context} ctx
         * @param {String} name
         * @param {String} operation
         * @param {Object} scope
         */        
        async checkScopeAuthority(ctx, name, operation, scope) {
            // We enable default scope disabling only for administrators.
            if (operation == "remove") {
                return ctx.meta.user.roles.includes("admin");
            }

            // Enable all other scopes for everybody.
            return true;
        },  
    }
};
```

# Raw updating
The raw update is available via `updateEntity()` method with the `raw: true` option. In this case, the params are passed directly to the database client. In case of MongoDB, you can use the `$inc`, `$push`...etc modifiers.

## Example
```js
const row = await this.updateEntity(ctx, {
    id: docs.johnDoe.id,

    $set: {
        status: false,
        height: 192
    },
    $inc: {
        age: 1
    },
    $unset: {
        dob: true
    }
}, { raw: true });
```

## Expose as an action
The raw update is not available via the default `update` action because it can cause security issues. But if you know what you are doing, you can make it  available as a new `action`.

### Example
```js
// posts.service.js
module.exports = {
    name: "posts",
    mixins: [DbService(/*...*/)],

    actions: {
        updateRaw(ctx) {
            return this.updateEntity(ctx, ctx.params, { raw: true });
        }        
    }
};
```

# Caching
The service has a built-in caching mechanism. If a cacher is configured in the ServiceBroker, the service caches the responses of `find`, `list`, `get` and `resolve` actions and clears the cache if any entities have been modified.

Caching is enabled by default and uses the event name `cache.clean.{serviceName}` (e.g. `cache.clean.posts`) to delete cached entries. To disable it, set `cache.enabled = false` in [Mixin options](#mixin-options).

## Under the hood
To cache the responses, the service uses the built-in action caching mechanism of ServiceBroker. The cache clearing is a bit complicated because if you are running multiple instances of the service with a local Memory cache, you should notify the other instances when an entity has changed. To cover this, the service broadcasts a cache clearing event (e.g. `cache.clean.posts`) and also subscribes to this event. In the subscription handler, it calls the `broker.cacher.clean` method.

So if you have multiple instances of the service, and the first instance updates an entity, then it broadcasts the cache clearing event. Both instances will receive the event and both will clear the cache entries. It's simple but works with any number of instances.

## Clear cached populated data
If you use populated data in your service, it means that the service will cache data from other services.

Let's say, you have two services, `posts` and `users`. Each post entity has an `author` that points to a `user` entity. You configure `populate` for the `author` field in `posts` service, which resolves the author from the `users` service. So when you get a post with author, the cache stores the user entity inside the post entity. For example:
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
Imagine that, the author updates his name to "Mr. John Doe" in the `users` service. But when he gets the post response, he will still see his old name because the response comes the cache of the from the `posts` service. The changes happened in the `users` service, but the `posts` service doesn't know about it.

To avoid this, you should subscribe to the cache clearing events of the dependent services.

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

The service will do it for you if you define the `dependencies` of service and the `cacheCleanOnDeps` mixin option is `true`. In this case, the service subscribes to all cache clearing events of the dependencies.

### Example with dependencies
The service also subscribes to the `cache.clean.users` and `cache.clean.comments` events.
```js
module.exports = {
    name: "posts",
    mixins: [DbService(/*...*/)],
    // Define the 'users' as dependency
    dependencies: ["users", "comments"],
    /* ... */
};
```

### Example with custom cache clearing event names
Or you can add the exact event names for the subscription.
```js
module.exports = {
    name: "posts",
    mixins: [DbService({
        cacheCleanOnDeps: [
            "user.created",
            "cache.clean.comments",
            "my.some.event"
        ]
    })],
    /* ... */
};
```


# Events
The [`entityChanged`](#entitychanged) method has a default implementation that sends entity lifecycle events. You can use it to subscribe to them in other dependent services.

| Action | Method | Event | Description |
| -------- | ---- | ------- | ----------- |
| `create` | `createEntity` | `{serviceName}.created` | Sent after a new entity is created and stored in the database. |
| `createMany` | `createEntities` | `{serviceName}.created` | Sent after multiple entities have been created and stored in the database. In this case, the `opts.batch == true` |
| `update` | `updateEntity` | `{serviceName}.updated` | Sent after an entity has been updated. |
| `replace` | `replaceEntity` | `{serviceName}.replaced` | Sent after an entity has been replaced. |
| `remove` | `removeEntity` | `{serviceName}.removed` | Sent after an entity has been deleted. |
| - | `clearEntities` | `{serviceName}.cleared` | Sent after the table/collection cleared (all entities deleted). |

If you want to change it, just overwrite the [`entityChanged`](#entitychanged) method and implement your own logic.

# Cascade delete
In DBMS, you can configure `CASCADE DELETE` feature for relationships between tables. This means that when a record is deleted from the parent table, the database engine also deletes the related child records. In microservices projects and in these database services, you can't define relationships because it's a common case that some services use different database engines.

But you can use this cascade delete feature with a simple event subscription. When an entity has changed in the parent table/collection, the service broadcasts entity lifecycle events. So you can subscribe to this event in your child services and remove the relevant entities.

## Example
Let's say, you have a `users` service and a `posts` service. If a user is deleted, we should also delete the user's posts.

**users.service.js**

It's just a simple service, you don't have to set anything special.
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

Subscribe to the `users.removed` event and remove posts with `adapter.removeMany`.
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

# Service Hooks
There are some service hooks that you can use in your service under the `hooks.customs` property in the schema. The hook can be a `Function` or `String`. In the case of `String`, it should be a service method name.

## Adapter hooks

### `adapterConnected`
`adapterConnected(adapter: Adapter, hash: string, adapterOpts: object)`

It is called when a new adapter is created and connected to the database. You can use it to create data tables or execute migrations.

### `adapterDisconnected`
`adapterDisconnected(adapter: Adapter, hash: string)`

It is called when a new adapter is disconnected from the database.

**Example**
```js
// posts.service.js
{
    name: "posts",
    mixins: [DbService(/*...*/)],
    hooks: {
        customs: {
            adapterConnected: "createTables" // method name
            async adapterDisconnected(adapter, hash) {
                // ...
            }
        }
    },

    method: {
        async createTables(adapter, hash, adapterOpts) {
            // ...
        }
    }
}
```

## Entity hooks

### `afterResolveEntities`
`afterResolveEntities(ctx: Context, id: any|Array<any>, rawEntity: object|Array<object>, params: object, opts: object)`

It is called when an entity or entities resolved and before transforming and returning to the caller. You can use it to check the entity statuses or permissions against the logged-in user. 

**Example**
```js
// posts.service.js
{
    name: "posts",
    mixins: [DbService(/*...*/)],
    hooks: {
        customs: {
            async afterResolveEntities(ctx, id, rawEntity, params, opts) {
                // ...
            }
        }
    }
}
```


# Multi-tenancy
The service supports many multi-tenancy methods. But each method has a different configuration.
For each method it's mandatory that you store the tenant ID in the `ctx.meta`. The best method is to resolve the logged in user in the `authenticate` or `authorize` method of the API gateway and set the resolved user into the `ctx.meta.user`.

## Record-based tenancy
This mode uses the same database server, database and collection/table. But there is a tenant ID field in the collection/table for filtering.

### Steps for configuration
1. Create a tenant ID field in the `fields` and create a `set` method that reads the tenant ID from the `ctx.meta`.
2. Create a custom scope that filters the entities by tenant ID.
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
                set: ({ ctx }) => ctx.meta.user.tenantId
            }
        },
        scopes: {
            tenant(q, ctx, params) {
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
This mode uses the same database server, the same database but different collections/tables. It means that each tenant has its own table/collection.

### Steps for configuration
1. Define the `getAdapterByContext` method to generate adapter options for each tenant.

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
This mode uses different connection strings. It means that each tenant has its own database or server.

### Steps for configuration
1. Define the `getAdapterByContext` method to generate adapter options for each tenant.

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
The adapter is a class that performs the database operations with NPM libraries. This project contains many built-in adapters. 

If the `adapter` is not defined in the Mixin options, the service will use the NeDB adapter with memory database. It can be sufficient for testing & prototyping. It has the same API as the MongoDB client library.

>Note: The adapter connects to the database only on the first request. This means that your service will start properly even if the database server is not available. The reason for this is that the service cannot connect in multi-tenancy mode without a tenant ID.

## Knex
[Knex adapter documentation](/docs/adapters/Knex.md)

## MongoDB
[MongoDB adapter documentation](/docs/adapters/MongoDB.md)

## NeDB
[NeDB adapter documentation](/docs/adapters/NeDB.md)

## Adapter common methods

## Constructor
`constructor(opts?: object)`

The constructor has an optional `opts` parameter that is adapter-specific. Each adapter has its own options.

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
`findOne(params: object)`

Find only the first entity by `params`. The `params` contains `query` and `sort` properties.

## `findById`
`findById(id: any)`

Find an entity based on the primary key.

## `findByIds`
`findByIds(id: Array<any>)`

Find multiple entities using primary keys.

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

Insert an entity. It returns the stored entity.

## `insertMany`
`insertMany(entities: Array<object>)`

Insert multiple entities. It returns the created entity IDs.

## `updateById`
`updateById(id: any, changes: object, opts: object)`

Update an entity by ID. The `changes` contains the changed properties of the entity. It returns the updated entity.

> If the adapter supports the raw changes, you can enable it with `opts.raw = true`. In this case, the `changes` is not manipulated but passed directly to the database client.

## `updateMany`
`updateMany(query: object, changes: object, opts: object)`

Update multiple entities by query. The `changes` contains the changed properties of entity. It returns the number of updated entities.

> If the adapter supports the raw changes, you can enable it with `opts.raw = true`. In this case, the `changes` is not manipulated but passed directly to the database client.

## `replaceById`
`replaceById(id: any, entity: object)`

Replace an entity by ID. It returns the updated entity.

## `removeById`
`removeById(id: any)`

Remove an entity by ID. It returns the removed entity ID.

## `removeMany`
`removeMany(query: object)`

Remove multiple entities by `query`. It returns the number of entities removed.

## `clear`
`clear()`

Clear (truncate) the entire table/collection. It returns the number of entities removed.

## `entityToJSON`
`entityToJSON(entity: object)`

Convert data from database client to [POJO](https://masteringjs.io/tutorials/fundamentals/pojo).

## `createIndex`
`createIndex(def: any)`

Create an index on the table/collection. [Read more about the `def` parameter](#index-definition).

## `removeIndex`
`removeIndex(def: any)`

Remove an index from the table/collection. [Read more about the `def` parameter](#index-definition).




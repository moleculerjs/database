# MongoDB adapter
This adapter gives access to MongoDB databases. It uses the official [`mongodb`](https://mongodb.github.io/node-mongodb-native/) library.

## Install
This module contains the source code of the adapter. You just need to install the dependent library.

```bash
npm install mongodb@^3.6.5
```

## Usage

### Use the default localhost URI
If you not define any options, the adapter uses the `"mongodb://localhost:27017"` connection string.

```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({ 
        adapter: { type: "MongoDB" }
    })]
}
```

## With options
```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({ 
        adapter: { 
            type: "MongoDB",
            options: {
                uri: "mongodb+srv://server_name:27017/?poolSize=20",
                mongoClientOptions: {
                    useUnifiedTopology: true,
                    useNewUrlParser: true
                }
            }
        }
    })]
}
```

## Options
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `uri` | `String` | `"mongodb://localhost:27017"` | MongoDB connection URI. |
| `mongoClientOptions` | `Object` | `null` | Available options: https://docs.mongodb.com/drivers/node/current/fundamentals/connection/#connection-options |
| `dbOptions` | `Object` | `null` | Available options: http://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html#db |


## Raw update
If you want to update entity and using raw changes, use the [`updateEntity`](../README.md#updateentity) method with `{ raw: true }` options. In this case, you can use [MongoDB update operators](https://docs.mongodb.com/manual/reference/operator/update/) in the `params` parameter.

### Example
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

## Additional methods

### `stringToObjectID`
`stringToObjectID(id: any): ObjectID|any`

This method convert the `id` parameter to `ObjectID` if the `id` is `String` as a valid `ObjectID` hex string. Otherwise returns the intact `id` value.

### `objectIDToString`
`objectIDToString(id: ObjectID): String`

This method convert the `id` parameter which is an `ObjectID` to `String`.

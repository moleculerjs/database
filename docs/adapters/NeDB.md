# NeDB adapter
The NeDB adapter is the default adapter. It uses the [@seald-io/nedb](https://github.com/seald/nedb) library which is a lightweight embedded persistent or in-memory database. The [API](https://github.com/seald/nedb/blob/master/API.md) is a subset of MongoDB's API.

> Use this adapter for prototyping and testing.

## Install
This module contains the source code of the adapter. You just need to install the dependent library.

```bash
npm install @seald-io/nedb
```

## Usage

### In memory NeDB adapter
This is the default adapter, no need any configuration.

```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService()]
}
```

### Persistent database
To use a persistent database, set the filename.
```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({
        adapter: {
            type: "NeDB",
            options: "./posts.db"
        }
    })]
}
```

### Using NeDB options
```js
// posts.service.js
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({
        adapter: {
            type: "NeDB",
            options: {
                neDB: {
                    inMemoryOnly: true,
                    corruptAlertThreshold: 0.5
                }
            }
        }
    })]
}
```

### Using custom NeDB instance
```js
// posts.service.js
const DbService = require("@moleculer/database").Service;
const MyNeDB = require("...");

module.exports = {
    name: "posts",
    mixins: [DbService({
        adapter: {
            type: "NeDB",
            options: {
                neDB: new MyNeDB({ filename: "./posts.db" })
            }
        }
    })]
}
```

## Options
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `neDB` | `Object|DataStore` | `null` |  [NeDB constructor options](https://github.com/seald/nedb?tab=readme-ov-file#creatingloading-a-database). If it's a `DataStore` instance, it uses it instead of creating a new one.  |


## Raw update
If you want to update entity and using raw changes, use the [`updateEntity`](../README.md#updateentity) method with `{ raw: true }` options. In this case, you can use [NeDB modifiers](https://github.com/seald/nedb?tab=readme-ov-file#updating-documents) in the `params` parameter.

### Example
```js
const row = await this.updateEntity(ctx, {
    id: "YVdnh5oQCyEIRja0",

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
No any additional methods.

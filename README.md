![Moleculer logo](http://moleculer.services/images/banner.png)

![Integration Test](https://github.com/moleculerjs/database/workflows/Integration%20Test/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/moleculerjs/database/badge.svg?branch=master)](https://coveralls.io/github/moleculerjs/database?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/moleculerjs/database/badge.svg)](https://snyk.io/test/github/moleculerjs/database)
[![NPM version](https://badgen.net/npm/v/@moleculer/database)](https://www.npmjs.com/package/@moleculer/database)

# @moleculer/database 
Advanced Database Access Service for Moleculer microservices framework. Use it to persist your data in a database.

**This project is in work-in-progress. Be careful using it in production.**

>this module follows the *one database per service* pattern. To learn more about this design pattern and its implications check this [article](https://microservices.io/patterns/data/database-per-service.html). For *multiple entities/tables per service* approach check [FAQ](faq.html#DB-Adapters-moleculer-db).

## Features
- multiple pluggable adapters (NeDB, MongoDB, Knex)
- common CRUD actions for RESTful API with caching
- pagination, field filtering support
- field sanitizations, validations
- read-only, immutable, virtual fields
- field permissions (read/write)
- ID field encoding
- data transformation
- populating between Moleculer services
- create/update/remove hooks
- soft delete mode
- scopes support
- entity lifecycle events
- Multi-tenancy

## Install
```
npm i @moleculer/database nedb
```
> Installing `nedb` is optional. It can be good for prototyping.

## Usage

**Define the service**
```js
// posts.service.js

const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [
        DbService({
            adapter: "NeDB"
        })
    ],

    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            title: { type: "string", max: 255, trim: true, required: true },
            content: { type: "string" },
            votes: { type: "number", integer: true, min: 0, default: 0 },
            status: { type: "boolean", default: true },
            createdAt: { type: "number", readonly: true, onCreate: () => Date.now() },
            updatedAt: { type: "number", readonly: true, onUpdate: () => Date.now() }
        }
    }
}
```

**Call the actions**
```js
// sample.js

// Create a new post
let post = await broker.call("posts.create", {
    title: "My first post",
    content: "Content of my first post..."    
});
console.log("New post:", post);
/* Results:
New post: {
  id: 'Zrpjq8B1XTSywUgT',
  title: 'My first post',
  content: 'Content of my first post...',
  votes: 0,
  status: true,
  createdAt: 1618065551990
}
*/

// Get all posts
let posts = await broker.call("posts.find", { sort: "-createdAt" });
console.log("Find:", posts);

// List posts with pagination
posts = await broker.call("posts.list", { page: 1, pageSize: 10 });
console.log("List:", posts);

// Get a post by ID
post = await broker.call("posts.get", { id: post.id });
console.log("Get:", post);

// Update the post
post = await broker.call("posts.update", { id: post.id, title: "Modified post" });
console.log("Updated:", post);

// Delete a user
const res = await broker.call("posts.remove", { id: post.id });
console.log("Deleted:", res);
```

[**Try it in your browser on repl.it**](https://replit.com/@icebob/moleculer-database-common)

## Documentation
You can find [here the documentation](docs/README.md).

## Benchmark
There is some benchmark with all adapters. [You can find the results here.](benchmark/results/common/README.md)

## License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact
Copyright (c) 2022 MoleculerJS

[![@MoleculerJS](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)

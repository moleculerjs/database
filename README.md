![Moleculer logo](http://moleculer.services/images/banner.png)

![Integration Test](https://github.com/moleculerjs/database/workflows/Integration%20Test/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/moleculerjs/database/badge.svg?branch=master)](https://coveralls.io/github/moleculerjs/database?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/moleculerjs/database/badge.svg)](https://snyk.io/test/github/moleculerjs/database)
[![NPM version](https://badgen.net/npm/v/@moleculer/database)](https://www.npmjs.com/package/@moleculer/database)

# @moleculer/database 
Advanced Database Access Service for Moleculer microservices framework.

## Features
- common CRUD actions for RESTful API
- multiple pluggable adapters (NeDB (memory), MongoDB)
- field sanitizations, validations
- data transformation
- populating between Moleculer services
- field permissions (read/write)
- onCcreate/Update/Remove hooks in fields
- soft delete mode
- scopes support
- Multi-tenancy (record-based, collection/table-based, schema-based, db-based, server-based)

## Install
```
npm i database
```

## Usage


## Test
```
$ npm test
```

In development with watching

```
$ npm run ci
```

## Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact
Copyright (c) 2020 MoleculerJS

[![@MoleculerJS](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)

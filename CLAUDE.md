# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **@moleculer/database** package - an advanced database access service for the Moleculer microservices framework. It provides a mixin that adds CRUD operations, field validation, data transformation, populating, scoping, multi-tenancy, and other database features to Moleculer services.

## Key Architecture Components

### Core Structure
- **Mixin Pattern**: The service is implemented as a Moleculer mixin that other services can use
- **Multi-Adapter Support**: Supports NeDB, MongoDB, and Knex (SQL databases) adapters
- **Field-Based Schema**: Uses a comprehensive field definition system similar to Fastest Validator
- **Transformation Pipeline**: Data flows through validation → transformation → storage → retrieval → transformation

### Main Files
- `src/index.js` - Main mixin factory function with lifecycle hooks
- `src/actions.js` - Auto-generated CRUD actions (find, list, get, create, update, etc.)
- `src/methods.js` - Core database methods used by actions and custom implementations
- `src/validation.js` - Field validation and sanitization logic
- `src/transform.js` - Data transformation (encoding/decoding, populating, field filtering)
- `src/adapters/` - Database adapter implementations (base, mongodb, knex, nedb)
- `src/schema.js` - Field schema processing and validation schema generation

### Adapter Pattern
- `src/adapters/base.js` - Abstract base adapter
- `src/adapters/mongodb.js` - MongoDB adapter
- `src/adapters/knex.js` - SQL databases via Knex.js
- `src/adapters/nedb.js` - NeDB (in-memory/file-based) adapter

## Development Commands

### Testing
- `npm test` - Run all tests (unit, integration, leak detection)
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests with coverage
- `npm run test:leak` - Run memory leak detection tests
- `npm run ci:unit` - Watch mode for unit tests
- `npm run ci:integration` - Watch mode for integration tests
- `npm run ci:leak` - Watch mode for leak detection tests

### Development
- `npm run dev` - Start example service in development mode
- `npm run lint` - Run ESLint on source code, examples, and tests
- `npm run bench` - Run benchmarks
- `npm run bench:watch` - Run benchmarks in watch mode

### Maintenance
- `npm run deps` - Check and update dependencies interactively
- `npm run ci-update-deps` - Auto-update minor version dependencies

## Database Adapters

When working with database functionality, understand that:
- **NeDB** is used for development/testing (default if no adapter specified)
- **MongoDB** supports full document operations and nested field querying
- **Knex** supports SQL databases (MySQL, PostgreSQL, SQLite, etc.) but converts objects/arrays to JSON strings

## Field Definitions

The service uses a comprehensive field definition system. Each field can have:
- Basic validation properties (type, required, min, max, etc.)
- Database properties (columnName, columnType, primaryKey)
- Permission properties (readPermission, permission)
- Lifecycle hooks (onCreate, onUpdate, onRemove)
- Transformation functions (get, set, validate)
- Populate configurations for relationships

## Multi-Tenancy Support

The service supports three multi-tenancy modes:
1. **Record-based**: Same table with tenant ID field + scopes
2. **Table-based**: Different tables per tenant
3. **Database-based**: Different databases per tenant

Implement via the `getAdapterByContext` method to customize adapter creation per context.

## Testing Integration Services

When testing services that use this mixin:
- Use NeDB adapter for simple unit tests (no external dependencies)
- Use real databases for integration tests (see `test/docker-compose.yml`)
- Test both single operations and batch operations
- Test scoping, populating, and multi-tenancy if used
- Check soft delete behavior if implemented

## Common Patterns

### Service Implementation
```javascript
const DbService = require("@moleculer/database").Service;

module.exports = {
    name: "posts",
    mixins: [DbService({ adapter: "MongoDB" })],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true, columnName: "_id" },
            title: { type: "string", required: true },
            // ... more fields
        }
    }
}
```

### Custom Methods
Services often implement custom methods that use the built-in methods like `findEntities`, `createEntity`, `updateEntity`, etc.

### Adapter Connection
Adapters connect lazily on first use, supporting multi-tenancy scenarios where connection details depend on context.
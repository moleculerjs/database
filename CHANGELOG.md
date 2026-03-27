<a name="v0.4.0"></a>

# [0.4.0](https://github.com/moleculerjs/database/compare/v0.3.0...v0.4.0) (2026-03-27)

**Breaking changes**
- minimum Node.js version bumped to 22.
- add Moleculer 0.15 support (peer dependency: `^0.14.12 || ^0.15.0`).
- upgrade ESLint to 10 with flat config (`.eslintrc.js` → `eslint.config.js`).
- upgrade TypeScript to 6.
- remove `eslint-plugin-promise` (not compatible with ESLint 10).
- replace deprecated `eslint-plugin-node` with `eslint-plugin-n`.

**TypeScript**
- fix types for Moleculer 0.15 compatibility (remove `ServiceEvents`, `GenericObject` imports).
- fix `logger` type from `Loggers` namespace to `Logger` interface.
- add TypeScript type definitions (`index.d.ts`).

**Other changes**
- update all dependencies to latest versions.

<a name="v0.3.0"></a>

# [0.3.0](https://github.com/moleculerjs/database/compare/v0.2.1...v0.3.0) (2025-05-31)

- update dependencies.
- Minimum node version is 20.
- switch from `nedb` to `@seald-io/nedb` to support Node 24+.
- 
<a name="v0.2.1"></a>

# [0.2.1](https://github.com/moleculerjs/database/compare/v0.2.0...v0.2.1) (2024-07-28)

- update dependencies
- add moleculer 0.15 peer dependency

<a name="v0.2.0"></a>

# [0.2.0](https://github.com/moleculerjs/database/compare/v0.1.1...v0.2.0) (2024-04-01)

**Breaking changes**
- upgrade `knex` to 3.1.0
- upgrade `mongodb` to 6.5.0
- minimum Node version bumped to 18

<a name="v0.1.1"></a>

# [0.1.1](https://github.com/moleculerjs/database/compare/v0.1.0...v0.1.1) (2023-04-23)

- fix permission/permissive type [#31](https://github.com/moleculerjs/moleculer-channels/pull/31)
- fix TypeError `createFromHexString` [#40](https://github.com/moleculerjs/moleculer-channels/pull/40)
- fix waiting for adapter in connecting state [#2d9888e](https://github.com/moleculerjs/database/commit/2d9888e497363ac88aa3b62c354d680d53b3213b)

<a name="v0.1.0"></a>

# v0.1.0 (2022-10-02)

First public version.

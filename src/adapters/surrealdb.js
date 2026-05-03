// SurrealDB Adapter for Moleculer Database Service
// This is a basic implementation. Extend as needed for full feature support.
const BaseAdapter = require("./base");

class SurrealDBAdapter extends BaseAdapter {
    constructor(opts = {}) {
        super(opts);
        this.url = opts.url;
        this.namespace = opts.namespace;
        this.database = opts.database;
        this.username = opts.username;
        this.password = opts.password;
        this.table = opts.table;
        this.client = null;
        this.storeKey = null;
    }

    get hasNestedFieldSupport() {
        return true;
    }

    init(service) {
        super.init(service);
        if (!this.table) {
            this.table = service.name;
        }
        try {
            require("surrealdb.js");
        } catch (err) {
            this.broker.fatal(
                "The 'surrealdb.js' package is missing! Please install it with 'npm install surrealdb.js --save' command.",
                err,
                true
            );
        }
    }

    async connect() {
        if (this.client) return;
        const { Surreal } = require("surrealdb.js");
        this.client = new Surreal();
        await this.client.connect(this.url);
        await this.client.signin({
            user: this.username,
            pass: this.password
        });
        await this.client.use(this.namespace, this.database);
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
    }

    async find(params = {}) {elll
        await this.connect();
        const { query, sort, limit, offset } = params;
        let sql = `SELECT * FROM ${this.table}`;
        if (query && Object.keys(query).length > 0) {
            sql += ` WHERE ${this._buildWhere(query)}`;
        }
        if (sort) {
            sql += ` ORDER BY ${this._buildSort(sort)}`;
        }
        if (limit) {
            sql += ` LIMIT ${limit}`;
        }
        if (offset) {
            sql += ` START ${offset}`;
        }
        const res = await this.client.query(sql);
        return res[0]?.result || [];
    }

    async findOne(params = {}) {
        const res = await this.find({ ...params, limit: 1 });
        return res[0] || null;
    }

    async findById(id) {
        await this.connect();
        const sql = `SELECT * FROM ${this.table} WHERE id = $id`;
        const res = await this.client.query(sql, { id: `${this.table}:${id}` });
        return res[0]?.result?.[0] || null;
    }

    async findByIds(idList) {
        await this.connect();
        const ids = idList.map(id => `'${this.table}:${id}'`).join(", ");
        const sql = `SELECT * FROM ${this.table} WHERE id IN [${ids}]`;
        const res = await this.client.query(sql);
        return res[0]?.result || [];
    }

    async findStream(params = {}) {
        // SurrealDB does not support streaming, fallback to array
        return this.find(params);
    }

    async count(params = {}) {
        await this.connect();
        const { query } = params;
        let sql = `SELECT count() AS count FROM ${this.table}`;
        if (query && Object.keys(query).length > 0) {
            sql += ` WHERE ${this._buildWhere(query)}`;
        }
        const res = await this.client.query(sql);
        return res[0]?.result?.[0]?.count || 0;
    }

    async insert(entity) {
        await this.connect();
        const res = await this.client.create(this.table, entity);
        return Array.isArray(res) ? res[0] : res;
    }

    async insertMany(entities, opts = {}) {
        await this.connect();
        const res = await this.client.create(this.table, entities);
        return opts.returnEntities ? res : res.map(e => e.id);
    }

    async updateById(id, changes, opts = {}) {
        await this.connect();
        const res = await this.client.merge(`${this.table}:${id}`, changes);
        return Array.isArray(res) ? res[0] : res;
    }

    async updateMany(query, changes, opts = {}) {
        await this.connect();
        let sql = `UPDATE ${this.table} SET ${this._buildSet(changes)}`;
        if (query && Object.keys(query).length > 0) {
            sql += ` WHERE ${this._buildWhere(query)}`;
        }
        const res = await this.client.query(sql);
        // SurrealDB returns updated records
        return res[0]?.result?.length || 0;
    }

    async replaceById(id, entity) {
        await this.connect();
        const res = await this.client.update(`${this.table}:${id}`, entity);
        return Array.isArray(res) ? res[0] : res;
    }

    async removeById(id) {
        await this.connect();
        await this.client.delete(`${this.table}:${id}`);
        return id;
    }

    async removeMany(query) {
        await this.connect();
        let sql = `DELETE FROM ${this.table}`;
        if (query && Object.keys(query).length > 0) {
            sql += ` WHERE ${this._buildWhere(query)}`;
        }
        const res = await this.client.query(sql);
        // SurrealDB returns deleted records
        return res[0]?.result?.length || 0;
    }

    async clear() {
        await this.connect();
        const sql = `DELETE FROM ${this.table}`;
        const res = await this.client.query(sql);
        return res[0]?.result?.length || 0;
    }

    entityToJSON(entity) {
        if (entity && entity.id && typeof entity.id === "string" && entity.id.startsWith(this.table + ":")) {
            return { ...entity, id: entity.id.split(":")[1] };
        }
        return entity;
    }

    // --- Helpers ---
    _buildWhere(query) {
        // Simple translation: {a:1, b:2} => "a = 1 AND b = 2"
        return Object.entries(query)
            .map(([k, v]) => {
                if (Array.isArray(v)) return `${k} IN [${v.map(x => JSON.stringify(x)).join(", ")}]`;
                if (typeof v === "string") return `${k} = '${v}'`;
                return `${k} = ${JSON.stringify(v)}`;
            })
            .join(" AND ");
    }

    _buildSort(sort) {
        if (typeof sort === "string") return sort;
        if (Array.isArray(sort)) return sort.join(", ");
        if (typeof sort === "object") return Object.entries(sort).map(([k, v]) => v === -1 ? `${k} DESC` : k).join(", ");
        return "";
    }

    _buildSet(changes) {
        return Object.entries(changes)
            .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
            .join(", ");
    }

    async createIndex(def) {
        // SurrealDB does not support traditional indexes via SQL, so this is a no-op
        return Promise.resolve();
    }

    async removeIndex(def) {
        // SurrealDB does not support traditional indexes via SQL, so this is a no-op
        return Promise.resolve();
    }
}

module.exports = SurrealDBAdapter;

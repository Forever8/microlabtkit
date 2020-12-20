const { Client, Pool } = require('pg');
const schema = require('./helpers/schema');
const sington = Symbol('sington-instance');

module.exports = class Postgres {
    constructor(options) {
        const result = schema.postgres.validate(options);
        if (result.error) throw result.error;
        this.options = options;
        this.connectionStrings = [];
        if (!Postgres[sington]) {
            Postgres[sington] = {};
        }
    }

    async setupAndImport() {
        const { username, password, host, data } = this.options;
        const builtInPostgres = `postgres://${username}:${password}@${host}/postgres`;
        const builtInClient = new Client({ connectionString: builtInPostgres });
        await Promise.all(Object.keys(data).map(db => builtInClient.query(`CREATE TABLE ${db};`)));
        await builtInClient.end();

        for (const [db, tables] of Object.entries(data)) {
            const connectionString = `postgres://${username}:${password}@${host}/${db}`;
            const client = new Pool({ connectionString });
            this.connectionStrings.push(connectionString);
            Postgres[sington][connectionString] = client;
            for (const [table, rows] of Object.entries(tables)) {
                const values = rows.map(row => `(${JSON.stringify(row)})`).join(',');
                await client.query(`DROP TABLE ${table} IF EXISTS;`);
                await client.query(`CREATE TABLE ${table} (data jsonb);`);
                await client.query(`INSERT INTO ${table} VALUES ${values};`);
            }
        }
    }

    clean() {
        for (const connectionString of this.connectionStrings) {
            Postgres[sington][connectionString].end();
            Reflect.deleteProperty(Postgres[sington], connectionString);
        }
        this.connectionStrings = [];
    }
};

const { Client } = require('@elastic/elasticsearch');
const schema = require('./helpers/schema');
const sington = Symbol('sington-instance');

module.exports = class Elastic {
    constructor(options) {
        const result = schema.elastic.validate(options);
        if (result.error) throw result.error;
        this.options = options;
        if (!Elastic[sington]) {
            Elastic[sington] = {};
        }
    }

    async setupAndImport() {
        const { host, settings, mappings, data } = this.options;
        const client = new Client({ node: host });
        Elastic[sington][host] = client;
        for (const index in data) {
            await client.indices.create({
                index,
                body: {
                    settings: settings[index],
                    mappings: mappings[index]
                }
            });

            const dataset = data[index];
            const body = dataset.map(doc => [{ index: { _index: index } }, doc]);
            await client.bulk({
                index,
                body
            });
        }
    }

    clean() {
        Reflect.deleteProperty(Elastic[sington], this.options.host);
    }
};

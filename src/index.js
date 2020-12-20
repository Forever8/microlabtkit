const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const Elastic = require('./elastic');
const Postgres = require('./postgres');

chai.should();

module.exports = class MicroLabKit {
    constructor() {
        this.proxyquire = proxyquire;
        this.sinon = sinon;
    }

    async startupElastic(options) {
        this.elastic = new Elastic(options);
        await this.elastic.setupAndImport();
    }

    async startupPostgres(options) {
        this.postgres = new Postgres(options);
        await this.postgres.setupAndImport();
    }

    clean() {
        this.elastic && this.elastic.clean();
        this.postgres && this.postgres.clean();
    }
};

const Joi = require('joi');

module.exports = {
    elastic: Joi.object().keys({
        host: Joi.string().required().description('host is required to connect es server.'),
        settings: Joi.object(),
        mappings: Joi.object(),
        data: Joi.object()
    }).unknown(true),
    postgres: Joi.object.keys({
        host: Joi.string().required().description('host is required to connect pg server.'),
        username: Joi.string().required().description('username is required to connect pg server.'),
        password: Joi.string().required().description('password is required to connect pg server.'),
        data: Joi.object()
    })
};

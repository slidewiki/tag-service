'use strict';

/*
Example of an model validation with ajv.
*/

//require
let Ajv = require('ajv');
let ajv = Ajv({
    verbose: true
}); // options can be passed, e.g. {allErrors: true}

//build schema
const tag = {
    type: 'object',
    properties: {
        _id: {
            type: 'number'
        },
        tagName: {
            type: 'string'
        },
        defaultName: {
            type: 'string'
        },
        uri: {
            type: 'string'
        },
        user: {
            type: 'number'
        },
        timestamp: {
            type: 'string'
        }
    },
    required: ['user']
};

module.exports = ajv.compile(tag);

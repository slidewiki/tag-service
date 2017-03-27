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
        name: {
            type: 'string'
        },
        uri: {
            type: 'string'
        },
        userId: {
            type: 'number'
        },
        timestamp: {
            type: 'string'
        }
    },
    required: ['tagName']
};

module.exports = ajv.compile(tag);

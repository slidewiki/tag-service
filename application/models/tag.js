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
        kind: {
            type: 'string',
            enum: ['tag', 'NLP', 'annotation']
        },
        uri: {
            type: 'string'
        },
        userId: {
            type: 'number'
        },
        timestamp: {
            type: 'string',
            format: 'datetime'
        }
    },
    required: ['tagName', 'kind']
};

module.exports = ajv.compile(tag);

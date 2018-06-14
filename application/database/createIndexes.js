'use strict';

const helper = require('./helper');

// this function should include commands that create indexes (if any)
// for any collections that the service may be using

// it should always return a promise
module.exports = function() {

    return helper.getCollection('tags').then((decks) => {
        return decks.createIndexes([
            { key: { 'tagName': 1 }, unique: true },
            { key: { 'defaultName': 1 } },
        ]);
    });

};

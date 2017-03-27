/*
Controller for handling mongodb and the data model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper'),
    tagModel = require('../models/tag.js'),
    co = require('../common');

function get(tagName) {
    return helper.connectToDatabase()
        .then((db) => db.collection('tags'))
        .then((col) => col.findOne({
            tagName: tagName
        }));
}

function insert(tag) {
    return helper.connectToDatabase()
        .then((db) => helper.getNextIncrementationValueForCollection(db, 'tags'))
        .then((newId) => {
            return helper.connectToDatabase()
                .then((db2) => db2.collection('tags'))
                .then((col) => {
                    let valid = false;
                    try {
                        valid = tagModel(tag);
                        if (!valid) {
                            return tagModel.errors;
                        }

                        // set new incremental id
                        tag._id = newId;

                        // set timestamp
                        tag.timestamp = (new Date()).toISOString();

                        // insert tag if there is no other with the same tag-name
                        return col.update(
                            { tagName: tag.tagName },
                            { $setOnInsert: tag },
                            { upsert: true }
                        ).then( () => {     // return existing or newly inserted tag
                            return get(tag.tagName);
                        });
                    } catch (e) {
                        console.log('validation failed', e);
                    }
                    return;
                });
        });
}

function replace(tagName, tag) {
    return helper.connectToDatabase()
        .then((db) => db.collection('tags'))
        .then((col) => {
            let valid = false;
            try {
                valid = tagModel(tag);
                if (!valid) {
                    return tagModel.errors;
                }
                // set timestamp
                tag.timestamp = (new Date()).toISOString();

                return col.findOneAndReplace({
                    tagName: tagName
                }, tag);
            } catch (e) {
                console.log('validation failed', e);
            }
            return;
        });
}

function bulkUpload(tags, user){
    try {
        let promises = [];

        tags.forEach( (newTag) => {
            newTag.user = user;
            promises.push(insert(newTag));
        });

        return Promise.all(promises);
    } catch (e) {
        console.log('validation failed', e);
    }
    return;
}

function suggest(q, limit){

    let query = {tagName: new RegExp('^' + co.escape(q), 'i')};
    let projection = {
        _id: 0,
        tagName: 1,
        name: 1,
        uri: 1,
    };
    return helper.connectToDatabase()
    .then((db) => db.collection('tags'))
    .then((col) => col.find(query, projection)
                        .skip(0)    // offeset
                        .limit(parseInt(limit)))
    .then((cursor) => cursor.toArray());

}

module.exports = { get, insert, replace, bulkUpload, suggest };

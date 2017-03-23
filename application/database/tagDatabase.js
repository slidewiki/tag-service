/*
Controller for handling mongodb and the data model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper'),
    tagModel = require('../models/tag.js');

function get(tagName) {
    return helper.connectToDatabase()
        .then((db) => db.collection('tags'))
        .then((col) => col.findOne({
            tagName: tagName
        }));
}

function insert(tag) {
    return helper.connectToDatabase()
        .then((db2) => db2.collection('tags'))
        .then((col) => {
            let valid = false;
            try {
                valid = tagModel(tag);
                if (!valid) {
                    return tagModel.errors;
                }

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
                return col.findOneAndReplace({
                    tagName: tagName
                }, tag);
            } catch (e) {
                console.log('validation failed', e);
            }
            return;
        });
}

function bulkUpload(tags){
    try {
        let promises = [];

        tags.forEach( (newTag) => {
            promises.push(insert(newTag));
        });

        return Promise.all(promises);
    } catch (e) {
        console.log('validation failed', e);
    }
    return;
}

function suggest(q, offset, limit){

    let query = {tagName: new RegExp(q, 'i')};

    return helper.connectToDatabase()
    .then((db) => db.collection('tags'))
    .then((col) => col.find(query).skip(parseInt(offset)).limit(parseInt(limit)))
    .then((cursor) => cursor.toArray());

}

module.exports = { get, insert, replace, bulkUpload, suggest };

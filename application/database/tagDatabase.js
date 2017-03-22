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
        .then((db) => helper.getNextIncrementationValueForCollection(db, 'tags'))
        .then((newId) => {
            // console.log('newId', newId);
            return helper.connectToDatabase() //db connection have to be accessed again in order to work with more than one collection
                .then((db2) => db2.collection('tags'))
                .then((col) => {
                    let valid = false;
                    tag._id = newId;
                    try {
                        valid = tagModel(tag);
                        if (!valid) {
                            return tagModel.errors;
                        }
                        return col.insertOne(tag);
                    } catch (e) {
                        console.log('validation failed', e);
                    }
                    return;
                }); //id is created and concatinated automatically
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


module.exports = { get, insert, replace };

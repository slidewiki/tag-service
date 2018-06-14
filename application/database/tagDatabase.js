/*
Controller for handling mongodb and the data model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper'),
    tagModel = require('../models/tag.js'),
    co = require('../common');

const slugify = require('slugify');

function getTagsCollection(){
    return helper.connectToDatabase()
        .then((db) => db.collection('tags'));
}

function getNextId(){
    return helper.connectToDatabase()
        .then((db) => helper.getNextIncrementationValueForCollection(db, 'tags'));
}

function get(tagName) {
    return getTagsCollection()
        .then((col) => col.findOne({
            tagName: tagName
        }))
        .then((tag) => fillDefaultName(tag));
}

function getAllMatches(tagName){
    let query = {tagName: new RegExp(`^${tagName}$|^${tagName}-\\d+$`)};
    let projection = {
        tagName: 1,
        defaultName: 1,
    };
    return getTagsCollection()
        .then((col) => col.find(query, projection))
        .then((cursor) => cursor.toArray());
}

function insert(tag) {
    return getNextId().then((newId) => {
        return getTagsCollection().then((col) => {
            let valid = false;

            valid = tagModel(tag);
            if (!valid) {
                throw new Error('Validation error');
            }

            // set new incremental id
            tag._id = newId;

            // set timestamp
            tag.timestamp = (new Date()).toISOString();

            return col.insertOne(tag);
        });
    });
}

function newTag(newTag){
    // generate a slug from the new tag's default name
    let candidateTagName = slugify(newTag.defaultName).toLowerCase();

    // get all matches containing the candidate slug name
    return self.getAllMatches(candidateTagName).then( (existingTagNames) => {
        newTag.tagName = candidateTagName;

        // get tagName numbers of matching tagNames found
        let tagNumbers = existingTagNames.map( (t) => {
            return (t.tagName !== candidateTagName)
                ? parseInt(t.tagName.substring(candidateTagName.length + 1)): 0;
        });

        if(tagNumbers.length > 0){
            // set new tagName by concatenating a number to the slug
            let maxNumber = Math.max(...tagNumbers);
            newTag.tagName = `${candidateTagName}-${maxNumber+1}`;
        }

        return self.insert(newTag).then((inserted) => {
            return inserted.ops[0];
        });
        // catch and check here for err.code === 11000 (duplicate key) and call self
    });
}

function replace(tagName, tag) {
    return getTagsCollection()
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

function suggest(q, limit){

    let query = { $or: [
        { defaultName: new RegExp('^' + co.escape(q), 'i') },
        { defaultName: { $exists: false}, tagName: new RegExp('^' + co.escape(q), 'i') },
    ]};
    let projection = {
        _id: 0,
        tagName: 1,
        defaultName: 1,
        // uri: 1,
    };
    return getTagsCollection()
        .then((col) => col.find(query, projection)
            .skip(0)    // offset
            .limit(parseInt(limit)))
        .then((cursor) => cursor.toArray())
        .then((result) => result.map(fillDefaultName));

}

let self = module.exports = { get, getAllMatches, insert, newTag, replace, suggest };


function fillDefaultName(tag)  {
    if (!tag) return tag;

    tag.defaultName = tag.defaultName || tag.tagName;
    return tag;
}

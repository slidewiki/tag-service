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
            if (!tagModel(tag)) {
                throw new Error(JSON.stringify(tagModel.errors));
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
    return getTagsCollection().then((col) => {
        // set the tagName (immutable)
        tag.tagName = tagName;
        // set timestamp
        tag.timestamp = (new Date()).toISOString();

        if (!tagModel(tag)) {
            throw new Error(JSON.stringify(tagModel.errors));
        }

        return col.findOneAndReplace({ tagName }, tag).then((result) => result.value);
    });
}

function suggest({ q, limit, tagType }) {
    if (!q) return Promise.resolve([]);

    let query = { $or: [
        { defaultName: new RegExp('^' + co.escape(q), 'i') },
        { defaultName: { $exists: false}, tagName: new RegExp('^' + co.escape(q), 'i') },
    ]};

    if (!tagType) {
        query.tagType = null;
    } else if (tagType !== 'any') {
        query.tagType = tagType;
    }

    let projection = {
        _id: 0,
        tagType: 1,
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

function list(query, options) {
    // sort stage
    let sortStage = {};
    if (options.sort === 'tagName') {
        sortStage = { tagName: 1 };
    } else if(options.sort === 'defaultName') {
        sortStage = { defaultName: 1 };
    } else if(options.sort === 'timestamp') {
        sortStage = { timestamp: -1 };
    } else {
        sortStage = { _id: 1 };
    }

    return getTagsCollection().then((tags) => {
        let pipeline = [
            { $match: query },
            {
                $project: {
                    user: 1,
                    tagType: 1,
                    tagName: 1,
                    defaultName: 1,
                    timestamp: 1
                },
            },
        ];

        // just count the result set
        if (options.countOnly) {
            pipeline.push({ $count: 'totalCount' });
        } else {
            // add sorting
            pipeline.push({ $sort: sortStage });

            // some routes don't support pagination
            if (options.pageSize) {
                pipeline.push({ $skip: (options.page - 1) * options.pageSize });
                pipeline.push({ $limit: options.pageSize });
            }
        }

        return tags.aggregate(pipeline);

    }).then( (result) => result.toArray());
}

let self = module.exports = { get, getAllMatches, insert, newTag, replace, suggest, list };

function fillDefaultName(tag)  {
    if (!tag) return tag;

    tag.defaultName = tag.defaultName || tag.tagName;
    return tag;
}

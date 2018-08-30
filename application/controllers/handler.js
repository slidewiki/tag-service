/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/
/* eslint promise/always-return: "off" */

'use strict';

const _ = require('lodash');

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    tagDB = require('../database/tagDatabase'), //Database functions specific for tags
    co = require('../common');
const async = require('async');
const slugify = require('slugify');
const querystring = require('querystring');

module.exports = {
    // get a tag by tag-name
    getTag: function(request, reply) {
        tagDB.get(request.params.tagName).then((tag) => {
            if (co.isEmpty(tag)){
                reply(boom.notFound());
            }
            else{
                reply(co.rewriteID(tag));
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    // create a new tag
    newTag: function(request, reply) {
        let newTag = request.payload;

        // if tag has property tagName, then return the stored tag
        if(newTag.hasOwnProperty('tagName')){
            tagDB.get(newTag.tagName).then ( (existingTag) => {
                if(!co.isEmpty(existingTag)){
                    reply(co.rewriteID(existingTag));
                } else {
                    reply(boom.notFound());
                }
            }).catch( (error) => {
                request.log('error', error);
                reply(boom.badImplementation());
            });
        } else {
            tagDB.newTag(newTag).then( (inserted) => {
                reply(co.rewriteID(inserted));
            }).catch( (err) => {
                request.log('error', err);
                reply(boom.badImplementation());
            });
        }
    },

    // replace an existing tag
    replaceTag: function(request, reply) {
        tagDB.replace(request.params.tagName, request.payload).then((replaced) => {
            if (co.isEmpty(replaced.value)){
                reply(boom.notFound());
            }
            else{
                reply(co.rewriteID(replaced.value));
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    // bulk upload tags
    bulkUpload: function(request, reply){
        let newTags = request.payload.tags.map( (t) => {
            t.user = request.payload.user;
            return t;
        });

        let tagsInserted = [];

        async.eachSeries(newTags, (newTag, callback) => {

            // if tag has property tagName, then return the stored tag
            if(newTag.hasOwnProperty('tagName')){
                let tagName = slugify(newTag.tagName).toLowerCase();
                tagDB.get(tagName).then ( (existingTag) => {
                    if(!co.isEmpty(existingTag)){
                        tagsInserted.push(co.rewriteID(existingTag));
                        callback();
                    } else {
                        // it is not stored already, let's save it
                        if (!newTag.hasOwnProperty('defaultName')) {
                            newTag.defaultName = newTag.tagName;
                        }
                        // use the slug for tagName
                        newTag.tagName = tagName;

                        return tagDB.insert(newTag).then((inserted) => inserted.ops[0]).then((inserted) => {
                            tagsInserted.push(co.rewriteID(inserted));
                            callback();
                        }).catch( (err) => {
                            callback(err);
                        });
                    }
                }).catch( (err) => {
                    callback(err);
                });
            } else {
                tagDB.newTag(newTag).then( (inserted) => {
                    tagsInserted.push(co.rewriteID(inserted));
                    callback();
                }).catch( (err) => {
                    callback(err);
                });
            }
        }, (err) => {
            if (err) {
                request.log('error', err);
                return reply(boom.badImplementation());
            }

            reply(tagsInserted);
        });
    },

    // suggest tags for aucomplete
    suggest: function(request, reply) {
        tagDB.suggest(request.params.q, request.query).then((results) => {
            reply(results);
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    listTags: function(request, reply) {
        let options = _.pick(request.query, 'sort', 'page', 'pageSize');
        let query = _.pick(request.query, 'user', 'tagType');
        if (_.size(request.query.tagName)) {
            query.tagName = { $in: request.query.tagName };
        }

        return countAndList(query, options).then((response) => {
            reply(response);
        }).catch((err) => {
            if (err.isBoom) return reply(err);
            request.log('error', err);
            reply(boom.badImplementation());
        });

    },

};

function countAndList(query, options){
    options.countOnly = true;
    return tagDB.list(query, options).then( (result) => {

        delete options.countOnly;
        let totalCount = (result.length === 0) ? 0 : result[0].totalCount;

        return tagDB.list(query, options).then((items) => {
            if (!options.pageSize) {
                return items;
            }

            // form links for previous and next results
            let links = {};
            let page = options.page;

            if (options.page > 1){
                options.page = page - 1;
                links.previous = `/tags?${querystring.stringify(options)}`;
            }

            if(options.page * options.pageSize < totalCount){
                options.page = page + 1;
                links.next = `/tags?${querystring.stringify(options)}`;
            }

            let response = {};
            response._meta = {
                page: page, 
                pageSize: options.pageSize,
                totalCount: totalCount,
                sort: options.sort,
                links: links
            };
            response.items = items;
            return response;
        });
    });
}

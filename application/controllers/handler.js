/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    tagDB = require('../database/tagDatabase'), //Database functions specific for tags
    co = require('../common');

module.exports = {
    // get a tag by tag-name
    getTag: function(request, reply) {
        tagDB.get(request.params.tagName).then((tag) => {
            if (co.isEmpty(tag)){
                reply(boom.notFound());
            }
            else{
                reply(tag);
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    // create a new tag
    newTag: function(request, reply) {

        tagDB.insert(request.payload).then((inserted) => {
            if (co.isEmpty(inserted)){
                throw inserted;
            }
            else{
                reply(inserted);
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    // replace an existing tag
    replaceTag: function(request, reply) {
        tagDB.replace(request.params.tagName, request.payload).then((replaced) => {
            if (co.isEmpty(replaced.value)){
                reply(boom.notFound());
            }
            else{
                reply(replaced.value);
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    // bulk upload tags
    bulkUpload: function(request, reply){
        tagDB.bulkUpload(request.payload).then((inserted) => {
            if (co.isEmpty(inserted)){
                throw inserted;
            }
            else{
                reply(inserted);
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    // suggest tags for aucomplete
    suggest: function(request, reply) {
        tagDB.suggest(request.params.q, request.query.offset, request.query.limit).then((results) => {
            if (co.isEmpty(results)){
                reply(boom.notFound());
            }
            else{
                reply(results);
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },
};

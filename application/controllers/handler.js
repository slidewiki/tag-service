/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    tagDB = require('../database/tagDatabase'), //Database functions specific for tags
    co = require('../common');

module.exports = {
    //Get slide from database or return NOT FOUND
    getTag: function(request, reply) {
        tagDB.get(encodeURIComponent(request.params.id)).then((slide) => {
            if (co.isEmpty(slide))
                reply(boom.notFound());
            else
                reply(co.rewriteID(slide));
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    //Create Slide with new id and payload or return INTERNAL_SERVER_ERROR
    newSlide: function(request, reply) {
        tagDB.insert(request.payload).then((inserted) => {
            if (co.isEmpty(inserted.ops[0]))
                throw inserted;
            else
                reply(co.rewriteID(inserted.ops[0]));
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    //Update Slide with id id and payload or return INTERNAL_SERVER_ERROR
    replaceSlide: function(request, reply) {
        tagDB.replace(encodeURIComponent(request.params.id), request.payload).then((replaced) => {
            if (co.isEmpty(replaced.value))
                throw replaced;
            else
                reply(replaced.value);
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },
};

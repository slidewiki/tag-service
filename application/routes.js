/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
    handlers = require('./controllers/handler');

module.exports = function(server) {
    
    server.route({
        method: 'GET',
        path: '/tag/{tagName}',
        handler: handlers.getTag,
        config: {
            validate: {
                params: {
                    tagName: Joi.string().alphanum().lowercase()
                },
            },
            tags: ['api'],
            description: 'Get a tag'
        }
    });

    //Create new slide (by payload) and return it (...). Validate payload
    server.route({
        method: 'POST',
        path: '/tag/new',
        handler: handlers.newTag,
        config: {
            validate: {
                payload: Joi.object().keys({
                    tagName: Joi.string().alphanum().lowercase(),
                    name: Joi.string().alphanum().lowercase(),
                    kind: Joi.string(),
                    uri: Joi.string(),
                    userId: Joi.string(),
                }).requiredKeys('tagName', 'kind'),
            },
            tags: ['api'],
            description: 'Create a new tag'
        }
    });

    //Update slide with id id (by payload) and return it (...). Validate payload
    server.route({
        method: 'PUT',
        path: '/tag/{tagName}',
        handler: handlers.replaceTag,
        config: {
            validate: {
                params: {
                    tagName: Joi.string().alphanum().lowercase()
                },
                payload: Joi.object().keys({
                    name: Joi.string().alphanum().lowercase(),
                    kind: Joi.string(),
                    uri: Joi.string(),
                    userId: Joi.string(),
                }),
            },
            tags: ['api'],
            description: 'Replace a tag'
        }
    });
};

/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
    handlers = require('./controllers/handler');

const apiModels = {};
apiModels.tag = Joi.object().keys({
    tagType: Joi.string().valid('topic'),
    tagName: Joi.string(),
    defaultName: Joi.string(),
    uri: Joi.string(),
    user: Joi.number().integer(),
});

module.exports = function(server) {

    // get a list of tags
    server.route({
        method: 'GET',
        path: '/tags',
        handler: handlers.listTags,
        config: {
            validate: {
                query: {
                    user: Joi.number().integer().description('Return only tags owned by user with set id'),
                    tagType: Joi.string().valid('topic', 'any').description('Filter by tagType'),
                    tagName: Joi.array().items(Joi.string()).single().description('Filter by tagName'),
                    sort: Joi.string().valid('id', 'tagName', 'defaultName', 'timestamp').default('tagName'),
                    page: Joi.number().integer().positive().default(1).description('Page number'),
                    pageSize: Joi.number().integer().positive().default(10).description('Number of items per page'),
                    paging: Joi.boolean().truthy('1').falsy('0').default(true).description('Return tags using pages, otherwise all tags directly'),
                },
            },
            tags: ['api'],
            description: 'Retrieve tags metadata with optional filter, sorting, and paging parameters',
        }
    });

    // get a tag by tag-name
    server.route({
        method: 'GET',
        path: '/tag/{tagName}',
        handler: handlers.getTag,
        config: {
            validate: {
                params: {
                    tagName: Joi.string(),
                },
            },
            tags: ['api'],
            description: 'Get a tag by tag-name'
        }
    });

    // create a new tag if not existing else return the existing one
    server.route({
        method: 'POST',
        path: '/tag/new',
        handler: handlers.newTag,
        config: {
            validate: {
                payload: apiModels.tag.or('defaultName', 'tagName')
            },
            tags: ['api'],
            description: 'Create a new tag'
        }
    });

    // update an existing tag with a new one
    server.route({
        method: 'PUT',
        path: '/tag/{tagName}',
        handler: handlers.replaceTag,
        config: {
            validate: {
                params: {
                    tagName: Joi.string(),
                },
                payload: Joi.object().keys({
                    tagType: Joi.string().valid('topic'),
                    defaultName: Joi.string(),
                    uri: Joi.string(),
                    user: Joi.number().integer(),
                }).requiredKeys('defaultName', 'user'),
            },
            tags: ['api'],
            description: 'Replace a tag'
        }
    });


    // bulk upload tags
    server.route({
        method: 'POST',
        path: '/tag/upload',
        handler: handlers.bulkUpload,
        config: {
            validate: {
                payload: Joi.object().keys({
                    user: Joi.number().integer(),
                    tags: Joi.array().items(apiModels.tag.or('defaultName', 'tagName'))
                }).requiredKeys('user', 'tags'),
            },
            tags: ['api'],
            description: 'Bulk upload tags'
        }
    });

    // suggest tags for autocomplete
    server.route({
        method: 'GET',
        path: '/tag/suggest',
        handler: handlers.suggest,
        config: {
            validate: {
                query: {
                    q: Joi.string().empty('').allow(''),
                    limit: Joi.string().regex(/^[0-9]+$/).default(5),
                    tagType: Joi.string().valid('topic', 'any'),
                }
            },
            tags: ['api'],
            description: 'Suggest tags for autocomplete'
        }
    });
};

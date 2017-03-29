/* eslint dot-notation: 0, no-unused-vars: 0 */
'use strict';

//Mocking is missing completely TODO add mocked objects

describe('REST API', () => {

    let server;

    beforeEach((done) => {
        //Clean everything up before doing new tests
        Object.keys(require.cache).forEach((key) => delete require.cache[key]);
        require('chai').should();
        let hapi = require('hapi');
        server = new hapi.Server();
        server.connection({
            host: 'localhost',
            port: 4000
        });
        require('../routes.js')(server);
        done();
    });

    let tag = {
        tagName: 'dummy',
        name: 'Dummy',
        uri: 'http://dbpedia.org',
        user: 1
    };

    let newTags = [
        {
            tagName: 'dummy2',
            name: 'Dummy1',
            uri: 'http://dbpedia.org',
            user: 1
        },
        {
            tagName: 'dummy3',
            name: 'Dummy2',
            uri: 'http://dbpedia.org',
            user: 2
        }
    ];

    let options = {
        method: 'POST',
        url: '/tag/new',
        payload: tag,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    let options2 = {
        method: 'GET',
        url: '/tag/',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    let options3 = {
        method: 'GET',
        url: '/suggest/',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    let options4 = {
        method: 'POST',
        url: '/tag/upload',
        payload: {
            user: 1,
            tags: newTags
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };

    context('when creating a tag it', () => {
        it('should reply it', (done) => {
            server.inject(options, (response) => {
                response.should.be.an('object').and.contain.keys('statusCode','payload');
                response.statusCode.should.equal(200);
                response.payload.should.be.a('string');
                let payload = JSON.parse(response.payload);
                payload.should.be.an('object').and.contain.keys('id', 'tagName', 'name', 'uri', 'user', 'timestamp');
                payload.tagName.should.equal('dummy');
                payload.name.should.equal('Dummy');
                payload.uri.should.equal('http://dbpedia.org');
                payload.user.should.equal(1);
                done();
            });
        });
    });

    context('when bulk uploading tags', () => {
        it('should reply them', (done) => {
            server.inject(options4, (response) => {
                response.should.be.an('object').and.contain.keys('statusCode','payload');
                response.statusCode.should.equal(200);
                let payload = JSON.parse(response.payload);
                payload.should.be.an('array');
                payload.forEach( (tag) => {
                    tag.should.be.an('object').and.contain.keys('id', 'tagName', 'name', 'uri', 'user', 'timestamp');
                });
                done();
            });
        });
    });

    context('when requesting a tag name', () => {
        it('should reply it', (done) => {
            let opt = JSON.parse(JSON.stringify(options2));
            opt.url += 'dummy';

            server.inject(opt, (response) => {
                response.should.be.an('object').and.contain.keys('statusCode','payload');
                response.statusCode.should.equal(200);
                response.payload.should.be.a('string');
                let payload = JSON.parse(response.payload);
                payload.should.be.an('object').and.contain.keys('id', 'tagName', 'name', 'uri', 'user', 'timestamp');
                payload.tagName.should.equal('dummy');
                payload.name.should.equal('Dummy');
                payload.uri.should.equal('http://dbpedia.org');
                payload.user.should.equal(1);
                done();
            });
        });
    });

    context('when suggesting tags', () => {
        it('should reply it', (done) => {
            let opt = JSON.parse(JSON.stringify(options3));
            opt.url += 'dummy';

            server.inject(opt, (response) => {
                response.should.be.an('object').and.contain.keys('statusCode','payload');
                response.statusCode.should.equal(200);
                let payload = JSON.parse(response.payload);
                payload.should.be.an('array');
                done();
            });
        });
    });
});

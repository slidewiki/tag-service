// /* eslint dot-notation: 0, no-unused-vars: 0 */
// 'use strict';
//
// //Mocking is missing completely TODO add mocked objects
//
// describe('REST API', () => {
//
//     let server;
//
//     beforeEach((done) => {
//         //Clean everything up before doing new tests
//         Object.keys(require.cache).forEach((key) => delete require.cache[key]);
//         require('chai').should();
//         let hapi = require('hapi');
//         server = new hapi.Server();
//         server.connection({
//             host: 'localhost',
//             port: 4000
//         });
//         require('../routes.js')(server);
//         done();
//     });
//
//     let tag = {
//         tagName: 'dummy',
//         name: 'Dummy',
//         kind: 'tag',
//         userId: '1'
//     };
//     let options = {
//         method: 'POST',
//         url: '/tag/new',
//         payload: tag,
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     };
//
//     context('when creating a tag it', () => {
//         it('should reply it', (done) => {
//             server.inject(options, (response) => {
//                 response.should.be.an('object').and.contain.keys('statusCode','payload');
//                 response.statusCode.should.equal(200);
//                 response.payload.should.be.a('string');
//                 let payload = JSON.parse(response.payload);
//                 payload.should.be.an('object').and.contain.keys('tagName', 'name', 'userId');
//                 payload.tagName.should.equal('dummy');
//                 payload.name.should.equal('Dummy');
//                 payload.tag.should.equal('tag');
//                 payload.userId.should.equal('1');
//                 done();
//             });
//         });
//     });
// });

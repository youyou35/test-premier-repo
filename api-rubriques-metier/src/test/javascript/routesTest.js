var expect = require('chai').expect;
var routes = require('../../main/webapp/routes');
var conf = require('../../main/webapp/conf/conf.json');
var ConfHandler = require ('../../main/webapp/app/confHandler.js');
var confHandler = new ConfHandler(conf);
var packageInfo = require('../../main/webapp/package.json');
var request = require('supertest');	// Simulation of rest call

/**
 * Test for Routes module
 */
describe("Routes", function(){
	var express = require('express');
	var app = express();
	var mongoClient;
	var mongoUri;

	/**
	 * Test suite initialisation
	 * Has to be ran once before the whole test suite
	 */
	before(function(done){
		mongoClient = require('mongodb').MongoClient;
		mongoUri = 'mongodb://' + confHandler.get("mongo.user") + ':' + confHandler.get("mongo.password") + '@' + confHandler.get("mongo.server") + '/' + confHandler.get("mongo.base");
		mongoClient.connect(mongoUri, function(err, pMongoDbConnexion) {
			routes(app, pMongoDbConnexion, confHandler.get("mongo.collection"), packageInfo);
			done();
		});
	})

 	describe("#routes()", function(){
		it("should send 405 error for put operations", function(done){
			request(app)
		      .put('/'+packageInfo.name+'/*')
		      .expect(405, done);
		});
		it("should send 405 error for post operations", function(done){
			request(app)
		      .post('/'+packageInfo.name+'/*')
		      .expect(405, done);
		});
		it("should send 405 error for delete operations", function(done){
			request(app)
		      .del('/'+packageInfo.name+'/*')
		      .expect(405, done);
		});
		it("should send 206 for get /rubriques", function(done){
			request(app)
				.get('/'+packageInfo.name+'/rubriques')
				.expect(206, done);
		});
		it("should send 206 for get /rubriques", function(done){
			request(app)
				.get('/'+packageInfo.name+'/rubriques')
				.expect(206, done);
		});
		it("should send 200 for get /rubrique/02052200", function(done){
			request(app)
				.get('/'+packageInfo.name+'/rubrique/02052200')
				.expect(200, done);
		});
		it("should send 200 for get /rubrique/by_code_an8/157520", function(done){
			request(app)
				.get('/'+packageInfo.name+'/rubrique/by_code_an8/157520')
				.expect(200, done);
		});
		it("should send 200 for get /segments", function(done){
			request(app)
				.get('/'+packageInfo.name+'/segments')
				.expect(200, done);
		});
    });

});

var expect = require("chai").expect;
var restHandler = require("../../main/webapp/app/restHandler.js");
var conf = require('../main/webapp/resources/conf/conf.json');
var ConfHandler = require ('../../main/webapp/confHandler.js');
var confHandler = new ConfHandler(conf);

describe("RestHandler", function(){
	var express = require('express');
	var app = express();
	var mongoClient;
	var mongoUri;
	var mongoConn;

	/**
	 * Test suite initialisation
	 * Has to be ran once before the whole test suite
	 */
	before(function(done){
		mongoClient = require('mongodb').MongoClient;
		mongoUri = 'mongodb://' + confHandler.get("mongo.user") + ':' + confHandler.get("mongo.password") + '@' + confHandler.get("mongo.server") + '/' + confHandler.get("mongo.base");
		mongoClient.connect(mongoUri, function(err, pMongoDbConnexion) {
			mongoConn = pMongoDbConnexion;
			done();
		});
	})

 	describe("#mapPathToQuery()", function(){
		it("should map a route to a query", function(done){
			var collection = mongoConn.collection(confHandler.get("mongo.collection"));

			var pQuery = {"method":"find","query":{"criteria":{},"projection":{"_id":0}}};
			var restHand = new restHandler();
       		restHand.mapPathToQuery(app, '/', collection, pQuery);

			expect(app.routes.get[0].path).to.be.equal('/');

			done();
		});
    });
});


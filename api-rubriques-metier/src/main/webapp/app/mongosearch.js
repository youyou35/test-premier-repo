/* The MongoSearch object must be created with a collection object of a mongo connexion */
var logger = require('../logger.js');

function MongoSearch() {
	"use strict";

	/*
	 * If this constructor is called without the "new" operator, "this" points
	 * to the global object. Log a warning and call it correctly.
	 */
	if (false === (this instanceof MongoSearch)) {
		logger.getInstance().warn('MongoSearch constructor called without "new" operator');
		return new MongoSearch();
	}

	/*
	 * Call a count method to Mongo and sends the data to the client
	 * @param pCollection Collection name
	 * @param pQuery Mongo find query
	 * @param pCallback Callback to run after to process the mongo find result 
	 */
	this.mongoCount = function(pCollection, pQuery, pCallback) {
		logger.getInstance().debug('mongosearch.js : count query ...');
		pCollection.count(pQuery,pCallback);
		logger.getInstance().debug('mongosearch.js : count query called !');
	};

	/*
	 * Call a find method to Mongo and sends the data to the client
	 * @param pCollection Collection name
	 * @param pQuery Mongo find query
	 * @param pProjection Mongo projection for the find query
	 * @param pSort	Sort
	 * @param pStart Number of the page of the result
	 * @param pLimit Number of element per page
	 * @param pCallback Callback to run after to process the mongo find result 
	 */
	this.mongoFind = function(pCollection, pQuery, pSort, pProjection, pStart, pLimit, pCallback) {
		logger.getInstance().debug('mongosearch.js : find query ...');
		logger.getInstance().debug('mongosearch.js : ' + 'find(' + JSON.stringify(pQuery) + ',' + pProjection + ').skip('+ pStart + ').limit(' + pLimit +'));');
		pCollection.find(pQuery, pProjection).sort(pSort).skip(pStart).limit(pLimit).toArray(pCallback);
		logger.getInstance().debug('mongosearch.js : find query called !');
	};

	/*
	 * Call a findOne method to Mongo and sends the data to the client
	 * @param pCollection Collection name
	 * @param pQuery Mongo find query
	 * @param pProjection Mongo projection for the find query
	 * @param pCacheKey Key used for caching the result
	 * @param pNodeCache NodeCache object used to store the result
	 * @param pCallback Callback to run after to process the mongo find result 
	 */
	this.mongoFindOne = function(pCollection, pQuery, pProjection, pCacheKey, pNodeCache, pCallback) {
		logger.getInstance().debug('mongosearch.js : findOne query ...');
		pCollection.findOne(pQuery, pProjection, function(err, data){
			pCallback(err, data, pCacheKey, pNodeCache);
		});
		logger.getInstance().debug('mongosearch.js : findOne query called !');
	};
	
	/*
	 * Call a distinct method to Mongo and sends the data to the client
	 * @param pCollection Collection name
	 * @param pField Field for distinct
	 * @param pCriteria Criteria (ordering, filter)
	 * @param pCallback Callback to run after to process the mongo find result 
	 */
	this.mongoDistinct = function(pCollection, pField, pCriteria, pCallback) {
		logger.getInstance().debug('mongosearch.js : distinct query ...');		
		pCollection.distinct(pField, pCriteria, pCallback);
		logger.getInstance().debug('mongosearch.js : distinct query called !');		
	};
}

module.exports = MongoSearch;

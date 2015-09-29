/**
 * This modules handle the target Mongo collection of the api.
 * 
 * The api requests a collection. This collection may be "hot switched". For this reason, a feature allows to 
 * change the collection while the app is running.
 *
 * 1. The app conf file contains a key that gives a collection conf name (collection_conf)
 * 2. The collection conf contains a unique document, that has a "current_collection" attribute, pointing to the
 *    collection to request.
 * 3. The switchCollection methods allows to change the value of this attribute, to make it point to an other app conf file attribute.
 */

var logger = require('../logger.js');
var MongoSearch = require('./mongosearch');
var mongosearch = new MongoSearch();

function CollectionHandler(pMongoDbConnexion, pConfHandler) {
    "use strict";

    // Stores the current collection
    this._currentCollection = null;

    /**
     * Init the conf collection if it doesn't exists
     * Prevent the api from crashing
     */
    this._initConfCollection = function(){
        var _this = this;

        // Init the conf collection if it doesn't exist
        var collection_conf = pMongoDbConnexion.collection(pConfHandler.get("mongo.collection_conf"));

        // FIXME : check the mongo.collection array size before accessing to the element
        var defaultConfCollectionObject = {
            "_id" : 1,
            "current_collection" : pConfHandler.get("mongo.collections")[0],
            "message" : "Contains the collection requested by the api. May be changed by the 'switchCollection' api method."
        };

        collection_conf.insert(defaultConfCollectionObject, function(err, result){
            if (err) {
                // Error 11000 : duplicate key => means that the doc already exists.
                if (err.code === 11000){
                    logger.getInstance().info('Collection '+pConfHandler.get("mongo.collection_conf")+" exists and doesn't have to be initialized.");
                } else {
                    logger.getInstance().warn('Error while initializing collection '+pConfHandler.get("mongo.collection_conf"));
                }
            } else {
                var message = 'Conf collection '+pConfHandler.get("mongo.collection_conf")+' initialized with '+JSON.stringify(defaultConfCollectionObject);
                logger.getInstance().info(message);
            }
            
            // Then, set the current collection with the element of the conf collection
            _this.setCurrentCollection();
        });
    };

    this._initConfCollection();

    /**
     * Set the currentCollection variable, that contains the collection to request.
     * This collection may change (hot switch) : it is stored into the "conf collection" (that is modified by the switchCollection method)
     *
     * This method has been added to deal with the "multi plaque" issue (as many instances of the app are running, switching the local
     * instance of the object may not be enough. This method refresh the object according to value stored into the mongo conf collection)
     */
    this.setCurrentCollection = function(pCallback) {
        /*
         * The current collection is set in the "conf collection"
         * Get the lonely doc of this collection and grab the "current_collection" value
         */
        var _this = this;
        var collection_conf = pMongoDbConnexion.collection(pConfHandler.get("mongo.collection_conf"));

        mongosearch.mongoFindOne(collection_conf, {"_id":1}, {}, null, null,
            function(err, data, cleCache, chosenCache) {
                if (err){
                    var message = 'Mongo error while searching "current collection" from "conf collection"';
                    logger.getInstance().error(message);
                }else{
                    if (!data){
                        var message = "Ressource not found : no doc into the conf collection : "+pConfHandler.get("mongo.collection_conf");
                        logger.getInstance().error(message);
                    }else{
                        _this._currentCollection = data.current_collection;
                        logger.getInstance().debug("setCurrentCollection => "+_this._currentCollection);
                    }
                }
                if (pCallback !== undefined){
                    pCallback(err, _this._currentCollection);
                }
        });    
    }


    /**
     * Get the current collection configuration key from the conf collection
     * This value is stored in the "conf collection"
     */
    this.getCurrentCollection = function(){
        var result = {}
        if (this._currentCollection !== null && this._currentCollection !== undefined){
            result.code = 200;
            result.message = "OK";
            result.collection = this._currentCollection;
        }else{
            result.code = 500;
            result.message = "Error : currentCollection not set";
            result.collection = null;     
        }

        logger.getInstance().info("Current collection is : "+result.collection);

        return result;
    }

    /**
     * Check if the two collections own the same volume of data, and then
     * switch the requested collection (collection_current) to "collection_a"
     * or "collection_b".
     */
    this.switchCollections = function(pTolerance, pExpressRequest, pExpressResult, pCallback){
        var _this = this;
        var collections = pConfHandler.get("mongo.collections");

        var response = {
            "code":200,
            "message":"Ok - Switched",
            "error":null
        }

        if (collections.length !== 2){
            response.code = '500';
            response.message = "Conf file error : mongo.collections must be an array of two elements. Switch is disabled !";
            logger.getInstance().error(response.message);

            pCallback(pExpressRequest, pExpressResult, response);
            return;
        }

        // Compare the number of docs of each collection to validate the switch
        // Switch is disabled if the gap is greater than req.query.tolerance %
        var collection_a = pMongoDbConnexion.collection(collections[0]);
        var collection_b = pMongoDbConnexion.collection(collections[1]);

        mongosearch.mongoCount(collection_a, {}, function(pErrA, pCountA){
            // If an error occurs, treatment stops here
            if (pErrA){
                response.code = '500';
                response.message = 'Error while requesting mongo for collection '+ collections[0];
                response.error = pErrA;
                logger.getInstance().debug(response.message);

                pCallback(pExpressRequest, pExpressResult, response);
            }else{
                mongosearch.mongoCount(collection_b, {}, function(pErrB, pCountB){
                    if (pErrB){
                        response.code = '500';
                        response.message = 'Error while requesting mongo for collection '+ collections[1];
                        response.error = pErrB;
                        logger.getInstance().debug(response.message);

                        pCallback(pExpressRequest, pExpressResult, response);
                    } else {
                        // Tolerance percentile
                        var tolerance = 20;
                        if (pTolerance !== undefined){
                            tolerance = pTolerance;
                        }

                        // Check the diffence of elements between the two collections
                        // switch is refused if the gap is greater than switch_tolerance_percentile %
                        if ( (pCountA > pCountB + tolerance*pCountB/100) || 
                            (pCountA < pCountB - tolerance*pCountB/100) ){

                            response.code = '400';
                            response.message = 'Too many differences between collections : '+pCountA+' vs '+pCountB + ' elements. Switch refused.';
                            logger.getInstance().debug(response.message);
                            logger.getInstance().debug(pCountA + " vs " + pCountB);

                            pCallback(pExpressRequest, pExpressResult, response);
                        } else {
                            var newCollection = collections[0];
                            if (_this._currentCollection === collections[0]){
                                newCollection = collections[1];
                            }else{
                                logger.getInstance().debug("Switch from "+_this._currentCollection+ " to "+ newCollection);
                            }

                            var collection_conf = pMongoDbConnexion.collection(pConfHandler.get("mongo.collection_conf"));
                            // Persisting the modif in the conf collection
                            collection_conf.update({'_id':1}, {"$set":{"current_collection":newCollection}}, function(err, result){
                                if (err) {
                                    response.code = '500';
                                    response.message = 'Error while persisting the current collection in '+pConfHandler.get("mongo.collection_conf");
                                    response.error = err;
                                    logger.getInstance().debug(response.message);

                                    pCallback(pExpressRequest, pExpressResult, response);
                                } else {
                                    // Check if the collection has been updated
                                    if (result === 0){
                                        response.code = '500';
                                        response.message = 'Error ! No update done while persisting the current collection in '+pConfHandler.get("mongo.collection_conf");
                                        response.error = err;
                                        pCallback(pExpressRequest, pExpressResult, response);
                                    } else {
                                        response.code = '200';
                                        response.message = 'Switch to collection '+newCollection;
                                        logger.getInstance().debug(response.message);
                                        logger.getInstance().debug(result);

                                        // Update the attribute and run the callback
                                        _this._currentCollection = newCollection;
                                        pCallback(pExpressRequest, pExpressResult, response);
                                    }
                                }
                            });
                        }
                    }
                });
            }            
        });
    };

}

module.exports = CollectionHandler;


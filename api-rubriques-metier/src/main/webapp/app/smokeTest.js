var logger = require('../logger.js');

var ResponseHandler = require ('../app/responseHandler.js');
var responseHandler = new ResponseHandler();

/*
 * This module is used for testing the external connections.
 */
function SmokeTest(pMongoClient, pConfHandler) {
    "use strict";

    this._incrementErrorAndClose = function(pContent, pDb, pRequete, pResult, pMessage){

        logger.getInstance().debug("Error detected - Closing connexion : " + pMessage);

        pContent.nbTestError++;
        pDb.close(); 
        responseHandler.sendResponse(null, pContent, pRequete, pResult, '500', pMessage);
    }

    this._testConfCollection = function(pCollectionName, pContent, pDb, pRequete, pResult){
        var _this = this;
        var collection = pDb.collection(pCollectionName);

        logger.getInstance().debug("Find One on " + pCollectionName);

        collection.findOne({}, function(err, data){
            if (err || data === null) {
                var message = "Erreur de requete sur la collection "+pCollectionName;
                pContent.resultats.push(message);
                logger.getInstance().debug("Can't Find One on " + pCollectionName);
                _this._incrementErrorAndClose(pContent,pDb,pRequete,pResult,message);
            } else {
                var targetCollection = data.current_collection;
                if (targetCollection === undefined){
                    var message = "Document de conf mal formé " + JSON.stringify(data);
                    pContent.resultats.push(message);
                    _this._incrementErrorAndClose(pContent,pDb,pRequete,pResult,message);
                }else {
                    var message = "Récupération d'un document sur "+pCollectionName;
                    pContent.resultats.push(message);

                    pContent.nbTestSuccess++;

                    logger.getInstance().debug(message);

                    _this._testTargetCollection(targetCollection, pContent, pDb, pRequete, pResult);
                }
            }
        });
    };

    this._testTargetCollection = function(pCollectionName, pContent, pDb, pRequete, pResult){
        var _this = this;
        var collection = pDb.collection(pCollectionName);

        logger.getInstance().debug("Find on " + pCollectionName);

        collection.find().limit(10).toArray(function(err, data){
            if (err){
                var message = "Erreur de requete sur la collection "+pCollectionName;     
                pContent.resultats.push(message);
                logger.getInstance().debug(message);

                _this._incrementErrorAndClose(pContent,pDb,pRequete,pResult,message);
            } else {
                if (data.length > 0){
                    pContent.nbTestSuccess++;
                    var message = "Récupération d'au moins un document dans "+pCollectionName;
                    pContent.resultats.push(message);
                } else {
                    pContent.nbTestError++;
                    var message = "Aucun document dans "+pCollectionName;
                    pContent.resultats.push(message);
                    _this._incrementErrorAndClose(pContent,pDb,pRequete,pResult,message);
                    return;
                }
                pDb.close(); 

                logger.getInstance().debug(message);

                responseHandler.sendResponse(null, pContent, pRequete, pResult, '200', message);    
            }
        });
    };

    this._testDBConnection = function(pMongoUri, pRequete, pResult){
        var _this = this;

        logger.getInstance().debug("Connect to " + pMongoUri);

        pMongoClient.connect(pMongoUri, function(err, db) {
            "use strict";
            
            var content = {
                "code" : 200,
                "resultats" : [],
                "status" : 200,
                "nbTestSuccess" : 0,
                "nbTestWarning" : 0,
                "nbTestError" : 0
            };

            // Connexion to the target collection
            if (err) {
                var message = "Connexion échouée à : "+pMongoUri;
                content.resultats.push(message);
                _this_incrementErrorAndClose(content,db,pRequete,pResult,message);
                logger.getInstance().debug(message);
                return;
            }else{
                var message = "Connexion réussie à " + pMongoUri;
                content.resultats.push(message);
                logger.getInstance().debug(message);
                content.nbTestSuccess++;                    
            }

            if (db) {
                var message = "Connexion non null sur " + pMongoUri;
                content.resultats.push(message);
                logger.getInstance().debug(message);
                content.nbTestSuccess++;
            }else{
                var message = "Connexion à Mongo null : "+pMongoUri;
                content.resultats.push(message);
                _this_incrementErrorAndClose(content,db,pRequete,pResult,message);
                logger.getInstance().debug(message);
                return;
            }

            logger.getInstance().debug("Test conf collection " + pMongoUri + " => " + pConfHandler.get("mongo.collection_conf"));
           _this._testConfCollection(pConfHandler.get("mongo.collection_conf"), content, db, pRequete, pResult);
        });
    }

    /*
     * Displays the result of the external connections
     * @param pApp The express application
     * @param pRoute The route mapped to the test
     * @param pMongoUri The mongoDB uri
     */
    this.displayTestResults = function(pApp, pRoute, pMongoUri) {
        var _this = this;
        pApp.get(pRoute, function(req, res, next) {
            logger.getInstance().debug("Test connexion " + pMongoUri);
            _this._testDBConnection(pMongoUri, req, res);
        });
    };
}

module.exports = SmokeTest;
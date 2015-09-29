/*
 * Handler of the Rest response
 * Send data to the client
 */
var logger = require('../logger.js');

var MongoSearch = require('./mongosearch');

function RestHandler(pMongoDbConnexion, pResponseHandler, pConfHandler, pColHandler, pCacheAn8, pCacheAn9, pCacheDistinct) {

    // DAO layer for MongoDB
    var mongosearch = new MongoSearch();

    /*
     * Creates the association between a route and a mongo query 
     * @param pApp The Express app that supports the mapping 
     * @param pPath The route mapped to the mongo query 
     * @param pQuery The mongo query as : 
     * { 
     *      "method":"find",
     *      "returnAList":true,
     *      "query": { 
     *        "criteria": {},
     *        "projection":{ 
     *            "_id":0 
     *        }
     *    }
     * }
     */
    this.mapPathToQuery = function(pApp, pPath, pQuery) {

        logger.getInstance().debug('restHandler.js : Mapping query '+JSON.stringify(pQuery.query)+' to '+pPath);

        // Replace args "@arg@" by req.params.arg so as to let evaluation
        // possible. This operation requires the json object to be transform
        // to a string
        //
        var queryObj = pQuery.query;
        var query = JSON.stringify(queryObj.criteria);

        query = query.replace(/@([^@]+)@/g, "\" + req.params.$1 +\"");

        // Determine the request type so as to adress the right cache
        var lowerQuery = query.toLowerCase();
        var isAN8 = lowerQuery.indexOf("code_an8") > -1;
        var isAN9 = lowerQuery.indexOf("code_an9") > -1;

        pApp.get(pPath, function(req, res, next) {
            logger.getInstance().debug('restHandler.js : setting contentType');

            res.contentType('application/json');
            
            logger.getInstance().debug('restHandler.js : contentType set ' + res.get('Content-Type'));

            // Cache selection, according to the request type
            var chosenCache = null;
            var cleCache = null;
            if (isAN8) {
                chosenCache = pCacheAn8;
                cleCache = req.params.an8;
            }
            if (isAN9) {
                chosenCache = pCacheAn9;
                cleCache = req.params.an9;
            }

            // Check for "meta" parameter
            // meta may have an empty value (?meta) : we have to check if it exists or not
            var addMetaData = (typeof(req.query.meta) != 'undefined');
            
            // Handle "offset" and "limit" parameters
            // Default values are :
            //      * O for start
            //      * configuration value for the number of returned ressources
            var start = 0;
            var limit = pConfHandler.get("max_returned_ressources");
            var httpCode = 200;

            if (req.query.offset) {
                start = parseInt(req.query.offset,10);
                // if "start" set, return 206 to mention "partial content"
                httpCode = 206;
                logger.getInstance().debug('restHandler.js : start - sucess code set to '+ httpCode);
            }
            if (req.query.limit) {
                // cast to int
                limit = parseInt(req.query.limit,10);
                // if "limit" set, return 206 to mention "partial content"
                httpCode = 206;
                logger.getInstance().debug('restHandler.js : limit - sucess code set to '+ httpCode);
            }

            // Item cache initialization
            var itemCache = null;
            logger.getInstance().debug('restHandler.js : pCollectionName => ' + pColHandler.getCurrentCollection().collection);
            var collection = pMongoDbConnexion.collection(pColHandler.getCurrentCollection().collection);

            // Find methods of the defined queries
            if (pQuery.method === 'find') {
                logger.getInstance().debug('restHandler.js : query mongo find');

                // Eval the main query (string to obj)
                mainQuery = eval('(' + query + ')');

                // So as to handle get parameter as "filters", we transform the main query into a "$and" query
                filteredQuery = {};
                filteredQuery["$and"] = [mainQuery];

                // Find methods may have get parameters
                // Are the filters parameter present in the route ?
                if (pQuery.query.filters !== undefined){
                    for (var i = pQuery.query.filters.length - 1; i >= 0; i--) {
                        // Get the name of the get parameter associated to the filter                        
                        param = pQuery.query.filters[i].get_param;

                        // Is this parameter present in the route ?
                        if (req.param(param,null) !== null){
                            // Yes it is ! Let's get its value from the route and replace it in the criteria                            
                            str_criteria = JSON.stringify(pQuery.query.filters[i].criteria).replace(/@([^@]+)@/g, req.param(param));
                            // Adds the criteria to the filter list
                            filteredQuery["$and"].push(eval('(' + str_criteria + ')'));
                        }
                    }
                }

                // We have to count so as to send pagination meta data
                mongosearch.mongoCount(collection, filteredQuery, function(err, count){                    
                    mongosearch.mongoFind(collection, filteredQuery, {_id:1}, queryObj.projection, start,
                        limit, function(err, data){
                            var message = "Ok";
                            if (count > limit){
                                httpCode = 206;
                                message = "Partial content";
                            }
                            var meta;
                            meta = _buildMetaHeadersData(res, req, count, start, limit);
                            if (err){
                                httpCode = 500;
                                message = "Can't get result from mongo";
                            }                            
                            if (addMetaData){
                                pResponseHandler.sendResponse(err, data, req, res, httpCode, message, meta);
                            }else{
                                pResponseHandler.sendResponse(err, data, req, res, httpCode, message);
                            }
                        });
                });
                logger.getInstance().debug('restHandler.js : mongo find called !');
                return;
            }

            // FindOne methods of the defined queries
            if (pQuery.method === 'findOne') {
                logger.getInstance().debug('restHandler.js : query mongo findOne');
                
                if (chosenCache !== null){
                    itemCache = chosenCache.get(cleCache);
                }

                // Did we get the response from the cache ?
                if (itemCache !== null) {
                    logger.getInstance().debug('restHandler.js : reponse got from cache');

                    // Check and set meta data and extra headers
                    var message = "Data gotten from api cache";
                    httpCode = 200;
                    pResponseHandler.sendResponse(null, itemCache, req, res, httpCode, message);
                }else{
                        mongosearch.mongoFindOne(collection, eval('(' + query + ')'), queryObj.projection, cleCache, chosenCache, 
                            function(err, data, cleCache, chosenCache) {
                                if (chosenCache !== null){
                                    logger.getInstance().debug("Cache : "+pConfHandler.get("cache.life_time"));
                                    chosenCache.put(cleCache,data,parseInt(pConfHandler.get("cache.life_time")));
                                }

                                var message = "Ok";
                                if (err){
                                    httpCode = 500;
                                    message = "Can't get result from mongo";
                                }
                                pResponseHandler.sendResponse(err, data, req, res, httpCode, message);

                            });
                    logger.getInstance().debug('restHandler.js : mongo findOne called !');
                }
                return;
            }

            // Distinct methods of the defined queries
            if (pQuery.method === 'distinct') {
                logger.getInstance().debug('restHandler.js : query mongo distinct');
                
                if (pCacheDistinct !== null){
                    itemCache = pCacheDistinct.get(queryObj.field);
                }
                
                if (itemCache !== null) {                    
                    logger.getInstance().debug('restHandler.js : reponse got from cache');

                    // Check and set meta data and extra headers
                    var message = "Data gotten from api cache";
                    httpCode = 200;
                    pResponseHandler.sendResponse(null, itemCache, req, res, httpCode, message);
                }else{
                        mongosearch.mongoDistinct(collection, queryObj.field, queryObj.criteria, function(err, data){
                            if (pCacheDistinct !== null){
                                pCacheDistinct.put(queryObj.field,data,parseInt(pConfHandler.get("cache.life_time")));
                            }

                            var message = "Ok";
                            if (err){
                                httpCode = 500;
                                message = "Can't get result from mongo";
                            }

                            pResponseHandler.sendResponse(err, data, req, res, httpCode, message);
                        });
                    logger.getInstance().debug('restHandler.js : mongo distinct called !');
                }
                return;
            }
        });

        logger.getInstance().debug('restHandler.js : Mapping query '+JSON.stringify(pQuery.query)+' to '+pPath);

    };

    /**
     * Construit les meta data de pagination :
     *  - les ajoute aux headers de la réponse ;
     *  - retourne un obejt json les contenant
     *
     * @param pResponse     Response object
     * @param pRequest      Request object
     * @param pNbResults    Nombre de résultat total de la méthode
     * @param pStart        Numero de la première réponse
     * @param pLimit        Nombre d'éléments retourné par chaque "page"
     */
    var _buildMetaHeadersData = function(pResponse, pRequest, pNbResults, pStart, pLimit){
        logger.getInstance().debug('restHandler.js : setMetaHeadersData');
        // Url for links
        var urlType = 'http://' + pRequest.headers.host + pRequest.route.path;

        // Build the "get parameter" part of the url
        var getParameters = [];
        for (var key in pRequest.params){
            // Don't get offset and limit parameters : their value depends on the target url
            if (key != 'offset' && key != 'limit'){
                getParameters.push(key + '=' + pRequest.params[key]);
            }
        }

        // Join the array with "&" caracter
        var getParameterString = '?' + getParameters.join('&');

        var firstPage = urlType + getParameterString;
        var lastPage = urlType + getParameterString + '&offset=' + Math.max(0, (pNbResults - pLimit)) + '&limit=' + pLimit;
        var nextPage = urlType + getParameterString + '&offset=' + Math.min(pNbResults, (pStart + pLimit)) + '&limit=' + pLimit;
        var prevPage = urlType + getParameterString + '&offset=' + Math.max(0, (pStart - pLimit)) + '&limit=' + pLimit;

        // Set the headers ("meta_data.pagination" object (from conf) gives the meta names)
        pResponse.setHeader(pConfHandler.get("meta_data.pagination.total"), pNbResults);
        pResponse.setHeader(pConfHandler.get("meta_data.pagination.first_page"), firstPage);
        pResponse.setHeader(pConfHandler.get("meta_data.pagination.last_page"), lastPage);
        pResponse.setHeader(pConfHandler.get("meta_data.pagination.next_page"), nextPage);
        pResponse.setHeader(pConfHandler.get("meta_data.pagination.prev_page"), prevPage);

        // If meta data is required (url parameter "meta" exists), meta data must be included in the json object
        var metaData = {_meta:{}}
        metaData._meta._pagination = {};
        metaData._meta._pagination._links = {};
        metaData._meta._pagination._links._first = firstPage;
        metaData._meta._pagination._links._last = lastPage;
        metaData._meta._pagination._links._next = nextPage;
        metaData._meta._pagination._links._prev = prevPage;
        metaData._meta._pagination._total = pNbResults;

        return metaData;
    };    
}

module.exports = RestHandler;

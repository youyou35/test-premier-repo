
var routesMap = require('../conf/routes.json');
var Info = require ('../app/root');
var RestHandler = require('../app/restHandler.js');
var logger = require('../logger.js');
var conf = require('../conf/conf.json');

var ResponseHandler = require ('../app/responseHandler.js');
var responseHandler = new ResponseHandler();

var CacheHandler = require ('../app/cacheHandler.js');
var cacheHandlerAn8 = new CacheHandler();
var cacheHandlerAn9 = new CacheHandler();
var cacheHandlerDist = new CacheHandler();

module.exports = function(pApp, pMongoDbConnexion, pPackageInfo, pConfHandler, pCollHandler) {

    var restHand = new RestHandler(pMongoDbConnexion, responseHandler, pConfHandler, pCollHandler, cacheHandlerAn8.get(), cacheHandlerAn9.get(), cacheHandlerDist.get());

	// '/' Route module
	var infoMod = new Info(pPackageInfo, routesMap);
	infoMod.mapToDisplay(pApp,'/'+pPackageInfo.name);

	// Generic treatments of routes
	logger.getInstance().debug('routes/index.js : Loop for routes');
	for(var i=0;i<routesMap.length;i++){
		logger.getInstance().debug('routes/index.js : Mapping of ' + pPackageInfo.name+routesMap[i].path);
		restHand.mapPathToQuery(pApp, '/'+pPackageInfo.name+routesMap[i].path, routesMap[i].mongoQuery);
	}

    // Hot collection switch
    // Add the ?tolerance=value query parameter to change the volume difference tolerance
    pApp.put('/'+pPackageInfo.name+'/switchCollection',function (req, res, next) {
        logger.getInstance().debug('routes/index.js : Switch Collection');

        pCollHandler.switchCollections(req.query.tolerance, req, res, _handleSwitchResponse);
    });

    // Get current collection
    pApp.get('/'+pPackageInfo.name+'/getCurrentCollection',function (req, res, next) {
        logger.getInstance().debug('routes/index.js : get current Collection');

        var response = pCollHandler.getCurrentCollection();
        var curColObj = {
            "host" : pConfHandler.get("mongo.server"),
            "base" : pConfHandler.get("mongo.base"),
            "collection" : response.collection
        }
        responseHandler.sendResponse(null, curColObj, req, res, response.code, response.message, null);
    });

    // Get cache info
    pApp.get('/'+pPackageInfo.name+'/cacheState',function (req, res, next) {
        logger.getInstance().debug('get the memory-cache state');
        
        var cacheState = {};
        cacheState.an8 = cacheHandlerAn8.getState();
        cacheState.an9 = cacheHandlerAn9.getState(); 
        cacheState.distinct = cacheHandlerDist.getState();

        code = '200';
        message = 'Memory-cache State';
        responseHandler.sendResponse(null, cacheState, req, res, code, message, null);
    });

    // Flushes the cache
    // FIXME : Comment partager l'info entre les instances ? Quand on flush, on
    // ne flush qu'une seule instance node ...
    pApp.put('/'+pPackageInfo.name+'/flush',function (req, res, next) {
        logger.getInstance().debug('flush the memory-cache');
        
        var cacheState = {};
        cacheState.an8 = cacheHandlerAn8.flush();
        cacheState.an9 = cacheHandlerAn9.flush(); 
        cacheState.distinct = cacheHandlerDist.flush();

        code = '200';
        message = 'Memory-cache has been flushed';
        responseHandler.sendResponse(null, cacheState, req, res, code, message, null);
    });

    // Get the conf
    pApp.get('/'+pPackageInfo.name+'/supervision',function (req, res, next) {
        logger.getInstance().debug('Get the conf');

        displayable_conf = conf;
        _instanciate_conf(displayable_conf,{});

        code = '200';
        message = 'Ok';
        responseHandler.sendResponse(null, displayable_conf, req, res, code, message, null);
    });

	// Other URL returns a 400 error code	
	pApp.get('/'+pPackageInfo.name+'/*',function (req, res, next) {
		logger.getInstance().debug('routes/index.js : Unknown route');
		responseHandler.sendResponse(null, "No treatment mapped to this route", req, res, 400,"No treatment mapped to this route",null);
	});

	// PUT not allowed => 405	
	pApp.put('/'+pPackageInfo.name+'/*',function (req, res, next) {
		logger.getInstance().debug('routes/index.js : Put forbidden');
        responseHandler.sendResponse(null, "PUT method is forbidden", req, res, 405,"PUT method is forbidden",null);
	});

	// POST not allowed => 405	
	pApp.post('/'+pPackageInfo.name+'/*',function (req, res, next) {
		logger.getInstance().debug('routes/index.js : Post forbidden');
        responseHandler.sendResponse(null, "POST method is forbidden", req, res, 405,"POST method is forbidden",null);
	});

	// DELETE not allowed => 405	
	pApp.delete('/'+pPackageInfo.name+'/*',function (req, res, next) {
		logger.getInstance().debug('routes/index.js : Delete forbidden');
        responseHandler.sendResponse(null, "DELETE method is forbidden", req, res, 405,"DELETE method is forbidden",null);
	});

	logger.getInstance().debug('All routes mapped !');

    /**
     * Instantiate a conf object with its true value ie the value
     * read from the environnment variables
     */
    var _instanciate_conf = function(pSource){
        for (var key in pSource) {
            if (typeof pSource[key] == "object"){
                _instanciate_conf(pSource[key]);
            }
            else if (typeof pSource[key] != "function"){
                pSource[key] = (process.env[pSource[key]] || pSource[key]);
            }
        }
    }

    /**
     * Handle the response of the switchCollection method
     */
    var _handleSwitchResponse = function(pRequest, pResult, pResponse){
        responseHandler.sendResponse(pResponse.error, pResponse, pRequest, pResult, pResponse.code, pResponse.message, null);        
    }    

};

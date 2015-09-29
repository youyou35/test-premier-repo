var logger = require('../logger.js');

function Info(pPackageInfo,pRouteMap) {
	"use strict";

	var os = require("os");
	var changelogjson = require('../changelog.json');
	var conf = require('../conf/conf.json');
	var ConfHandler = require ('../app/confHandler.js');
	var confHandler = new ConfHandler(conf);

    var notGenericRoutes = [
        {'path':'/'+pPackageInfo.name+'/supervision','description':"GET - Gets the api current configuration"},
        {'path':'/'+pPackageInfo.name+'/getCurrentCollection','description':"GET - Returns the current collection"},
        {'path':'/'+pPackageInfo.name+'/switchCollection','description':"PUT - Hot collection switch - Add the ?tolerance=value query parameter to change the volume difference tolerance"},
        {'path':'/'+pPackageInfo.name+'/cacheState','description':"GET - Cache state control"},
        {'path':'/'+pPackageInfo.name+'/flush','description':"PUT - Flushes the cache"}
    ]

    var routes = pRouteMap.concat(notGenericRoutes);

    this.mapToDisplay = function(pApp,pRoute){
        pApp.get(pRoute, function(req,res, next) {
            var display = new Object();
            display.name = pPackageInfo.name;
            display.version = pPackageInfo.version;
            display.description = pPackageInfo.description;
            display.ressources = new Array(); //'Methods : \n';
            display.changelog = changelogjson;

            for(var i=0;i<routes.length;i++){
                display.ressources[i] = {};
				display.ressources[i].path = 'http://' + os.hostname() + ':' + confHandler.get("port") +'/'+pPackageInfo.name + routes[i].path + ' : '+ routes[i].description;
            }
            res.status(200).send(display);
        });
    };
}

module.exports = Info;
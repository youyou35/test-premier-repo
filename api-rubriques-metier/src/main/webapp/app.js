/**
 * ws-rest-rubriques gets query responses from simple routes
 * Gets its data from a mongodb server
 */

// require('./response');

// Cluster module
var cluster = require('cluster');
// Expressjs include
var express = require('express');

// Middleware pour la gestion des requetes POST
var bodyParser = require('body-parser');

// Juste pour afficher le serveur quand on lance l'appli
var os = require("os");

// Express Application declaration
var app = express();
app.use(bodyParser.json());
// Minified json
app.set('json spaces',0);

// Conf Handler
var conf = require('./conf/conf.json');
var ConfHandler = require ('./app/confHandler.js');
var confHandler = new ConfHandler(conf);

// Info de version, nom de l'api, ...
var packageInfo = require('./package.json');

// Logger
var logger = require('./logger.js');

var async = require('async');

// Master process
if(cluster.isMaster) {
    var workers = require('os').cpus().length;
    if(workers > confHandler.get("max_workers")) {
        workers = confHandler.get("max_workers");
    }
    // Create a worker for each CPU
    for (var i = 0; i < workers; i += 1) {
        cluster.fork();
    }
    logger.getInstance().info("L'api-rubriques est lancée : " + os.hostname() + ":" + confHandler.get("port") + "/" + packageInfo.name);
    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker,
        // we're not sentimental
        logger.getInstance().error('Worker ' + worker.id + ' died, restarting');
        cluster.fork();
    });
}
// Child process
else {
    // Routing module
    var routes = require('./routes');

    logger.getInstance().info('Worker ' + cluster.worker.id + ' running');

    // On vérifie qu'un replicaSet a été renseigné en conf.
    // C'est le cas si la valeur du champ "mongo.replicaSet" est différent de "CONFPJ_APIMOTSCLES_V1_REPLICASET_NAME"
    // Note le module confHandler tente de trouver une variable d'env avec le nom CONFPJ_APIMOTSCLES_V1_REPLICASET_NAME
    // S'il n'en trouve pas, il renvoie la chaine "CONFPJ_APIMOTSCLES_V1_REPLICASET_NAME"
    var rsExtraParameter = "";
    if (confHandler.get("mongo.replicaSet") !== "CONFPJ_APIRUBRIQUES_V2_REPLICASET_NAME"){
        rsExtraParameter = '&replicaSet=' + confHandler.get("mongo.replicaSet");
    }

    // Paramètres de connexion à Mongo
    var mongoClient = require('mongodb').MongoClient;
    var mongoUri = 'mongodb://' + confHandler.get("mongo.user") + ':' + confHandler.get("mongo.password") + '@' + confHandler.get("mongo.server") + '/' + confHandler.get("mongo.base")
                + '?connectTimeoutMS=' + confHandler.get("mongo.connectTimeoutMS") 
                + '&socketTimeoutMS=' + confHandler.get("mongo.socketTimeoutMS") 
                + '&maxPoolSize=' + confHandler.get("mongo.maxPoolSize") 
                + '&readPreference=' + confHandler.get("mongo.readPreference")
                + rsExtraParameter;

    //SomkeTest module loading
    var SmokeTest = require ('./app/smokeTest');

    // '/smokeTest' Route for smokeTest
    // This route has to be defined here, before the connection to the mongoDB, since
    // it tests it
    var smokeTestMod = new SmokeTest(mongoClient, confHandler);
    smokeTestMod.displayTestResults(app,'/'+packageInfo.name+'/smokeTest', mongoUri);

    // Connexion to Mongo using conf file parameters
    mongoClient.connect(mongoUri, function(err, db) {
    	"use strict";
        debugger;
    	if (err) {
    		logger.getInstance().error('Worker ' + cluster.worker.id + ': Connection failed on ' + mongoUri);
    		throw err;
    	}
        logger.getInstance().info('Worker ' + cluster.worker.id + ': Connection succeeded on ' + mongoUri);

        // Collection handler
        // As we want to be able to switch from a collection to another
        // the target collection is not stored in the conf file but
        // as a document in the "conf collection".
        var CollectionHandler = require ('./app/collectionHandler');
        var collHandlerMod = new CollectionHandler(db, confHandler);

        // Async.series assures that a function is run only when the previous is finished.
        // Here, we have to be sure that routes are mapped only when we have gotten the current collection.
        async.series([
            function(callback){
                collHandlerMod.setCurrentCollection(callback);
            },
            function(callback){
                // As we want to be able to switch from a collection to another
                // the target collection is not stored in the conf file but
                // as a document in the "conf collection".

                // Application routes
                logger.getInstance().info('App Routes');
                routes(app, db, packageInfo, confHandler, collHandlerMod);
                // do some more stuff ...
                callback(null, 'two');
            },
            function(callback){
                // Refresh the collection all 5mn = 300s = 300000 ms
                // This method has been added to deal with the "multi plaque" issue (as many instances of the app are running, switching the local
                // instance of the object may not be enough. This method refresh the object according to value stored into the mongo conf collection)
                logger.getInstance().info('Refresh intervall for colhandler');
                setInterval(function() { collHandlerMod.setCurrentCollection(); }, 300000);
                callback(null, 'three');
            }
        ]);

    });

    // Disable Express header
    app.disable('x-powered-by');

    // Listening port defined in conf file
    app.listen(confHandler.get("port"));
    logger.getInstance().info('Worker ' + cluster.worker.id + ' listening on port ' + confHandler.get("port"));
}

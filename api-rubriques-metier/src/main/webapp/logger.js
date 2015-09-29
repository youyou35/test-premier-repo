var log4js = require('log4js');
var conf = require('./conf/conf.json');
var ConfHandler = require ('./app/confHandler.js');
var configuration = new ConfHandler(conf);

var logpath = configuration.get("log.dir") + "/" + configuration.get("log.log_file");

log4js.configure(
    {
        reloadSecs: 300,
        appenders: [
            {
                type: "file",
                absolute: true,
                filename: logpath,
                maxLogSize: configuration.get("log.max_size"),
                backups: configuration.get("log.max_files"),
                category: "default"
            },
            {
                type: "console",
                absolute: true,
                category: "default"
            },
            {
                type: "file",
                absolute: true,
                filename: logpath,
                maxLogSize: configuration.get("log.max_size"),
                backups: configuration.get("log.max_files"),
                category: "exception"
            }
        ]
    }
);

var logger = log4js.getLogger('default');
logger.setLevel(configuration.get("log.level"));

process.on('uncaughtException', function(err) {
    console.log("UNCAUGHT EXCEPTION: " + err.stack);
    log4js.getLogger('exception').fatal("UNHANDLED EXCEPTION: " + err.stack);
    log4js.getLogger('default').error("UNHANDLED EXCEPTION: " + err.stack);
    process.exit(1);
});

var Logger = {};
Logger.instance = null;

Logger.getInstance = function() {
    return logger;
};

Logger.getInstance().debug(logpath);

module.exports = Logger;

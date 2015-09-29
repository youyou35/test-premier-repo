/*
 * App Launcher for multi-core processing
 */
var cluster = require('cluster');

if (cluster.isMaster) {
	// Start up workers for each cpu
	require('os').cpus().forEach(function() {
		cluster.fork();
	});

	// Node errors handling
	cluster.on('death', function(worker) {
		console.log('Worker ' + worker.pid + ' died. Restarting a new one ...');
		cluster.fork();
	});

} else {
	// load up your application as a worker
	require('./app.js');
}

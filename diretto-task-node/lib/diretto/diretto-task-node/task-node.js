var SERVER_NAME = "diretto Task API Node";
var SERVER_VERSION = "0.1.0";

var SERVER_SIGNATURE = SERVER_NAME + "/" + SERVER_VERSION;

var uuid = require('node-uuid');
var restify = require('node-restify');

var api = null; 

var TaskNode = exports = function(options) {
	this.options = options;

	this.server = restify.createServer({
		serverName : SERVER_SIGNATURE
	});
	
	this.serverName = SERVER_NAME;
	this.serverVersion = SERVER_VERSION;
	this.serverSignature = SERVER_SIGNATURE;
	
	this.apicalls = require('./apicalls.js');
	api = this.apicalls(this);

	this._registerRoutes();
};

module.exports = TaskNode;

TaskNode.prototype.bind = function() {
	this.server.listen(this.options.task.bind.port || 8006, this.options.task.bind.ip || "127.0.0.1");
};

var pre = [];
var post = [];


TaskNode.prototype._registerRoutes = function() {

	this.server.get('/v2', pre, api.getIndex, post);

	// this.server.get('/v2/', function(req, res, next) {
	// console.log(req.uriParams);
	// console.dir(req._url);
	// console.dir(req.params);
	// res.send(200, {
	// "x":"y"
	// });
	// return next();
	// });
};

var SERVER_NAME = "diretto Task API Node";
var SERVER_VERSION = "0.1.0";

var SERVER_SIGNATURE = SERVER_NAME + "/" + SERVER_VERSION;

var path = require('path');

var uuid = require('node-uuid');
var restify = require('node-restify');
var log = restify.log;

log.level(restify.LogLevel.Debug);

var PluginHandler = require('plugin-handler').PluginHandler;

var api = null;

var TaskNode = module.exports.TaskNode = function(options) {
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

	var plugin = new PluginHandler();
	var auths = plugin.preloadAllPluginsSync(path.join(__dirname, '..', '..', '..', 'plugins', 'common', 'auth'), true);
	if (auths[options.task.auth.plugin]) {
		this.auth = auths[options.task.auth.plugin]();
	}
	if (this.auth === null) {
		console.error("Could not initialize authentication plugin \"" + options.task.auth.plugin + "\"");
		process.exit(-1);
	}
};

TaskNode.prototype.bind = function() {
	this.server.listen(this.options.task.bind.port || 8006, this.options.task.bind.ip || "127.0.0.1");
};

// TODO: auth

TaskNode.prototype._registerRoutes = function() {

	var that = this;
	var s = this.server;

	/**
	 * User authentication
	 */
	var authenticate = function(req, res, next) {
		that.auth.authenticate(req, function(err, user) {
			if (err) {
				res.send(err.code || 500, that._errorJSON("Authentication required"), {
					'WWW-Authenticate' : 'Basic realm=diretto Task API Node Access'
				});
				console.log(err);
			}
			else {
				req.authenticatedUser = user;
				next();
			}
		});
	};

	/**
	 * User authorization. The authenticatedUser value is checked against a
	 * /:user parameter of the request, if available.
	 */
	var authorize = function(req, res, next) {
		if (!req.authenticatedUser) {
			res.send(err.code || 500, that._errorJSON("Authentication required"), {
				'WWW-Authenticate' : 'Basic realm=diretto Task API Node Access'
			});
		}
		else if (!req.uriParams.user || (req.authenticatedUser !== req.uriParams.user)) {
			res.send(403, that._errorJSON("Missing authorization for request"));
		}
		else {
			next();
		}
	};
	

	// Index
	s.get('/v2', [], api.getIndex, []);

	// Query
	s.post('/v2/query', [], api.notImplemented, []);

	// Task
	s.post('/v2/tasks', [], api.notImplemented, []);
	s.post('/v2/tasks/snapshot', [], api.notImplemented, []);
	s.get('/v2/task/:task/snapshot', [ authenticate, authorize ], api.notImplemented, []);
	s.get('/v2/task/:task', [], api.notImplemented, []);
	s.get('/v2/user/:user', [ authenticate, authorize ], api.notImplemented, []);

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

TaskNode.prototype._errorJSON = function(msg) {
	return {
		"error" : {
			"reason" : msg
		}
	};
}
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
		else if (!req.uriParams.userId || (req.authenticatedUser !== req.uriParams.userId)) {
			res.send(403, that._errorJSON("Missing authorization for request"));
		}
		else {
			next();
		}
	};
	

	// Index
	s.get('/v2', [], api.getIndex, []);
	
	// Query
	s.post('/v2/query', [authenticate], api.notImplemented, []);
	s.get('/v2/query/common/:type', [authenticate], api.notImplemented, []);
	s.get('/v2/query/stored/:queryId', [authenticate], api.notImplemented, []);
	s.get('/v2/query/stored/:queryId/cursor/:cursorId', [authenticate], api.notImplemented, []);
	
	//Task
	s.get('/v2/task/:taskId', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/snapshot', [authenticate], api.notImplemented, []);
	s.post('/v2/tasks', [authenticate], api.notImplemented, []);
	s.post('/v2/tasks/snapshot', [], api.notImplemented, []);

	//Submission
	s.post('/v2/task/:taskId/submissions', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/submissions', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/submission/:submissionId', [authenticate], api.notImplemented, []);
	
	//Comment
	s.post('/v2/task/:taskId/comments', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/comments', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/comment/:commentId', [authenticate], api.notImplemented, []);
	
	//Tag
	s.post('/v2/tags', [authenticate], api.notImplemented, []);
	s.get('/v2/tag/:tagId', [authenticate], api.notImplemented, []);

	s.post('/v2/task/:taskId/submission/:submissionId/tags', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/submission/:submissionId/tags', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId', [authenticate], api.notImplemented, []);
	
	s.post('/v2/task/:taskId/tags', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/tags', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/tag/:tagId', [authenticate], api.notImplemented, []);
	
	//Vote
	s.get('/v2/task/:taskId/comment/:commentId/votes', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/comment/:commentId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.del('/v2/task/:taskId/comment/:commentId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.put('/v2/task/:taskId/comment/:commentId/vote/user/:userId/:vote', [authenticate, authorize], api.notImplemented, []);

	s.get('/v2/task/:taskId/votes', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.del('/v2/task/:taskId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.put('/v2/task/:taskId/vote/user/:userId/:vote', [authenticate, authorize], api.notImplemented, []);
	
	s.get('/v2/task/:taskId/tag/:tagId/votes', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/tag/:tagId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.del('/v2/task/:taskId/tag/:tagId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.put('/v2/task/:taskId/tag/:tagId/vote/user/:userId/:vote', [authenticate, authorize], api.notImplemented, []);
	
	s.get('/v2/task/:taskId/submission/:submissionId/votes', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/submission/:submissionId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.del('/v2/task/:taskId/submission/:submissionId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.put('/v2/task/:taskId/submission/:submissionId/vote/user/:userId/:vote', [authenticate, authorize], api.notImplemented, []);
	
	s.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId/votes', [authenticate], api.notImplemented, []);
	s.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.del('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId', [authenticate, authorize], api.notImplemented, []);
	s.put('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId/:vote', [authenticate, authorize], api.notImplemented, []);

};

TaskNode.prototype._errorJSON = function(msg) {
	return {
		"error" : {
			"reason" : msg
		}
	};
}
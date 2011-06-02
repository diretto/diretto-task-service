var path = require('path');

var CouchClient = require('couch-client');
var uuid = require('node-uuid');
var restify = require('node-restify');
var log = restify.log;

log.level(restify.LogLevel.Debug);

var PluginHandler = require('plugin-handler').PluginHandler;
var ApiCalls = require('./apicalls.js');

module.exports = function(options) {

	options.server = {
		name : "diretto Task API Node",
		version : "0.1.0",
		signature : "diretto Task API Node/0.1.0"
	}

	// Load auth plugin
	var plugin = new PluginHandler();
	var auth = null;
	var auths = plugin.preloadAllPluginsSync(path.join(__dirname, '..', '..', '..', 'plugins', 'common', 'auth'), true);
	if (auths[options.task.auth.plugin]) {
		auth = auths[options.task.auth.plugin]();
	}
	if (auth === null) {
		console.error("Could not initialize authentication plugin \"" + options.task.auth.plugin + "\"");
		process.exit(-1);
	}

	// Create restify server
	var server = restify.createServer({
		serverName : options.server.signature
	});

	// Create CouchClient
	var db = CouchClient(options.task.persistence.couchdb.uri);
	
	// Create API Binding
	var api = ApiCalls(db,options);


	var _errorJSON = function(msg) {
		return {
			"error" : {
				"reason" : msg
			}
		};
	};

	/**
	 * User authentication
	 * If valid, the username will be stored as 'authenticatedUser' attribute in the request object.
	 */
	var authenticate = function(req, res, next) {
		auth.authenticate(req, function(err, user) {
			if (err) {
				res.send(err.code || 500, _errorJSON("Authentication required"), {
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
			res.send(err.code || 500, _errorJSON("Authentication required"), {
				'WWW-Authenticate' : 'Basic realm=diretto Task API Node Access'
			});
		}
		else if (!req.uriParams.userId || (req.authenticatedUser !== req.uriParams.userId)) {
			res.send(403, _errorJSON("Missing authorization for request"));
		}
		else {
			next();
		}
	};

	// Index
	server.get('/v2', [], api.index.get, []);

	// Query
	server.post('/v2/query', [ authenticate ], api.query.create, []);
	server.get('/v2/query/common/:type', [ authenticate ], api.query.common, []);
	server.get('/v2/query/stored/:queryId', [ authenticate ], api.query.forward, []);
	server.get('/v2/query/stored/:queryId/cursor/:cursorId', [ authenticate ], api.query.resultPage, []);

	// Task
	server.get('/v2/task/:taskId', [ authenticate ], api.task.get, []);
	server.get('/v2/task/:taskId/snapshot', [ authenticate ], api.task.getSnapshot, []);
	server.post('/v2/tasks', [ authenticate ], api.task.create, []);
	server.post('/v2/tasks/snapshots', [], api.task.fetchSnapshots, []);

	// Submission
	server.post('/v2/task/:taskId/submissions', [ authenticate ], api.submission.create, []);
	server.get('/v2/task/:taskId/submissions', [ authenticate ], api.submission.getAll, []);
	server.get('/v2/task/:taskId/submission/:submissionId', [ authenticate ], api.submission.get, []);

	// Comment
	server.post('/v2/task/:taskId/comments', [ authenticate ], api.comment.create, []);
	server.get('/v2/task/:taskId/comments', [ authenticate ], api.comment.getAll, []);
	server.get('/v2/task/:taskId/comment/:commentId', [ authenticate ], api.comment.get, []);

	// Tag
	server.post('/v2/tags', [ authenticate ], api.tag.create, []);
	server.get('/v2/tag/:tagId', [ authenticate ], api.tag.get, []);

	server.post('/v2/task/:taskId/submission/:submissionId/tags', [ authenticate ], api.error.notImplemented, []);
	server.get('/v2/task/:taskId/submission/:submissionId/tags', [ authenticate ], api.error.notImplemented, []);
	server.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId', [ authenticate ], api.error.notImplemented, []);

	server.post('/v2/task/:taskId/tags', [ authenticate ], api.error.notImplemented, []);
	server.get('/v2/task/:taskId/tags', [ authenticate ], api.error.notImplemented, []);
	server.get('/v2/task/:taskId/tag/:tagId', [ authenticate ], api.error.notImplemented, []);

	// Vote
	server.get('/v2/task/:taskId/comment/:commentId/votes', [ authenticate ], api.vote.getAll, []);
	server.get('/v2/task/:taskId/comment/:commentId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, []);
	server.del('/v2/task/:taskId/comment/:commentId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, []);
	server.put('/v2/task/:taskId/comment/:commentId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, []);

	server.get('/v2/task/:taskId/votes', [ authenticate ], api.vote.getAll, []);
	server.get('/v2/task/:taskId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, []);
	server.del('/v2/task/:taskId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, []);
	server.put('/v2/task/:taskId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, []);

	server.get('/v2/task/:taskId/tag/:tagId/votes', [ authenticate ], api.vote.getAll, []);
	server.get('/v2/task/:taskId/tag/:tagId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, []);
	server.del('/v2/task/:taskId/tag/:tagId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, []);
	server.put('/v2/task/:taskId/tag/:tagId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, []);

	server.get('/v2/task/:taskId/submission/:submissionId/votes', [ authenticate ], api.vote.getAll, []);
	server.get('/v2/task/:taskId/submission/:submissionId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, []);
	server.del('/v2/task/:taskId/submission/:submissionId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, []);
	server.put('/v2/task/:taskId/submission/:submissionId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, []);

	server.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId/votes', [ authenticate ], api.vote.getAll, []);
	server.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, []);
	server.del('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, []);
	server.put('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, []);

	return {

		bind : function() {
			server.listen(options.task.bind.port || 8006, options.task.bind.ip || "127.0.0.1");
		}

	};

};

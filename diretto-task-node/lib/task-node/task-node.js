var path = require('path');

var uuid = require('node-uuid');
var restify = require('node-restify');
var log = restify.log;
var cradle = require('cradle');


log.level(restify.LogLevel.Debug);

var PluginHandler = require('plugin-handler').PluginHandler;

module.exports = function(options) {

	options.server = {
		name : "diretto Task API Node",
		version : "0.1.0",
		signature : "diretto Task API Node/0.1.0"
	}
	
	// TODO fix screwed baseUri options.task.external.uri => foobar/v2 !

	// Load auth plugin
	var plugin = new PluginHandler();
	var auth = null;
	var auths = plugin.preloadAllPluginsSync(path.join(__dirname,  '..', '..', 'plugins', 'common', 'auth'), true);
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

	var db = new(cradle.Connection)(options.task.persistence.couchdb.host, options.task.persistence.couchdb.port, {
	    cache: false,
	    raw: false,
	    poolsize: 32
	}).database(options.task.persistence.couchdb.table);

	
	// API helper objects collects useful stuff and is passed to actual API
	// methods
	var apiHelper = {
			
			CONSTANTS : {
				TASK : {
					TYPE : 'task',
					PREFIX : 't'
				},
				QUERY : {
					TYPE : 'query',
					PREFIX : 'q'
				},
				BASETAG : {
					TYPE : 'basetag',
					PREFIX : 'b'
				}
			},
			
			options : options,
			
			util : {				
				updateHandler : require('./util/wrapped-update-handler.js')(db),
				viewPaginator : require('./util/view-paginator.js')(db),
				uri : require('./util/uri-builder.js')(options),
				identifyResource : require('./util/identify-resource.js')
			},
			
			db : db,
			
			uuid : uuid,
			
			assertion : {
					documentExists : require('./assertions/document-exists.js'),
					taskExists : require('./assertions/task-exists.js'),
					baseTagExists : require('./assertions/basetag-exists.js'),
					submissionExists : require('./assertions/submission-exists.js'),
			},
							
			responses : {
				
				notImplemented : function(req, res, next) {
					res.send(501, {
						error : {
							reason : "Not yet implemented"
						}
					});
					next();
				},
				
				notFound : function(req, res, next) {
					res.send(404, {
						error : {
							reason : "Not found"
						}
					});
					next();
				},
			}
	};
	
	// Return binding by invoking the actual handlers, passing the helper object
	var api = {
		
		comment : require('./api/comment.js')(apiHelper),
		
		error : require('./api/error.js')(apiHelper),
		
		index : require('./api/index.js')(apiHelper),
		
		query : require('./api/query.js')(apiHelper),
		
		submission : require('./api/submission.js')(apiHelper),
		
		tag : require('./api/tag.js')(apiHelper),
		
		basetag : require('./api/basetag.js')(apiHelper),
		
		task : require('./api/task.js')(apiHelper),
		
		vote : require('./api/vote.js')(apiHelper),
	}	

	/**
	 * Return a JSON error object
	 */
	var _errorJSON = function(msg) {
		return {
			"error" : {
				"reason" : msg
			}
		};
	};
	
	/**
	 * Ugly logging so far
	 */
	var logging = function(req, res, next) {
		var logEntry = new Date().toUTCString()+" "+req.connection.remoteAddress+": "+req.method+" "+req.url;
		console.log(logEntry);
		
		if(next){
			next();
		}
	};

	/**
	 * User authentication If valid, the username will be stored as
	 * 'authenticatedUser' attribute in the request object.
	 */
	var authenticate = function(req, res, next) {
		auth.authenticate(req, function(err, user) {
			if (err) {
				res.send(err.code || 500, _errorJSON("Authentication required"), {
					'WWW-Authenticate' : 'Basic realm=diretto Task API Node Access'
				});
				logging(req, res);
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
			logging(req, res);
		}
		else if (!req.uriParams.userId || (req.authenticatedUser !== req.uriParams.userId)) {
			res.send(403, _errorJSON("Missing authorization for request"));
			logging(req, res);
		}
		else {
			next();
		}
	};

	//Forward from root to index
	server.get('/', [], function(req, res, next) {
		res.send(303, null,{Location:options.task.external.uri});
	}, [logging]);


	// Index
	server.get('/v2', [], api.index.get, [logging]);

	// Query
	server.post('/v2/query', [ authenticate ], api.query.create, [logging]);
	server.get('/v2/query/common/:type', [ authenticate ], api.query.common, [logging]);
	server.get('/v2/query/stored/:queryId', [ authenticate ], api.query.forward, [logging]);
	server.get('/v2/query/stored/:queryId/cursor/:cursorId', [ authenticate ], api.query.resultPage, [logging]);

	// Task
	server.get('/v2/task/:taskId', [ authenticate ], api.task.get, [logging]);
	server.get('/v2/task/:taskId/snapshot', [ authenticate ], api.task.getSnapshot, [logging]);
	server.post('/v2/tasks', [ authenticate ], api.task.create, [logging]);
	server.post('/v2/tasks/snapshots', [authenticate], api.task.fetchSnapshots, [logging]);
	server.post('/v2/tasks/metadata', [authenticate], api.task.fetchMetadatas, [logging]);
	
	server.get('/v2/tasks/all', [authenticate], api.task.getAllTasks, [logging]);
	server.get('/v2/tasks/since/:date', [authenticate], api.task.getTasksSince, [logging]);
	server.get('/v2/tasks/all/cursor/:taskId', [authenticate], api.task.getTaskPage, [logging]);

	// Submission
	server.post('/v2/task/:taskId/submissions', [ authenticate ], api.submission.create, [logging]);
	server.get('/v2/task/:taskId/submissions', [ authenticate ], api.submission.getAll, [logging]);
	server.get('/v2/task/:taskId/submission/:submissionId', [ authenticate ], api.submission.get, [logging]);

	// Comment
	server.post('/v2/task/:taskId/comments', [ authenticate ], api.comment.create, [logging]);
	server.get('/v2/task/:taskId/comments', [ authenticate ], api.comment.getAll, [logging]);
	server.get('/v2/task/:taskId/comment/:commentId', [ authenticate ], api.comment.get, [logging]);

	// Tag
	server.post('/v2/tags', [ authenticate ], api.basetag.create, [logging]);
	server.get('/v2/tag/:tagId', [ authenticate ], api.basetag.get, [logging]);
	server.post('/v2/tags/multiple', [ authenticate ], api.basetag.multiple, [logging]);

	server.post('/v2/task/:taskId/submission/:submissionId/tags', [ authenticate ], api.tag.append, [logging]);
	server.get('/v2/task/:taskId/submission/:submissionId/tags', [ authenticate ], api.tag.getAll, [logging]);
	server.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId', [ authenticate ], api.tag.get, [logging]);

	server.post('/v2/task/:taskId/tags', [ authenticate ], api.tag.append, [logging]);
	server.get('/v2/task/:taskId/tags', [ authenticate ], api.tag.getAll, [logging]);
	server.get('/v2/task/:taskId/tag/:tagId', [ authenticate ], api.tag.get, [logging]);

	// Vote
	server.get('/v2/task/:taskId/comment/:commentId/votes', [ authenticate ], api.vote.getAll, [logging]);
	server.get('/v2/task/:taskId/comment/:commentId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, [logging]);
	server.del('/v2/task/:taskId/comment/:commentId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, [logging]);
	server.put('/v2/task/:taskId/comment/:commentId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, [logging]);

	server.get('/v2/task/:taskId/votes', [ authenticate ], api.vote.getAll, [logging]);
	server.get('/v2/task/:taskId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, [logging]);
	server.del('/v2/task/:taskId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, [logging]);
	server.put('/v2/task/:taskId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, [logging]);

	server.get('/v2/task/:taskId/tag/:tagId/votes', [ authenticate ], api.vote.getAll, [logging]);
	server.get('/v2/task/:taskId/tag/:tagId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, [logging]);
	server.del('/v2/task/:taskId/tag/:tagId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, [logging]);
	server.put('/v2/task/:taskId/tag/:tagId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, [logging]);

	server.get('/v2/task/:taskId/submission/:submissionId/votes', [ authenticate ], api.vote.getAll, [logging]);
	server.get('/v2/task/:taskId/submission/:submissionId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, [logging]);
	server.del('/v2/task/:taskId/submission/:submissionId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, [logging]);
	server.put('/v2/task/:taskId/submission/:submissionId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, [logging]);

	server.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId/votes', [ authenticate ], api.vote.getAll, [logging]);
	server.get('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId', [ authenticate, authorize ], api.vote.get, [logging]);
	server.del('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId', [ authenticate, authorize ], api.vote.undo, [logging]);
	server.put('/v2/task/:taskId/submission/:submissionId/tag/:tagId/vote/user/:userId/:vote', [ authenticate, authorize ], api.vote.cast, [logging]);

	return {

		bind : function() {
			server.listen(options.task.bind.port || 8006, options.task.bind.ip || "127.0.0.1");
		}

	};

};
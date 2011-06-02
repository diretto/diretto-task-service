var crypto = require('crypto');

var uuid = require('node-uuid');

var validate = {
		task : require('./validations/task.js'),
		basetag : require('./validations/basetag.js'),
		comment : require('./validations/comment.js'),
		submission : require('./validations/submission.js')
};

var assertion = {
		documentExists : require('./assertions/document-exists.js'),
		taskExists : require('./assertions/task-exists.js'),
		tagExists : require('./assertions/tag-exists.js'),
		submissionExists : require('./assertions/submission-exists.js'),
};

var helper = {
		idResource : require('./helper/id-tagged-resource.js'),
};

var CONSTANTS = require('./constants.js');
var ENTRY = CONSTANTS.ENTRY;

require("rfc3339date");

module.exports = function(taskNode) {

	var db = taskNode.db;
	
	var _notImplemented = function(req, res, next) {
		console.log(db);
		res.send(501, {
			error : {
				reason : "Not yet implemented"
			}
		});
		next();
	};
	
// var taskExists = function(taskId, callback){
// if(true){
// callback(null,taskId);
// }
// else{
// callback({error:{reason:"not found"}},null);
// }
// };

	return {

		index : {
			
			get : function(req, res, next) {
				res.send(200, {
					"api" : {
						"name" : "org.diretto.api.external.task",
						"version" : "v2"
					},
					"service" : {
						"name" : taskNode.serverName,
						"version" : taskNode.serverVersion
					},
					"deployment" : {
						"title" : taskNode.options.task.deployment.title || "unnamed",
						"contact" : taskNode.options.task.deployment.contact || "n/a",
						"website" : {
							"link" : {
								"rel" : "self",
								"href" : taskNode.options.task.deployment.website || "n/a"
							}
						}
					},
					"direttoMainServices" : {
						"core" : {
							"link" : {
								"rel" : "self",
								"href" : "http://coreservice/v2"
							}
						}
					}
				});
				return next();
			}
	
		},

		task : {
			
			create : function(req, res, next) {
				validate.task(req.params, res, next, function(data){
					data._id = ENTRY.TASK.PREFIX + "-" +uuid();
					data.creationTime = new Date().toRFC3339UTCString();
					data.creator = req.authenticatedUser;
					data.type = ENTRY.TASK.TYPE;
					data.visible = true;
					data.votes = {up:[], down:[]};
					data.comments = {};
					data.tags = { };
					data.submissions = {};
					db.save(data, function(err, doc){
						console.dir(err);
						console.dir(doc);
						// TODO insert correct URI
						res.send(201, null, {'Location': "bla"});
						next();
					});
				});
				
			},
			
			get: _notImplemented,
			
			getSnapshot: _notImplemented,
			
			fetchSnapshots: _notImplemented
		
		},
		
		
		submission : {
			create : function(req, res, next) {
				validate.submission(req.params, res, next, function(data){
					
					var md5calc = crypto.createHash('md5');
					md5calc.update(data.document.link.href);						
					var submissionId = md5calc.digest('hex');						
					// TODO: extract document ID as submission ID
					
					assertion.taskExists(req.uriParams.taskId, db, function(taskExists, task){
						if(!taskExists){
							res.send(404, {
								   "error":{
									      "reason":"Task not found."
									   }
									},{});
							next();
							return;
						}
						assertion.submissionExists(req.uriParams.taskId,req.uriParams.submissionId, db, function(submissionExists){
							if(submissionExists){
								res.send(409, {
									   "error":{
										      "reason":"Document has already been submitted."
										   }
										},{});
								next();
								return;
							}
							assertion.documentExists(data.document.link.href, function(documentExists, direttoDoc){
								if(!documentExists){
									res.send(404, {
										   "error":{
											      "reason":"Document does not exist."
											   }
											},{});
									next();
									return;
									
								}
								//TODO check task vs direttoDoc
								var submission = {
									id : submissionId,
									creationTime : new Date().toRFC3339UTCString(),
									creator : req.authenticatedUser,
									votes : {
										up : [],
										down :[]
									},
									tags : {},
									document : data.document								
								};
								
								// TODO: improve call
								db.request('POST', "/tasks/_design/tasks/_update/addsubmission/t-"+req.uriParams.taskId, submission, function(err,result){
									console.log(err);
									console.log(result);
									console.log(JSON.stringify(data));
									res.send(201, null, {'Location': "bla"});
									next();
									return;							
								});								
							});
						});
					});
				});
			},
			
			get: _notImplemented,
			
			getAll : _notImplemented
			
		},
		
		
		comment : {		
			
			create : function(req, res, next) {			
				validate.comment(req.params, res, next, function(data){
					assertion.taskExists(req.uriParams, db, function(exists){
						if(!exists){
							res.send(404, {
								   "error":{
									      "reason":"Task not found."
									   }
									},{});
							next();
							return;
						}
						data.id = uuid();
						data.creationTime = new Date().toRFC3339UTCString();
						data.creator = req.authenticatedUser;
						data.votes = {up:[], down:[]};
						
						// TODO: improve call
						db.request('POST', "/tasks/_design/tasks/_update/addcomment/t-"+req.uriParams.taskId, data, function(err,result){
							console.log(err);
							console.log(result);
							console.log(JSON.stringify(data));
							res.send(201, null, {'Location': "bla"});
							next();
							return;							
						});
					});
				});
			},
			
			getAll : _notImplemented,
			
			get: _notImplemented
			
		},
		
		tag : {
			
			create : function(req, res, next) {
				validate.basetag(req.params, res, next, function(data){
					console.log(JSON.stringify(data));
					res.send(201, null, {'Location': "bla"});
					next();
					return;
				});
				
			},
			
			get: _notImplemented
			
		},
		
		
		query : {
			
			create : _notImplemented,
			
			common : _notImplemented,
			
			forward: _notImplemented,
			
			resultPage : _notImplemented

		},
		
		
		vote : {
			
			cast : function(req, res, next) {
				if(!req.uriParams.vote || !req.uriParams.userId || !(req.uriParams.vote === "up" || req.uriParams.vote === "down")){
					res.send(400, null, {});
					next();
					return;
				}

				var p = req.uriParams;

				var data = {};
				data.userId = req.uriParams.userId;
				data.vote = req.uriParams.vote;

				data.resource = helper.idResource(req.uriParams);
				if(data.resource === null){
					res.send(400, null, {});
					next();
					return;
				}
							

				// TODO: improve call
				db.request('POST', "/tasks/_design/tasks/_update/vote/t-"+req.uriParams.taskId, data, function(err,result){
					console.log(err);
					console.log(result);
					console.log(JSON.stringify(data));
					res.send(201, null, {'Location': "bla"});
					next();
					return;							
				});
				
			},
			
			undo : function(req, res, next) {
				var data = {};
				data.userId = req.uriParams.userId;

				data.resource = helper.idResource(req.uriParams);
				if(data.resource === null){
					res.send(400, null, {});
					next();
					return;
				}
				
				db.request('POST', "/tasks/_design/tasks/_update/undovote/t-"+req.uriParams.taskId, data, function(err,result){
					console.log(err);
					console.log(result);
					console.log(JSON.stringify(data));
					res.send(204, null, {'Location': "bla"});
					next();
					return;							
				});
			},
			
			get  : _notImplemented,
			
			getAll  : _notImplemented
			
		},

		
		error : {
			
			notImplemented : _notImplemented
			
		}
	}
	

};

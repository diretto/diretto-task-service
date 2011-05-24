var validate = {
		task : require('./validations/task.js'),
		basetag : require('./validations/basetag.js'),
		comment : require('./validations/comment.js'),
		submission : require('./validations/submission.js')
};

var assertion = {
		documentExists : require('./assertions/document-exists.js'),
		taskExists : require('./assertions/task-exists.js'),
};

var CONSTANTS = require('./constants.js');
var ENTRY = CONSTANTS.ENTRY;

var uuid = require('node-uuid');
require("rfc3339date");

module.exports = function(taskNode) {

	var db = taskNode.db;
	
//	var taskExists = function(taskId, callback){
//		if(true){
//			callback(null,taskId);
//		}
//		else{
//			callback({error:{reason:"not found"}},null);
//		}
//	};

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
					data.tags = {};
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
			get: function(req, res, next) {
				next();
			},
			getSnapshot : function(req, res, next) {
				next();
			},
			fetchSnapshots : function(req, res, next) {
				next();
			}
		
		},
		submission : {
			create : function(req, res, next) {
				validate.submission(req.params, res, next, function(data){
					console.log(JSON.stringify(data));
					res.send(201, null, {'Location': "bla"});
					next();
				});
			}
		},
		comment : {			
			create : function(req, res, next) {			
				validate.comment(req.params, res, next, function(data){
					assertion.taskExists(req.uriParams, db, function(exists){
						if(exists){
							
						}
						else{
							res.send(404, {
								   "error":{
									      "reason":"Task not found."
									   }
									},{});
							next();
						}
						data.id = uuid();
						data.creationTime = new Date().toRFC3339UTCString();
						data.creator = req.authenticatedUser;
						data.votes = {up:[], down:[]};
						
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
			}
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
		},
		query : {},
		
		vote : {
			cast : function(req, res, next) {
				if(!req.uriParams.vote || !req.uriParams.userId || !(req.uriParams.vote === "up" || req.uriParams.vote === "down")){
					res.send(400, null, {});
					next();
					return;
				}

				var p =req.uriParams;

				var data = {};
				data.userId = req.uriParams.userId;
				data.vote = req.uriParams.vote;

				if(p.taskId && p.submissionId && p.tagId){
					data.resource = {
							taskId: p.taskId,
							submissionId: p.submissionId,
							tagId: p.tagId,
					} ;
				}
				else if(p.taskId && p.submissionId){
					data.resource = {
							taskId: p.taskId,
							submissionId: p.submissionId
					} ;
				}
				else if(p.taskId && p.tagId){
					data.resource = {
							taskId: p.taskId,
							tagId: p.tagId
					} ;
				}
				else if(p.taskId && p.commentId){
					data.resource = {
							taskId: p.taskId,
							commentId: p.commentId
					} ;
				}
				else if(p.taskId){
					data.resource = {
							taskId: p.taskId
					} ;
				}
				else{
					res.send(400, null, {});
					next();
					return;
				}

				db.request('POST', "/tasks/_design/tasks/_update/vote/t-"+req.uriParams.taskId, data, function(err,result){
					console.log(err);
					console.log(result);
					console.log(JSON.stringify(data));
					res.send(201, null, {'Location': "bla"});
					next();
					return;							
				});
				
			},
//			undo : function(req, res, next) {
//				
//			},
//			get : function(req, res, next) {
//				
//			},
//			getAll : function(req, res, next) {
//				
//			},
		},

		
		error : {
			notImplemented : function(req, res, next) {
				// console.log(req.uriParams);
				// console.dir(req._url);
				// console.dir(req.params);
				console.log(db);
				db.get("863780aac3c39f10cee2f01fd0000f17", function(err, doc) {
					if (err) {
						console.dir(err);
					}
					else {
						console.dir(doc);
					}

				});
				res.send(501, {
					error : {
						reason : "Not yet implemented"
					}
				});
			},
		}
	

	}
	

};

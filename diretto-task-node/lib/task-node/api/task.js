require("rfc3339date");

var barrierpoints = require('barrierpoints');
/**
 * Task handler
 * 
 * @author Benjamin Erb
 */
module.exports = function(h) {

	var TITLE_MIN_LENGTH = 6;
	var TITLE_MAX_LENGTH = 250;
	var DESCRIPTION_MIN_LENGTH = 0;
	var DESCRIPTION_MAX_LENGTH = 4000;
	
	var SNAPSHOT_LIMIT_PER_QUERY = 100;
	
	var PAGINATION_SIZE = 20;

	var validateTask = function(data, response, next, callback) {
		var failed = false;
		var fail = function(msg) {
			response.send(400, {
				error : {
					reason : "Invalid task entity. " + (msg || "Please check your entity structure.")
				}
			});

			failed = true;
			next();
			return;
		};

		// Check main attributes
		if (!data || !data.constraints || !data.constraints.time || !data.constraints.location || !data.title || !data.description) {
			fail("Attributes are missing.");
			return;
		}

		// Check constraints
		if (!data.constraints || !data.constraints.time || !data.constraints.time.start || !data.constraints.time.end || !data.constraints.location || !data.constraints.location.bbox) {
			fail("Constraints are missing or invalid");
			return;
		}
		else {
			// Check dates
			try {
				var start = Date.parse(data.constraints.time.start);
				var end = Date.parse(data.constraints.time.end);
				if (start > end) {
					fail("Invalid date/time range.");
					return;
				}
			}
			catch (e) {
				fail("Invalid date/time values.");
				return;
			}

			// Check location
			if (!(typeof (data.constraints.location.bbox) == 'object' && data.constraints.location.bbox.length && data.constraints.location.bbox.length === 4)) {
				fail("Invalid location values.");
				return;
			}
			else {
				// TODO: check coordinates
			}
		}

		// Check text
		if (!(typeof (data.description) == 'string' && data.description.length >= DESCRIPTION_MIN_LENGTH && data.description.length <= DESCRIPTION_MAX_LENGTH)) {
			fail("Invalid description.");
			return;
		}
		if (!(typeof (data.title) == 'string' && data.title.length >= TITLE_MIN_LENGTH && data.title.length <= TITLE_MAX_LENGTH)) {
			fail("Invalid title.");
			return;
		}

		if (!failed) {
			callback({
				"constraints" : {
					"time" : {
						"start" : data.constraints.time.start,
						"end" : data.constraints.time.end
					},
					"location" : {
						"bbox" : data.constraints.location.bbox
					}
				},
				"title" : data.title,
				"description" : data.description
			});
		}
	};

	var validateSnapshotRequestList = function(data, response, next, callback) {
		var failed = false;
		var fail = function(msg) {
			response.send(400, {
				error : {
					reason : "Invalid task list. " + (msg || "Please check your list structure.")
				}
			});

			failed = true;
			next();
			return;
		};

		// Check main attributes
		if (!data || !data.tasks || !data.tasks.length || data.tasks.length < 1) {
			fail("Task list is missing.");
			return;
		}
		
		else {
			
			var count = 0; 
			
			var entries = {};
			data.tasks.forEach(function(taskUri) {
				// TODO: parse URI
				console.log(h.options.task.external.uri);
				console.log(taskUri);
				console.log(taskUri.substring(0, h.options.task.external.uri.length));
				if(taskUri.substring(0, h.options.task.external.uri.length) === h.options.task.external.uri){
					entries[taskUri] = taskUri.substr((h.options.task.external.uri+"/task/").length).split("/")[0];
					count++;
				}
				else{
					entries[taskUri] = null;	
				}
				console.log(entries[taskUri]);
			});
			
			//check for max snapshots allowed
			if(count > SNAPSHOT_LIMIT_PER_QUERY){
				fail("Task list is missing.");
				return;
			}		
			
			if (!failed) {
				callback(entries);
			}
		}
	};

	var buildSnapshot = function(taskId, callback) {
		h.db.view('tasks/tasks', {
			key : taskId
		}, function(err, dbRes) {
			if (dbRes && dbRes.length === 1) {
				var etag = dbRes[0].value.etag;
				var result = dbRes[0].value.content;

				var successCallback = function() {
					callback(null, result, etag);
				};

				var b = barrierpoints(3, successCallback);

				// Fetch comments
				h.db.view('tasks/comments', {
					startkey : [ taskId ],
					endkey : [ taskId, {} ]
				}, function(err, dbRes) {
					if (dbRes) {
						var list = [];
						if (dbRes.length > 0) {
							dbRes.forEach(function(viewItem) {
								list.push(viewItem.content);
							});
						}
						result.comments.list = list;
						b.submit();
					}
					else {
						b.abort(function() {
							callback({
								"error" : "not found",
								"status" : 500
							});
						});
					}
				});

				// Fetch submissions
				h.db.view('tasks/submissions', {
					startkey : [ taskId ],
					endkey : [ taskId, {} ]
				}, function(err, dbRes) {
					if (dbRes) {
						var list = [];
						if (dbRes.length > 0) {
							dbRes.forEach(function(viewItem) {
								list.push(viewItem.content);
							});
						}
						result.submissions.list = list;
						b.submit();
					}
					else {
						b.abort(function() {
							callback({
								"error" : "not found",
								"status" : 500
							});
						});
					}
				});
				
				// Fetch tags
				h.db.view('tasks/tags', {
					startkey : [ "task",taskId ],
					endkey : [ "task",taskId, {} ]
				}, function(err, dbRes) {
					if (dbRes) {
						var list = [];
						if (dbRes.length > 0) {
							dbRes.forEach(function(viewItem) {
								list.push(viewItem.content);
							});
						}
						result.tags.list = list;
						b.submit();
					}
					else {
						b.abort(function() {
							callback({
								"error" : "not found",
								"status" : 500
							});
						});
					}
				});

			}
			else if (dbRes) {
				callback({
					"error" : "not found",
					"status" : 404
				});
			}
			else {
				callback({
					"error" : "not found",
					"status" : 500
				});
			}
		});
	};

	var buildMetaData = function(taskId, callback){
		h.db.view('tasks/tasks', {
			key : taskId
		}, function(err, dbRes) {
			if (dbRes && dbRes.length === 1) {
				
				callback(null, dbRes[0].value.content,dbRes[0].value.etag);
			}
			else if (dbRes) {
				callback({
					"error" : "not found",
					"status" : 404
				});
			}
			else {
				callback({
					"error" : "not found",
					"status" : 500
				});
			}
		});
	};
	
	
	var buildMultiple = function(taskIds, fetchFunction, callback) {
		var results = {};
		
		console.dir(taskIds);

		var successCallback = function() {
			callback(null, results);
		};

		var i = 0;
		for (id in taskIds) {
			if (taskIds.hasOwnProperty(id))
			{
				if(taskIds[id] !== null){
					i++;
				}
				else{
					results[id] = {
							"error" : {
								message : "not found"
							}
					};
				}					
			}		
		}
		if(i === 0){
			successCallback();
			return;
		}
		else{
			
			var b = barrierpoints(i, successCallback);
	
			var fetchTask = function(uri, id) {
				fetchFunction(id, function(err, result) {
					
					var uri = h.util.uri.task(id);
					
					if (err) {
						results[uri] = {
								"error" : {
									message : err.error || "Error"
								}
						};
					}
					else {
						results[uri] = result;
					}
					console.log(id);
					b.submit();
				});
			}
	
			for (id in taskIds) {
				if (taskIds.hasOwnProperty(id) && taskIds[id] !== null) {
					console.log(id);
					fetchTask(id, taskIds[id]);
				}
			}
		}
	};
	

	return {

		create : function(req, res, next) {

			validateTask(req.params, res, next, function(data) {
				var taskId = h.uuid();

				data._id = h.CONSTANTS.TASK.PREFIX + "-" + taskId;
				data.creationTime = new Date().toRFC3339UTCString();
				data.creator = req.authenticatedUser;
				data.type = h.CONSTANTS.TASK.TYPE;
				data.visible = true;
				data.votes = {
					up : [],
					down : []
				};
				data.comments = {};
				data.tags = {};
				data.submissions = {};

				var resourceUri = h.util.uri.task(taskId);

				h.db.save(data._id, data, function(err, dbRes) {
					if (err) {
						res.send(500, {
							"error" : {
								"reason" : "Internal server error. Please try again later."
							}
						}, {});
						return next();
					}
					else {
						res.send(201, null, {
							'Location' : resourceUri
						});
						return next();
					}
				});

			});

		},

		get : function(req, res, next) {
			buildMetaData(req.uriParams.taskId, function(err, result, etag){
				if (err) {
					res.send(err.status || 500, null, {});
					next();
				}
				else {
					res.send(200, result, {
						"Etag" : "\""+etag+"\""
					});
					next();
				}
			});
		},

		getSnapshot : function(req, res, next) {
			buildSnapshot(req.uriParams.taskId, function(err, result, etag) {
				if (err) {
					res.send(err.status || 500, null, {});
					next();
				}
				else {
					res.send(200, result, {
						"Etag" : "\""+etag+"\""
					});
					next();
				}
			});
		},

		fetchSnapshots : function(req, res, next) {
			validateSnapshotRequestList(req.params, res, next, function(data) {
				buildMultiple(data, buildSnapshot, function(err, results) {
					if (err) {
						res.send(err.status || 500, null, {});
						next();
					}
					else {
						res.send(200, {
							"results" : results
						}, {});
						next();
					}
				});
			});
		},
		
		fetchMetadatas : function(req, res, next) {
			validateSnapshotRequestList(req.params, res, next, function(data) {
				buildMultiple(data, buildMetaData, function(err, results) {
					if (err) {
						res.send(err.status || 500, null, {});
						next();
					}
					else {
						res.send(200, {
							"results" : results
						}, {});
						next();
					}
				});
			});
		},
		
		getAllTasks : function(req, res, next){
			h.db.view('tasks/tasksbydate', {
				limit : 1
			}, function(err,dbRes){
				if(err){
					res.send(500);
				}
				else{
					if (dbRes.rows.length === 0) {
						res.send(204);
					}
					else {
						res.send(303, null,{
							'Location' : h.util.uri.taskPage(dbRes.rows[0].key[1])
						});
					}
				}
			});
		},

		getTasksSince : function(req, res, next){
			console.log(Date.parseRFC3339(req.uriParams.date));
			if(Date.parseRFC3339(req.uriParams.date) === undefined){
				res.send(400, {
					   "error":{
						      "reason":"Invalid date."
						   }
						},{});
			}
			else{
				h.db.view('tasks/tasksbydate', {
					limit : 1,
					startkey : [req.uriParams.date]
				}, function(err,dbRes){
					if(err){
						res.send(500);
					}
					else{
						if (dbRes.rows.length === 0) {
							res.send(204);
						}
						else {
							res.send(303, null, {
								'Location' :  h.util.uri.taskPage(dbRes.rows[0].key[1])
							});
						}
					}
				});
			}
		},

		getTaskPage : function(req, res, next){
			
			//Get task
			h.db.view('tasks/tasks', {
				key : req.uriParams.taskId
			}, function(err, dbRes) {
				if (dbRes && dbRes.length === 1) {
					
					var key = [dbRes[0].value.content.task.creationTime, req.uriParams.taskId];
					
					h.util.viewPaginator.getPage('tasks/tasksbydate', key, PAGINATION_SIZE, false, function(row){
						return row.key[1];
					}, function(err, result){
						if(err){
							res.send(500);
						}
						else{
							
							var createLink = function(uri, rel){
								if(rel === undefined || rel === null){
									rel = "self"
								}
								return {
									"rel" : rel,
									"href" : uri
								}
							};							
							
							var createTaskList = function(taskId){
								return {
									"task" : {
										"link" : createLink(h.util.uri.task(taskId))
									} 
								};
							};							
							
							var list = result.list.map(createTaskList);
							
							var related = [];
							["next", "previous"].forEach(function(e){
								if(result[e]){
									related.push({
										"link" : createLink(h.util.uri.taskPage(result[e]), e)
									});
								}
							});
							
							var headers = {};
							if(result.etag){
								headers["Etag"] = '"'+result.etag+'"';
							}
							
							res.send(200, {
								"page" : {
									"link" : createLink(h.util.uri.taskPage(req.uriParams.taskId))
								},
								"list" :  list,
								"related" : related
							},headers);
						}
					});					
					
				}
				else if (dbRes) {
					res.send(404, {
						   "error":{
							      "reason":"Cursor task not found."
							   }
							},{});
					next();
					return;
				}
				else {
					res.send(500, null,{});
					next();
					return;
				}
			});	
		}
	}
};
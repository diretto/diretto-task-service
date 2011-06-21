/**
 * Tags
 * 
 * @author Benjamin Erb
 */
module.exports = function(h) {

	var validateAppendTag = function(data, response, next, callback) {
		var tagId = "";
		var failed = false;
		var fail = function(msg) {
			response.send(400, {
				error : {
					reason : "Invalid tag entity. " + (msg || "Please check your entity structure.")
				}
			});

			failed = true;
			next();
			return;
		};

		// Check document
		if (!data.baseTag || !data.baseTag.link || !data.baseTag.link.rel || !data.baseTag.link.href) {
			fail("Document invalid.");
			return;
		}
		else {
			if (!(typeof (data.baseTag.link.rel) == 'string')) {
				fail("Invalid link relation.");
				return;
			}
			if (!(typeof (data.baseTag.link.href) == 'string' && data.baseTag.link.href.substr(0, 4) === "http")) {
				fail("Invalid link hyperref.");
				return;
			}

			if (data.baseTag.link.href.substring(0, h.options.task.external.uri.length) === h.options.task.external.uri) {
				tagId = data.baseTag.link.href.substr((h.options.task.external.uri + "/tag/").length).split("/")[0];
			}
			else {
				fail("Invalid tag link.");
				return;
			}
		}

		if (!failed) {
			callback({
				"tagId" : tagId
			});
		}
	};

	var idTaggedResource = function(req, res, next, callback) {
		if (req.uriParams.submissionId && req.uriParams.taskId) {
			callback({
				taskId : req.uriParams.taskId,
				submissionId : req.uriParams.submissionId
			});
		}
		else if (req.uriParams.taskId) {
			callback({
				taskId : req.uriParams.taskId
			});
		}
		else {
			res.send(404, {
				"error" : {
					"reason" : "No tagable resource found."
				}
			}, {});
			return next();
		}
	};

	return {

		append : function(req, res, next) {

			// Identify Resource: task or submission?

			idTaggedResource(req, res, next, function(resource) {

				// Validate request entity and extract tag id
				validateAppendTag(req.params, res, next, function(valData) {

					// TODO
					var tagId = valData.tagId;

					var appendTag = function(value) {

						var data = {};
						data.baseTagId = tagId;
						data.resource = resource;
						data.value = value;
						data.creationTime = new Date().toRFC3339UTCString();
						data.creator = req.authenticatedUser;
						data.votes = {
							up : [],
							down : []
						};

						h.util.updateHandler.retryable("tasks/appendtag", "t-" + req.uriParams.taskId, data, function(err, result) {
							if (err) {
								if (err.error && err.error === 'duplicate') {
									res.send(202, null, {});
									return next();
								}
								else if (err.error && err.error === 'not found') {
									res.send(404, {
										"error" : {
											"reason" : "Resource not found."
										}
									}, {});
									return next();
								}
								else {
									res.send(500, {
										"error" : {
											"reason" : "Internal server error. Please try again later."
										}
									}, {});
									return next();
								}
							}
							else {
								if (data.resource.submissionId) {
									res.send(201, null, {
										'Location' : h.util.uri.taggedSubmission(data.resource.taskId, data.resource.submissionId, tagId)
									});
									return next();
								}
								else {
									res.send(201, null, {
										'Location' : h.util.uri.taggedTask(data.resource.taskId, tagId)
									});
									return next();
								}
							}

						});

					};

					// get tag, check for existence
					h.db.view('tasks/basetags', {
						key : tagId
					}, function(err, dbRes) {
						if (dbRes && dbRes.length === 1) {
							// If found, call append
							appendTag(dbRes[0].value.content.baseTag.value);
						}
						else if (dbRes) {
							res.send(404, null, {});
							next();
						}
						else {
							res.send(500, null, {});
							next();
						}
					});
				});

			});

		},

		get : function(req, res, next) {

			// Identify Resource: task or submission?
			idTaggedResource(req, res, next, function(resource) {
				
				var key;
				if(resource.submissionId){
					key = ["submission", req.uriParams.taskId,req.uriParams.submissionId,req.uriParams.tagId];
				}
				else{
					key = ["task", req.uriParams.taskId,req.uriParams.tagId];
				}
								
				h.db.view('tasks/tags', {
					key : key
				}, function(err, dbRes) {
					if(dbRes && dbRes.length === 1){
						res.send(200, dbRes[0].value.content, {
							"Etag" : "\""+dbRes[0].value.etag+"\""
						});
						next();
					}
					else if (dbRes) {
						res.send(404, null, {});
						next();
					}
					else {
						res.send(500, null, {});
						next();
					}
				});
			});
		},

		getAll : function(req, res, next) {

			// Identify Resource: task or submission?
			idTaggedResource(req, res, next, function(resource) {
				var startkey;
				var endkey;
				var href;
				if(resource.submissionId){
					startkey = ["submission", req.uriParams.taskId,req.uriParams.submissionId];
					endkey = ["submission", req.uriParams.taskId,req.uriParams.submissionId,{}];
					href = h.util.uri.submission(req.uriParams.taskId, req.uriParams.submissionId)+"/tags";
				}
				else{
					startkey = ["task", req.uriParams.taskId];
					endkey = ["task", req.uriParams.taskId,{}];
					href = h.util.uri.task(req.uriParams.taskId)+"/tags";
				}
				
				h.db.view('tasks/tags', {
					startkey : startkey,
					endkey  : endkey
				}, function(err, dbRes) {
					if(dbRes){
						var list =  [];
						var headers = {};
						
						var send = function(){
							res.send(200, {
								"tags" : {
									"list" : list,
									"link" : {
										"rel" : "self",
										"href" : href
									}							
								} 
							}, headers);
							next();
						};
							
						if(dbRes.length === 0){
							h.db.head( "t-"+req.uriParams.taskId, function(err, headers,code) {
								if(!code || code !== 200){
									res.send(404, null, {});
									return next();
								}
								else{
									send();
								}
							});
						}
						else{
							headers['Etag'] = "\""+dbRes[0].value.etag+"\"";
							dbRes.forEach(function(viewItem){
								list.push(viewItem.content);
							});
							send();
						}
					}
					else {
						res.send(500, null, {});
						next();
					}
				});
				
				
			});
		}

	};
};
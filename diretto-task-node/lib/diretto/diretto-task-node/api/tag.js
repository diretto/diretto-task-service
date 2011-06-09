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
			
			if(data.baseTag.link.href.substring(0, h.options.task.external.uri.length) === h.options.task.external.uri){
				tagId = data.baseTag.link.href.substr((h.options.task.external.uri+"/tag/").length).split("/")[0];
			}
			else{
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
	
	return {
		
		append  : function(req, res, next) {
			
			//Identify Resource: task or submission?
			var resource;
			if(req.uriParams.submissionId && req.uriParams.taskId){
				resource = {
						taskId : 	req.uriParams.taskId,
						submissionId : 	req.uriParams.submissionId
				};
			}
			else if(req.uriParams.taskId){
				resource = {
						taskId : 	req.uriParams.taskId
				};
			}
			else{
				res.send(404, {
					"error" : {
						"reason" : "No tagable resource found."
					}
				}, {});
				return next();
			}
		
			//Validate request entity and extract tag id
			validateAppendTag(req.params, res, next, function(valData) {
				
				// TODO
				var tagId = valData.tagId;

				var appendTag = function(value){

					var data = {};
					data.baseTagId = tagId;
					data.resource = resource;
					data.value = value;
					data.creationTime = new Date().toRFC3339UTCString();
					data.creator = req.authenticatedUser;
					data.votes = {up:[], down:[]};
					
//					console.dir(data);
//					return;
					
					h.util.updateHandler.retryable("tasks/appendtag", "t-"+req.uriParams.taskId, data, function(err,result){
						if(err){
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
						else{
							if(data.resource.submissionId){
								res.send(201, null, {'Location': h.util.uri.taggedSubmission(data.resource.taskId, data.resource.submissionId, tagId)});
								return next();		
							}
							else{
								res.send(201, null, {'Location': h.util.uri.taggedTask(data.resource.taskId, tagId)});
								return next();		
							}
						}
											
					});
					
				};
				
				//get tag, check for existence
				h.db.view('tasks/basetags', {
					key : tagId
				}, function(err, dbRes) {
					if(dbRes && dbRes.length === 1){
						//If found, call append
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
			

				
		},

		get  : h.responses.notImplemented,
		
		getAll  : h.responses.notImplemented

	};
};
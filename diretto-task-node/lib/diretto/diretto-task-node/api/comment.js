require("rfc3339date");

/**
 * Comment handler
 * 
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	var COMMENT_MIN_LENGTH = 3;
	var COMMENT_MAX_LENGTH = 1000;
	
	var validateComment = function(data, response, next, callback) {
		var failed = false;
		var fail = function(msg) {
			response.send(400, {
				error : {
					reason : "Invalid comment entity. " + (msg || "Please check your entity structure.")
				}
			});

			failed = true;
			next();
			return;
		};

		// Check main attributes
		if (!data || !data.content) {
			fail("Attributes are missing.");
			return;
		}
		
		//Check tag
		if (!(typeof (data.content) == 'string' && data.content.length >= COMMENT_MIN_LENGTH && data.content.length <= COMMENT_MAX_LENGTH)) {
			fail("Invalid comment.");
			return;
		}
		
		if (!failed) {
			callback({
				"content" : data.content
			});
		}
	};
	
	return  {		
		
		create : function(req, res, next) {			
			validateComment(req.params, res, next, function(data){
				h.assertion.taskExists(req.uriParams, h.db, function(exists){
					if(!exists){
						res.send(404, {
							   "error":{
								      "reason":"Task not found."
								   }
								},{});
						next();
						return;
					}
					data.id = h.uuid();
					data.creationTime = new Date().toRFC3339UTCString();
					data.creator = req.authenticatedUser;
					data.votes = {up:[], down:[]};
					
					
					h.util.updateHandler.retryable('POST', "/tasks/_design/tasks/_update/addcomment/t-"+req.uriParams.taskId, data, function(err,result){
						if(err){
							if (err.error && err.error === 'duplicate') {
								res.send(409, {
									"error" : {
										"reason" : "Comment already exists."
									}
								}, {});
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
							res.send(201, null, {'Location': h.util.uri.comment(req.uriParams.taskId, data.id)});
							return next();		
						}
											
					});
					

				});
			});
		},
		
		getAll : h.responses.notImplemented,
		
		get: h.responses.notImplemented
		
	};
};
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
					
					h.util.updateHandler.retryable("tasks/addcomment", "t-"+req.uriParams.taskId, data, function(err,result){
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
		
		getAll : function(req, res, next) {
			h.db.view('tasks/comments', {
				startkey : [req.uriParams.taskId],
				endkey  : [req.uriParams.taskId,{}]
			}, function(err, dbRes) {
				if(dbRes){
					var list =  [];
					var headers = {};
					
					var send = function(){
						res.send(200, {
							"comments" : {
								"list" : list,
								"link" : {
									"rel" : "self",
									"href" : h.util.uri.task(req.uriParams.taskId)
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
						headers['Etag'] = dbRes[0].value.etag;
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
		},	
		
		get: function(req, res, next) {
			h.db.view('tasks/comments', {
				key : [req.uriParams.taskId,req.uriParams.commentId]
			}, function(err, dbRes) {
				if(dbRes && dbRes.length === 1){
					res.send(200, dbRes[0].value.content, {
						"Etag" : dbRes[0].value.etag
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
		}			
			
		
	};
};
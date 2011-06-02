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
				h.assertion.taskExists(req.uriParams, db, function(exists){
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
					h.db.request('POST', "/tasks/_design/tasks/_update/addcomment/t-"+req.uriParams.taskId, data, function(err,result){
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
		
		getAll : h.responses.notImplemented,
		
		get: h.responses.notImplemented
		
	};
};
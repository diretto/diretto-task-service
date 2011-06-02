require("rfc3339date");

/**
 *
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	return  {		
		
		create : function(req, res, next) {			
			h.validate.comment(req.params, res, next, function(data){
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
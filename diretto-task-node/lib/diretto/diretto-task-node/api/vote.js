/**
 *
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	var identifyResource = function(p) {
		
		if(p.taskId && p.submissionId && p.tagId){
			return {
					taskId: p.taskId,
					submissionId: p.submissionId,
					tagId: p.tagId,
			} ;
		}
		else if(p.taskId && p.submissionId){
			return {
					taskId: p.taskId,
					submissionId: p.submissionId
			} ;
		}
		else if(p.taskId && p.tagId){
			return  {
					taskId: p.taskId,
					tagId: p.tagId
			} ;
		}
		else if(p.taskId && p.commentId){
			return  {
					taskId: p.taskId,
					commentId: p.commentId
			} ;
		}
		else if(p.taskId){
			return {
					taskId: p.taskId
			};
		}
		else{
			return null;
		}
	};
	
	return {
		
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

			data.resource = identifyResource(req.uriParams);
			if(data.resource === null){
				res.send(400, null, {});
				next();
				return;
			}
						
			h.util.updateHandler.retryable("tasks/vote", "t-"+req.uriParams.taskId, data, function(err,result){
				if (err) {
					if (err.error && err.error === 'not found') {
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
					res.send(202, null, {});
					return next();
				}						
			});
			
		},
		
		undo : function(req, res, next) {
			var data = {};
			data.userId = req.uriParams.userId;

			data.resource = identifyResource(req.uriParams);
			if(data.resource === null){
				res.send(400, null, {});
				next();
				return;
			}
			
			h.util.updateHandler.retryable("tasks/undovote", "t-"+req.uriParams.taskId, data, function(err,result){
				if (err) {
					if (err.error && err.error === 'not found') {
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
					res.send(204, null, {});
					return next();
				}
			});
			
		},
		
		get  : h.responses.notImplemented,
		
		getAll  : h.responses.notImplemented,
		
	};
};
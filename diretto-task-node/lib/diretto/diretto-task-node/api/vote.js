/**
 *	Vote Handler
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
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

			data.resource = h.util.identifyResource(req.uriParams);
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

			data.resource = h.util.identifyResource(req.uriParams);
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
		
		get  : function(req, res, next) {
			var p = h.util.identifyResource(req.uriParams);
			
			var key;

			if(p.taskId && p.submissionId && p.tagId){
				//TODO:
			}
			else if(p.taskId && p.submissionId){
				key = [p.taskId, p.submissionId];
			}
			else if(p.taskId && p.tagId){
				//TODO:
			}
			else if(p.taskId && p.commentId){
				key = [p.taskId, p.commentId];
			}
			else if(p.taskId){
				key = ["task",p.taskId];
			}
			
			if(key){
				key.push(req.uriParams.userId);
				h.db.view("tasks/singlevotes", {
					key : key
				}, function(err, dbRes) {
					if (dbRes && dbRes.length === 1) {
						res.send(200, {"vote":dbRes[0].value}, {});
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
			else{
				res.send(404, null, {});
				next();
				return;
			}		
		},
		
		getAll  : function(req, res, next) {
			var p = h.util.identifyResource(req.uriParams);
			
			var view;
			var key;
			var type;

			if(p.taskId && p.submissionId && p.tagId){
				view = "tasks/tags";
				key = ["submission", p.taskId, p.submissionId, p.tagId];
				type = "tag";
			}
			else if(p.taskId && p.submissionId){
				view = "tasks/submissions";
				key = [p.taskId, p.submissionId];
				type = "submission";
			}
			else if(p.taskId && p.tagId){
				view = "tasks/tags";
				key = ["task", p.taskId, p.tagId];
				type = "tag";
			}
			else if(p.taskId && p.commentId){
				view = "tasks/comments";
				key = [p.taskId, p.commentId];
				type = "comment";
			}
			else if(p.taskId){
				view = "tasks/tasks";
				key = p.taskId;
				type = "task";
			}
			
			if(view && key){
				h.db.view(view, {
					key : key
				}, function(err, dbRes) {
					if (dbRes && dbRes.length === 1) {
						res.send(200, dbRes[0].value.content[type].votes, {
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
			else{
				res.send(404, null, {});
				next();
				return;
			}
		}
		
	};
};
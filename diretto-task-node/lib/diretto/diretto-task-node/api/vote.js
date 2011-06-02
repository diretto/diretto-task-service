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
						

			// TODO: improve call
			h.db.request('POST', "/tasks/_design/tasks/_update/vote/t-"+req.uriParams.taskId, data, function(err,result){
				console.log(err);
				console.log(result);
				console.log(JSON.stringify(data));
				res.send(201, null, {'Location': "bla"});
				next();
				return;							
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
			
			h.db.request('POST', "/tasks/_design/tasks/_update/undovote/t-"+req.uriParams.taskId, data, function(err,result){
				console.log(err);
				console.log(result);
				console.log(JSON.stringify(data));
				res.send(204, null, {'Location': "bla"});
				next();
				return;							
			});
		},
		
		get  : h.responses.notImplemented,
		
		getAll  : h.responses.notImplemented,
		
	};
};
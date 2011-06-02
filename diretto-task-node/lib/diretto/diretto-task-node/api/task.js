require("rfc3339date");

/**
 *
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	return {
		
		create : function(req, res, next) {
			h.validate.task(req.params, res, next, function(data){
				data._id = ENTRY.TASK.PREFIX + "-" +uuid();
				data.creationTime = new Date().toRFC3339UTCString();
				data.creator = req.authenticatedUser;
				data.type = ENTRY.TASK.TYPE;
				data.visible = true;
				data.votes = {up:[], down:[]};
				data.comments = {};
				data.tags = { };
				data.submissions = {};
				h.db.save(data, function(err, doc){
					console.dir(err);
					console.dir(doc);
					// TODO insert correct URI
					res.send(201, null, {'Location': "bla"});
					next();
				});
			});
			
		},
		
		get: h.responses.notImplemented,
		
		getSnapshot: h.responses.notImplemented,
		
		fetchSnapshots: h.responses.notImplemented,
	
	}
};
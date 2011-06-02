
var uuid = require('node-uuid');


module.exports = function(db, options) {

	//a helper objects that aggregates useful stuff for actual API call handling methods
	var apiHelper = {
			
			CONSTANTS : {
				TASK : {
					TYPE : 'task',
					PREFIX : 't'
				},
				BASETAG : {
					TYPE : 'basetag',
					PREFIX : 'b'
				}
			},
			
			options : options,
			
			db : db,
			
			validate : {
					task : require('./validations/task.js'),
					basetag : require('./validations/basetag.js'),
					comment : require('./validations/comment.js'),
					submission : require('./validations/submission.js')
			},
			
			assertion : {
					documentExists : require('./assertions/document-exists.js'),
					taskExists : require('./assertions/task-exists.js'),
					tagExists : require('./assertions/tag-exists.js'),
					submissionExists : require('./assertions/submission-exists.js'),
			},
			
			util : {
					identifyResource : require('./helper/id-tagged-resource.js'),
			},
							
			responses : {
				
				notImplemented : function(req, res, next) {
					res.send(501, {
						error : {
							reason : "Not yet implemented"
						}
					});
					next();
				},
				
				notFound : function(req, res, next) {
					res.send(404, {
						error : {
							reason : "Not found"
						}
					});
					next();
				},
			}
	};
	
	//Return binding by invoking the actual handlers, passing the helper object
	return {
		
		comment : require('./api/comment.js')(apiHelper),
		
		error : require('./api/error.js')(apiHelper),
		
		index : require('./api/index.js')(apiHelper),
		
		query : require('./api/query.js')(apiHelper),
		
		submission : require('./api/submission.js')(apiHelper),
		
		tag : require('./api/tag.js')(apiHelper),
		
		task : require('./api/task.js')(apiHelper),
		
		vote : require('./api/vote.js')(apiHelper),
	}
	

};

var http = require('http');

module.exports = function(taskId, db, callback) {

	
	callback(true);
	
//	//TODO: check for task existence
//	db.head("t-"+taskId, function(err, headers,code) {
//		if(code && code === 200){
//			callback(true);
//		}
//		else {
//			callback(false);
//		}
//	});

};

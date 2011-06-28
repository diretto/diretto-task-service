var http = require('http');

module.exports = function(tagDocId, db, callback) {
	
	db.head(tagDocId, function(err, headers,code) {
		if(code && code === 200){
			callback(true);
		}
		else {
			callback(false);
		}
	});
	
};
var http = require('http');

module.exports = function(tagDocId, db, callback) {
	db.get(tagDocId, function(err, doc) {
		if (doc) {
			callback(true);
		}
		callback(false);
	});
};
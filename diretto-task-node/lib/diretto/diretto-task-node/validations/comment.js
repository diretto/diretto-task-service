var COMMENT_MIN_LENGTH = 3;
var COMMENT_MAX_LENGTH = 1000;

module.exports = function(data, response, next, callback) {
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
	if (!(typeof (data.content) == 'string' && data.content.length >= TAG_MIN_LENGTH && data.content.length <= TAG_MAX_LENGTH)) {
		fail("Invalid comment.");
		return;
	}
	
	if (!failed) {
		callback({
			"content" : data.content
		});
	}
}

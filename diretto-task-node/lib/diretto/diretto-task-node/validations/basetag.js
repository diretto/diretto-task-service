var TAG_MIN_LENGTH = 2;
var TAG_MAX_LENGTH = 64;

module.exports = function(data, response, next, callback) {
	var failed = false;
	var fail = function(msg) {
		response.send(400, {
			error : {
				reason : "Invalid tag entity. " + (msg || "Please check your entity structure.")
			}
		});

		failed = true;
		next();
		return;
	};

	// Check main attributes
	if (!data || !data.value) {
		fail("Attributes are missing.");
		return;
	}
	
	//Check tag
	if (!(typeof (data.value) == 'string' && data.value.length >= TAG_MIN_LENGTH && data.value.length <= TAG_MAX_LENGTH)) {
		fail("Invalid tag.");
		return;
	}
	
	if (!failed) {
		callback({
			"value" : data.value
		});
	}
}

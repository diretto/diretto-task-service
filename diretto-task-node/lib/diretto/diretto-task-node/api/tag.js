var crypto = require('crypto');

/**
 * Tag handler
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	var TAG_MIN_LENGTH = 2;
	var TAG_MAX_LENGTH = 64;
	
	var validateBaseTag = function(data, response, next, callback) {
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
	};
	
	return {
		
		create : function(req, res, next) {
			validateBaseTag(req.params, res, next, function(data){
				console.log(JSON.stringify(data));
				res.send(201, null, {'Location': "bla"});
				next();
				return;
			});
			
		},
		
		get: h.responses.notImplemented,
		
	};
};
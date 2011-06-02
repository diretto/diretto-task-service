var crypto = require('crypto');

/**
 * Query handler
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	return {
		
		create : h.responses.notImplemented,
		
		common : h.responses.notImplemented,
		
		forward: h.responses.notImplemented,
		
		resultPage : h.responses.notImplemented

	};
};
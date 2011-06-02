var crypto = require('crypto');

/**
 *
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	return {
		
		create : function(req, res, next) {
			h.validate.basetag(req.params, res, next, function(data){
				console.log(JSON.stringify(data));
				res.send(201, null, {'Location': "bla"});
				next();
				return;
			});
			
		},
		
		get: h.responses.notImplemented,
		
	};
};
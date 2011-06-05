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
		
		// Check tag
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
				var md5calc = crypto.createHash('md5');
				md5calc.update(data.value);
				var tagId = md5calc.digest('hex');
				
				var tagDocId = h.CONSTANTS.BASETAG.PREFIX + "-" +tagId;
				
				h.assertion.tagExists(tagDocId, h.db, function(exists){
					if(exists){
						res.send(202, null, {'Location': h.util.uri.tag(tagId)});
						next();
						return;
					}
					else{
						var tagDoc = {};

						tagDoc._id = tagDocId;
						tagDoc.creationTime = new Date().toRFC3339UTCString();
						tagDoc.creator = req.authenticatedUser;
						tagDoc.type = h.CONSTANTS.BASETAG.TYPE;
						tagDoc.value = data.value;
						
						h.db.save(tagDoc, function(err, doc){
							console.log(doc);
							if(err){
								res.send(500, {
									"error" : {
										"reason" : "Internal server error. Please try again later."
									}
								}, {});
								return next();
							}
							else{
								var resourceUri = h.util.uri.tag(tagId);
								res.send(201, {
									   "baseTag":{
										      "link":{
										         "rel":"self",
										         "href":resourceUri
										      }
										   }
										}, {'Location': resourceUri});
								return next();
							}
						});
						
					}
				});
			});
			
		},
		
		get: function(req, res, next) {
			h.db.view('/tasks/_design/tasks/_view/basetags', {key: req.uriParams.tagId}, function(err, doc) {
				if(doc && doc.rows && doc.rows.length === 1){
					res.send(200, doc.rows[0].value.content, {"Etag":doc.rows[0].value.etag});
					next();
				}
				else if(doc){
					res.send(404, null, {});
					next();
				}
				else{
					res.send(500, null, {});
					next();
				}
			});

//			h.db.get(h.CONSTANTS.BASETAG.PREFIX + "-" +req.uriParams.tagId, function(err, doc) {
//				if (doc) {
//					res.send(200, doc, {});
//					next();
//				}
//				else if(err && err.reason === "not found" ){
//					res.send(404, {error:{reason: "not found"}}, {});
//					next();
//				}
//				else{
//					res.send(500, null, {});
//					next();
//				}
//			});
		}
		
	};
};
var crypto = require('crypto');

var barrierpoints = require('barrierpoints');

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

	// returns null if ok, otherwise error
	var validateBaseTagGeneric = function(tag) {

		if (!tag || !(typeof (tag) == 'string' && tag.length >= TAG_MIN_LENGTH && tag.length <= TAG_MAX_LENGTH)) {
			return {
				error : {
					reason : "Invalid tag entity. Please check your entity structure."
				}
			};
		}
		else {
			return null;
		}
	};

	var createTag = function(_tag, creator, callback) {
		var md5calc = crypto.createHash('md5');
		md5calc.update(_tag);
		var tagId = md5calc.digest('hex');

		var tagDocId = h.CONSTANTS.BASETAG.PREFIX + "-" + tagId;

		var resourceUri = h.util.uri.tag(tagId);
		var successResponse = {
			"baseTag" : {
				"link" : {
					"rel" : "self",
					"href" : resourceUri
				}
			}
		};

		h.assertion.baseTagExists(tagDocId, h.db, function(exists) {
			if (exists) {
				callback(null, successResponse);
			}
			else {
				var tagDoc = {};

				tagDoc._id = tagDocId;
				tagDoc.creationTime = new Date().toRFC3339UTCString();
				tagDoc.creator = creator;
				tagDoc.type = h.CONSTANTS.BASETAG.TYPE;
				tagDoc.value = _tag;

				h.db.save(tagDocId, tagDoc, function(err, dbRes) {
					if (err) {
						if (err.error && err.error === 'conflict') {
							callback(null, successResponse);
						}
						else {
							console.dir(err);
							callback("oops");
						}
					}
					else {
						callback(null, successResponse);
					}
				});
			}
		});
	};

	var handleMultiple = function(data, req, res, next) {

		var results = {};

		if (data && data.values && typeof (data.values) == 'object' && typeof (data.values.length) === 'number') {

			if (data.values.length > 0) {

				var successCallback = function() {
					res.send(200, {
						results : results
					});
					next();
					return;
				};

				var b = barrierpoints(data.values.length, successCallback);

				data.values.forEach(function(value) {
					var err = validateBaseTagGeneric(value);
					if (err !== null) {
						results[value] = err;
						b.submit();
					}
					else {
						createTag(value, req.authenticatedUser, function(error, basetag) {
							if (error) {
								results[value] = {
									error : {
										"reason" : "internal error"
									}
								}
							}
							else {
								results[value] = basetag;
							}
							b.submit();
						});
					}
				});
			}
			else{
				res.send(400, {
					error : {
						reason : "List is empty"
					}
				});				
			}
		}
		else {
			res.send(400, {
				error : {
					reason : "Invalid tag request entity. "
				}
			});
		}
	};

	return {

		create : function(req, res, next) {
			validateBaseTag(req.params, res, next, function(data) {
				var md5calc = crypto.createHash('md5');
				md5calc.update(data.value);
				var tagId = md5calc.digest('hex');

				var tagDocId = h.CONSTANTS.BASETAG.PREFIX + "-" + tagId;

				var resourceUri = h.util.uri.tag(tagId);
				var successResponse = {
					"baseTag" : {
						"link" : {
							"rel" : "self",
							"href" : resourceUri
						}
					}
				};

				h.assertion.baseTagExists(tagDocId, h.db, function(exists) {
					if (exists) {
						res.send(202, successResponse, {
							'Location' : resourceUri
						});
						next();
						return;
					}
					else {
						var tagDoc = {};

						tagDoc._id = tagDocId;
						tagDoc.creationTime = new Date().toRFC3339UTCString();
						tagDoc.creator = req.authenticatedUser;
						tagDoc.type = h.CONSTANTS.BASETAG.TYPE;
						tagDoc.value = data.value;

						h.db.save(tagDocId, tagDoc, function(err, dbRes) {
							if (err) {
								if (err.error && err.error === 'conflict') {
									res.send(202, successResponse, {
										'Location' : resourceUri
									});
									return next();
								}
								else {
									res.send(500, {
										"error" : {
											"reason" : "Internal server error. Please try again later."
										}
									}, {});
									return next();
								}
							}
							else {
								res.send(201, successResponse, {
									'Location' : resourceUri
								});
								return next();
							}
						});
					}
				});
			});

		},

		get : function(req, res, next) {

			h.db.view('tasks/basetags', {
				key : req.uriParams.tagId
			}, function(err, dbRes) {
				if (dbRes && dbRes.length === 1) {
					res.send(200, dbRes[0].value.content, {
						"Etag" : "\"" + dbRes[0].value.etag + "\""
					});
					next();
				}
				else if (dbRes) {
					res.send(404, null, {});
					next();
				}
				else {
					res.send(500, null, {});
					next();
				}
			});
		},

		multiple : function(req, res, next) {
			handleMultiple(req.params, req, res, next);
		}

	};
};
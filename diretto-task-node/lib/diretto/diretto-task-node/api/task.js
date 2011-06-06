require("rfc3339date");

/**
 * Task handler
 * 
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	var TITLE_MIN_LENGTH = 6;
	var TITLE_MAX_LENGTH = 250;
	var DESCRIPTION_MIN_LENGTH = 0;
	var DESCRIPTION_MAX_LENGTH = 4000;
	
	var validateTask = function(data, response, next, callback) {
		var failed = false;
		var fail = function(msg) {
			response.send(400, {
				error : {
					reason : "Invalid task entity. " + (msg || "Please check your entity structure.")
				}
			});

			failed = true;
			next();
			return;
		};

		// Check main attributes
		if (!data || !data.constraints || !data.constraints.time || !data.constraints.location || !data.title || !data.description) {
			fail("Attributes are missing.");
			return;
		}

		// Check constraints
		if (!data.constraints || !data.constraints.time || !data.constraints.time.start || !data.constraints.time.end || !data.constraints.location || !data.constraints.location.bbox) {
			fail("Constraints are missing or invalid");
			return;
		}
		else {
			// Check dates
			try {
				var start = Date.parse(data.constraints.time.start);
				var end = Date.parse(data.constraints.time.end);
				if (start > end) {
					fail("Invalid date/time range.");
					return;
				}
			}
			catch (e) {
				fail("Invalid date/time values.");
				return;
			}

			// Check location
			if (!(typeof (data.constraints.location.bbox) == 'object' && data.constraints.location.bbox.length && data.constraints.location.bbox.length === 4)) {
				fail("Invalid location values.");
				return;
			}
			else {
				// TODO: check coordinates
			}
		}

		// Check text
		if (!(typeof (data.description) == 'string' && data.description.length >= DESCRIPTION_MIN_LENGTH && data.description.length <= DESCRIPTION_MAX_LENGTH)) {
			fail("Invalid description.");
			return;
		}
		if (!(typeof (data.title) == 'string' && data.title.length >= TITLE_MIN_LENGTH && data.title.length <= TITLE_MAX_LENGTH)) {
			fail("Invalid title.");
			return;
		}

		if (!failed) {
			callback({
				"constraints" : {
					"time" : {
						"start" : data.constraints.time.start,
						"end" : data.constraints.time.end
					},
					"location" : {
						"bbox" : data.constraints.location.bbox
					}
				},
				"title" : data.title,
				"description" : data.description
			});
		}
	};
	
	return {
		
		create : function(req, res, next) {

			validateTask(req.params, res, next, function(data){
				var taskId =h.uuid();
				
				data._id = h.CONSTANTS.TASK.PREFIX + "-" +taskId;
				data.creationTime = new Date().toRFC3339UTCString();
				data.creator = req.authenticatedUser;
				data.type = h.CONSTANTS.TASK.TYPE;
				data.visible = true;
				data.votes = {up:[], down:[]};
				data.comments = {};
				data.tags = {};
				data.submissions = {};
				
				var resourceUri = h.util.uri.task(taskId);
				
				h.db.save(data._id, data, function(err, dbRes) {
					if (err) {
						res.send(500, {
							"error" : {
								"reason" : "Internal server error. Please try again later."
							}
						}, {});
						return next();
					}
					else {
						res.send(201, null, {
							'Location' : resourceUri
						});
						return next();
					}
				});
				

			});
			
		},
		
		get: h.responses.notImplemented,
		
		getSnapshot: h.responses.notImplemented,
		
		fetchSnapshots: h.responses.notImplemented,
	
	}
};
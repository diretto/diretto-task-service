var TITLE_MIN_LENGTH = 6;
var TITLE_MAX_LENGTH = 2566;
var DESCRIPTION_MIN_LENGTH= 0;
var DESCRIPTION_MAX_LENGTH= 4096;

module.exports = function(data, callback) {
	var failed = false;
	var fail = function(msg) {
		callback(null, {
			error : {
				reason : "Invalid task entity. "+(msg || "Please check your entity structure.")
			}
		});
		failed = true;
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
		if(!(typeof(data.constraints.location.bbox) == 'object' && data.constraints.location.bbox.length && data.constraints.location.bbox.length === 4)){
			fail("Invalid location values.");
			return;
		}
		else{
			// TODO: check coordinates
		}
	}
	
	// Check text
	if(!(typeof(data.description) == 'string' && data.description.length > DESCRIPTION_MIN_LENGTH && data.description.length <= DESCRIPTION_MAX_LENGTH)){
		fail("Invalid description.");
		return;
	}
	if(!(typeof(data.title) == 'string' && data.title.length > TITLE_MIN_LENGTH && data.title.length <= TITLE_MAX_LENGTH)){
		fail("Invalid title.");
		return;
	}

	if (!failed) {
		callback({
			   "constraints":{
				      "time":{
				         "start":data.constraints.time.start,
				         "end":data.constraints.time.end
				      },
				      "location":{
				         "bbox": data.constraints.location.bbox
				      }
				   },
				   "title":data.title,
				   "description":data.description
				}, null);
	}
};
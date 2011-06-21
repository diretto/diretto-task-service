require("rfc3339date");

var crypto = require('crypto');


/**
 * Query handler
 * 
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	var MAX_TAG_COUNT = 12;

	var validateCustomQuery = function(data, response, next, callback) {
		var failed = false;
		var fail = function(msg) {
			response.send(400, {
				error : {
					reason : "Invalid query request. " + (msg || "Please check your entity structure.")
				}
			});

			failed = true;
			next();
			return;
		}

		// Check main attributes
		if (!data || !data.query || !data.query.time || !data.query.time.start || !data.query.time.end || !data.query.location || !data.query.location.bbox) {
			fail("Attributes are missing.");
			return;
		}
		else {
			// Check dates
			try {
				var start = Date.parse(data.query.time.start);
				var end = Date.parse(data.query.time.end);
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
			if (!(typeof (data.query.location.bbox) == 'object' && data.query.location.bbox.length && data.query.location.bbox.length === 4)) {
				fail("Invalid location values.");
				return;
			}
			else {
				// TODO: check coordinates
			}
		}
		
		var tags = [];
		
		if(data.query.tags){
			if(typeof (data.query.tags) !== 'object' ||  data.query.tags.length > MAX_TAG_COUNT){
				fail("Invalid tag list.");
				return;
			}
			else{
				data.query.tags.forEach(function(tag){
					if (tag.substring(0, h.options.task.external.uri.length) === h.options.task.external.uri) {
						tags.push(tag.substr((h.options.task.external.uri + "/tag/").length).split("/")[0]);
					}
					else {
						fail("Invalid tag link: "+tag);
						return;
					}					
				});
			}
		}
		
		if (!failed) {
			callback({
				"query" : {
					tags : tags.sort(),
					time : data.query.time,
					location : data.query.location
				}
			});
		}		
	};

	
	var buildQuery = function(data, callback){
		
		var start = Date.parse(data.query.time.start).getTime();
		var end = Date.parse(data.query.time.end).getTime();
		var lon1 = data.query.location.bbox[0]; 
		var lat1 = data.query.location.bbox[1]; 
		var lon2 = data.query.location.bbox[2]; 
		var lat2 = data.query.location.bbox[3]; 
		var sort = data.query.sort || "upvotes<int>";
		
		// Spatial constraints
		var q = "(" +
					"(lat1<double>:["+lat1+" TO "+lat2+"] OR lat2<double>:["+lat1+" TO "+lat2+"] OR ((lat1<double>:[-90 TO "+lat1+"]) AND (lat2<double>:["+lat2+" TO 90]))) " +
					"AND " +
					"(lon1<double>:["+lon1+" TO "+lon2+"] OR lon2<double>:["+lon1+" TO "+lon2+"] OR ((lon1<double>:[-180 TO "+lon1+"]) AND (lon2<double>:["+lon2+" TO 180]))) " +
				")";

		// temporal
		q = q + "AND (" +
					"(start<long>:["+start+" TO "+end+"] OR lat2<long>:["+start+" TO "+end+"] OR ((lat1<long>:[0 TO "+start+"]) AND (lat2<long>:["+end+" TO 2918834151765]))) " +
				")";
		
		// Tags
		if(data.query.tags && data.query.tags.length > 0){
			q = q + "AND tags:(" +
						data.query.tags.join(" AND ") +
					")";
		}

		data.querystring = "q="+q+"&sort="+sort; 
		
		
		// hash string
		var md5calc = crypto.createHash('md5');
		md5calc.update(data.querystring);
		data.hash = md5calc.digest('hex');
		
		callback(data);
	};
	
	return {
		
		create : function(req, res, next) {			
			validateCustomQuery(req.params, res, next, function(data){
				buildQuery(data, function(data){
					console.log(data.querystring);
					console.log(data.hash);
					h.responses.notImplemented(req, res, next);
				});
			});
		},
		
		common : h.responses.notImplemented,
		
		forward: h.responses.notImplemented,
		
		resultPage : h.responses.notImplemented

	};
};
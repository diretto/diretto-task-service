require("rfc3339date");

var qstring = require('querystring');
var crypto = require('crypto');

/**
 * Query handler
 * 
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	var PAGINATION_SIZE = 1;
	
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
					" AND " +
					"(lon1<double>:["+lon1+" TO "+lon2+"] OR lon2<double>:["+lon1+" TO "+lon2+"] OR ((lon1<double>:[-180 TO "+lon1+"]) AND (lon2<double>:["+lon2+" TO 180]))) " +
				")";

		// temporal
		q = q + " AND (" +
					"(start<long>:["+start+" TO "+end+"] OR lat2<long>:["+start+" TO "+end+"] OR ((lat1<long>:[0 TO "+start+"]) AND (lat2<long>:["+end+" TO 2918834151765]))) " +
				")";
		
		// Tags
		if(data.query.tags && data.query.tags.length > 0){
			q = q + " AND tags:(" +
						data.query.tags.join(" AND ") +
					")";
		}

		data.querystring = "q="+qstring.escape(q)+"&sort="+qstring.escape(sort); 
		
		
		// hash string
		var md5calc = crypto.createHash('md5');
		md5calc.update(data.querystring);
		data.hash = md5calc.digest('hex');
		
		callback(data);
	};
	
	var fetchQueryString = function(queryId, callback){
		//TODO try cache first
		h.db.view('tasks/queries', {
			key : queryId
		}, function(err, dbRes) {
			if (dbRes && dbRes.length === 1) {
				callback(null, dbRes[0].value);
			}
			else if (dbRes) {
				callback(404);
			}
			else {
				callback(500);
			}
		});
	};
	
	var fetchResultPage = function(querystring, cursor, callback){
		
		cursor = parseInt(cursor) || 1;
		
		var q = querystring;
		if(cursor !== null && typeof(cursor) === 'number'){
			q = q + "&limit="+PAGINATION_SIZE+"&skip="+((cursor -1)* PAGINATION_SIZE);
		}
		else{
			q = q + "&limit=1";
		}
		
		h.db.fti('tasks/tasks', q, function(err, dbRes){
			if(err || (dbRes && dbRes.headers && dbRes.headers.status && dbRes.headers.status !== 200)){
				callback(err || dbRes.headers.status);
				return;
			}
			else{
				callback(null, dbRes.json.total_rows, dbRes);
				return;
			}
		});
	};
	
	return {
		
		create : function(req, res, next) {			
			validateCustomQuery(req.params, res, next, function(data){
				buildQuery(data, function(data){
					
					var qDocId = h.CONSTANTS.QUERY.PREFIX + "-" + data.hash;
					
					//TODO: check if in cache
					
					h.db.head( qDocId, function(err, headers,code) {
						if(!code || code !== 200){
							//not yet in database
							
							data._id = qDocId;
							data.creationTime =  new Date().toRFC3339UTCString();
							data.type = h.CONSTANTS.QUERY.TYPE;
							
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
									//TODO: put in cache
									res.send(202, null, {
										Location: h.util.uri.query(data.hash)
									});
									return next();
								}
							});
						}
						else{
							//query exists
							res.send(202, null, {
								Location: h.util.uri.query(data.hash)
							});
							return next();
						}
					});			
				});
			});
		},
		
		common : h.responses.notImplemented,
		
		forward: function(req, res, next) {
			fetchQueryString(req.uriParams.queryId, function(err, querystring){
				if(err){
					res.send(err || 500, null, {});
					next();
				}
				else{
					fetchResultPage(querystring, null, function(err, count, results){
						if(err){
							res.send((err === 404 ? 404 : 500), null, {});
							next();
						}
						else{
							if(count > 0){
								res.send(303, null, { "Location": h.util.uri.queryPage(req.uriParams.queryId,1) });
								next();
							}
							else{
								res.send(204, null, {});
								next();
							}

						}
					});
				}
			});
		},
		
		resultPage : function(req, res, next) {
			fetchQueryString(req.uriParams.queryId, function(err, querystring){
				if(err){
					res.send(err || 500, null, {});
					next();
				}
				else{
					var cursorId = req.uriParams.cursorId;
					var queryId = req.uriParams.queryId;
					
					cursorId = parseInt(cursorId) || -1;
					
					if(cursorId === -1 && cursorId < 1){
						res.send(404, null, {});
						next();
						return;
					}
					
					fetchResultPage(querystring, cursorId, function(err, count, results){
						
						if(err){
							res.send((err === 404 ? 404 : 500), null, {});
							next();
						}
						else{
							if(count > 0 && results.length > 0){
								
								var list = [];
								
								results.forEach(function(item){
									list.push({
										"task" : {
											"link" : {
												"rel" : "self",
												"href" :  h.util.uri.task(item.id.substr(2))
											}
										} 
									})
								});
								
								var page = {
										"link" : {
											"rel" : "self",
											"href" : h.util.uri.queryPage(queryId, cursorId)
										}, 
										"related": [{
											"link" : {
												"rel" : "first",
												"href" : h.util.uri.queryPage(req.uriParams.queryId,1)
											} 
										}],
										"list" : list
								};
								
								var maxPages = Math.ceil(count / PAGINATION_SIZE);
								
								
								if(cursorId < maxPages){
									page.related.push({
										"link" : {
											"rel" : "next",
											"href" : h.util.uri.queryPage(req.uriParams.queryId,(cursorId +1))
										} 
									});
								}
								
								if(cursorId > 1){
									page.related.push({
										"link" : {
											"rel" : "previous",
											"href" : h.util.uri.queryPage(req.uriParams.queryId,(cursorId -1))
										} 
									});
								}
								
								
								res.send(200, {
									"query" : {
										"link" : {
											"rel" : "self",
											"href" : h.util.uri.query(req.uriParams.queryId)
										} 
									},
									"results" : {
										count : count,
										page : page
									}
								}, {});
								next();
							}
							else{
								res.send(404, null, {});
								next();
							}

						}
					});
				}
			});
		},

	};
};
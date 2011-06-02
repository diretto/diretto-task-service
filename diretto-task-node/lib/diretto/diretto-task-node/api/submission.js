var crypto = require('crypto');

require("rfc3339date");

/**
 * Submission handler
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	var validateSubmission = function(data, response, next, callback) {
		var failed = false;
		var fail = function(msg) {
			response.send(400, {
				error : {
					reason : "Invalid submission entity. " + (msg || "Please check your entity structure.")
				}
			});

			failed = true;
			next();
			return;
		};

		// Check document
		if (!data.document || !data.document.link || !data.document.link.rel || !data.document.link.href) {
			fail("Document invalid.");
			return;
		}
		else {
			if (!(typeof (data.document.link.rel) == 'string')) {
				fail("Invalid link relation.");
				return;
			}
			if (!(typeof (data.document.link.href) == 'string' && data.document.link.href.substr(0, 4) === "http")) {
				fail("Invalid link hyperref.");
				return;
			}
		}

		if (!failed) {
			callback({
				"document" : {
					"link" : {
						"rel" : data.document.link.rel,
						"href" : data.document.link.href
					}
				}
			});
		}
	};
	
	return {
		
		create : function(req, res, next) {
			validateSubmission(req.params, res, next, function(data){
				
				var md5calc = crypto.createHash('md5');
				md5calc.update(data.document.link.href);						
				var submissionId = md5calc.digest('hex');						
				// TODO: extract document ID as submission ID
				
				h.assertion.taskExists(req.uriParams.taskId, db, function(taskExists, task){
					if(!taskExists){
						res.send(404, {
							   "error":{
								      "reason":"Task not found."
								   }
								},{});
						next();
						return;
					}
					h.assertion.submissionExists(req.uriParams.taskId,req.uriParams.submissionId, db, function(submissionExists){
						if(submissionExists){
							res.send(409, {
								   "error":{
									      "reason":"Document has already been submitted."
									   }
									},{});
							next();
							return;
						}
						h.assertion.documentExists(data.document.link.href, function(documentExists, direttoDoc){
							if(!documentExists){
								res.send(404, {
									   "error":{
										      "reason":"Document does not exist."
										   }
										},{});
								next();
								return;
								
							}
							//TODO check task vs direttoDoc
							var submission = {
								id : submissionId,
								creationTime : new Date().toRFC3339UTCString(),
								creator : req.authenticatedUser,
								votes : {
									up : [],
									down :[]
								},
								tags : {},
								document : data.document								
							};
							
							// TODO: improve call
							h.db.request('POST', "/tasks/_design/tasks/_update/addsubmission/t-"+req.uriParams.taskId, submission, function(err,result){
								console.log(err);
								console.log(result);
								console.log(JSON.stringify(data));
								res.send(201, null, {'Location': "bla"});
								next();
								return;							
							});								
						});
					});
				});
			});
		},
		
		get: h.responses.notImplemented,
		
		getAll : h.responses.notImplemented
		
	};
};
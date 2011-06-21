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
			validateSubmission(req.params, res, next, function(data) {

				var md5calc = crypto.createHash('md5');
				md5calc.update(data.document.link.href);
				var submissionId = md5calc.digest('hex');
				// TODO: extract document ID as submission ID

				h.assertion.taskExists(req.uriParams.taskId, h.db, function(taskExists, task) {
					if (!taskExists) {
						res.send(404, {
							"error" : {
								"reason" : "Task not found."
							}
						}, {});
						next();
						return;
					}
					h.assertion.submissionExists(req.uriParams.taskId, req.uriParams.submissionId, h.db, function(submissionExists) {
						if (submissionExists) {
							res.send(409, {
								"error" : {
									"reason" : "Document has already been submitted."
								}
							}, {});
							next();
							return;
						}
						h.assertion.documentExists(data.document.link.href, function(documentExists, direttoDoc) {
							if (!documentExists) {
								res.send(404, {
									"error" : {
										"reason" : "Document does not exist."
									}
								}, {});
								next();
								return;

							}
							// TODO check task vs direttoDoc
							var submission = {
								id : submissionId,
								creationTime : new Date().toRFC3339UTCString(),
								creator : req.authenticatedUser,
								votes : {
									up : [],
									down : []
								},
								tags : {},
								document : data.document
							};

							h.util.updateHandler.retryable("tasks/addsubmission", "t-" + req.uriParams.taskId, submission, function(err, result) {
								if (err) {
									if (err.error && err.error === 'duplicate') {
										res.send(409, {
											"error" : {
												"reason" : "Submission already exists."
											}
										}, {});
										return next();
									}
									else if (err.error && err.error === 'not found') {
										res.send(404, {
											"error" : {
												"reason" : "Resource not found."
											}
										}, {});
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
									res.send(201, null, {
										'Location' : h.util.uri.submission(req.uriParams.taskId, submission.id)
									});
									return next();
								}
							});
						});
					});
				});
			});
		},

		get: function(req, res, next) {
			h.db.view('tasks/submissions', {
				key : [req.uriParams.taskId,req.uriParams.submissionId]
			}, function(err, dbRes) {
				if(dbRes && dbRes.length === 1){
					res.send(200, dbRes[0].value.content, {
						"Etag" : "\""+dbRes[0].value.etag+"\""
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

		getAll : function(req, res, next) {
			h.db.view('tasks/submissions', {
				startkey : [req.uriParams.taskId],
				endkey  : [req.uriParams.taskId,{}]
			}, function(err, dbRes) {
				if(dbRes){
					var list =  [];
					var headers = {};
					
					var send = function(){
						res.send(200, {
							"submissions" : {
								"list" : list,
								"link" : {
									"rel" : "self",
									"href" : h.util.uri.task(req.uriParams.taskId)+"/submissions"
								}							
							} 
						}, headers);
						next();
					};
						
					if(dbRes.length === 0){
						h.db.head( "t-"+req.uriParams.taskId, function(err, headers,code) {
							if(!code || code !== 200){
								res.send(404, null, {});
								return next();
							}
							else{
								send();
							}
						});
					}
					else{
						headers['Etag'] = "\""+dbRes[0].value.etag+"\"";
						dbRes.forEach(function(viewItem){
							list.push(viewItem.content);
						});
						send();
					}
				}
				else {
					res.send(500, null, {});
					next();
				}
			});
		},	

	};
};
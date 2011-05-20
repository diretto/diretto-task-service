var validate = {
		task : require('./validations/task.js')
};

//validate.newTask = require('./validations/newtask.js');

module.exports = function(taskNode) {

	var db = taskNode.db;
	
	var taskExists = function(taskId, callback){
		if(true){
			callback(null,taskId);
		}
		else{
			callback({error:{reason:"not found"}},null);
		}
	};

	return {

		index : {
			get : function(req, res, next) {
				res.send(200, {
					"api" : {
						"name" : "org.diretto.api.external.task",
						"version" : "v2"
					},
					"service" : {
						"name" : taskNode.serverName,
						"version" : taskNode.serverVersion
					},
					"deployment" : {
						"title" : taskNode.options.task.deployment.title || "unnamed",
						"contact" : taskNode.options.task.deployment.contact || "n/a",
						"website" : {
							"link" : {
								"rel" : "self",
								"href" : taskNode.options.task.deployment.website || "n/a"
							}
						}
					},
					"direttoMainServices" : {
						"core" : {
							"link" : {
								"rel" : "self",
								"href" : "http://coreservice/v2"
							}
						}
					}
				});
				return next();
			}
		},

		task : {
			create : function(req, res, next) {
				validate.task(req.params, function(data, err){
					if(err){
						res.send(400, err);
					}
					else{
						console.log(JSON.stringify(data));
						res.send(201, null, {'Location': "bla"});
						next();
					}
				});
				
			},
			get: function(req, res, next) {
				next();
			},
			getSnapshot : function(req, res, next) {
				next();
			},
			fetchSnapshots : function(req, res, next) {
				next();
			}
		
		},
		submission : {},
		comment : {},
		tag : {},
		query : {},

		
		error : {
			notImplemented : function(req, res, next) {
				// console.log(req.uriParams);
				// console.dir(req._url);
				// console.dir(req.params);
				console.log(db);
				db.get("863780aac3c39f10cee2f01fd0000f17", function(err, doc) {
					if (err) {
						console.dir(err);
					}
					else {
						console.dir(doc);
					}

				});
				res.send(501, {
					error : {
						reason : "Not yet implemented"
					}
				});
			},
		}
	

	}
	

};

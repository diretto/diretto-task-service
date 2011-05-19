module.exports = function(taskNode) {

	return {

		"notImplemented" : function(req, res, next) {
			console.log(req.uriParams);
			console.dir(req._url);
			console.dir(req.params);
			res.send(501);
		},

		"getIndex" : function(req, res, next) {
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
	};
};

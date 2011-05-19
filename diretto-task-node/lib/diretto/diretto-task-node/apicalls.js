module.exports = function(taskNode) {

	return {
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

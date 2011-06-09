/**
 * Index Handler
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {
	
	return {
		
		get : function(req, res, next) {
			res.send(200, {
				"api" : {
					"name" : "org.diretto.api.external.task",
					"version" : "v2"
				},
				"service" : {
					"name" : h.options.server.name,
					"version" : h.options.server.version
				},
				"deployment" : {
					"title" : h.options.task.deployment.title || "unnamed",
					"contact" : h.options.task.deployment.contact || "n/a",
					"website" : {
						"link" : {
							"rel" : "self",
							"href" : h.options.task.deployment.website || "n/a"
						}
					}
				},
				"direttoMainServices" : {
					"core" : {
						"link" : {
							"rel" : "self",
							"href" : h.options.task.direttoMainServices.core.uri
						}
					}
				}
			});
			return next();
		}
	
	};
};
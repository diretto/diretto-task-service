/**
 * Index Handler
 *
 * @author Benjamin Erb
 */
module.exports = function(h) {

	//create JSON once, only static usage
	var index = {
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
		},
		"links" : [ {
			"title" : "diretto Task API Documentation",
			"link" : {
				"rel" : "self",
				"href" : "http://diretto.github.com/diretto-api-doc/v2/diretto-ext/task.html"
			}
		}, {
			"title" : "Task factory resource",
			"link" : {
				"rel" : "self",
				"href" : h.util.uri.tasks()
			}
		},{
			"title" : "Task list",
			"link" : {
				"rel" : "self",
				"href" : h.util.uri.allTasks()
			}
		}, {
			"title" : "Tag factory resource",
			"link" : {
				"rel" : "self",
				"href" : h.util.uri.tags()
			}
		}, {
			"title" : "Query dispatching resource",
			"link" : {
				"rel" : "self",
				"href" : h.util.uri.queryDispatch()
			}
		} ]
	};

	return {

		get : function(req, res, next) {
			res.send(200, index);
			return next();
		}

	};
};
// !code vendor/diretto/config.js

var formatter = (function(docId) {

	var link = function(uri, rel){
		return {
			"rel" : (rel || "self"),
			"href" : uri
		};
	};
	
	var votes = function(v, uri){
		return {
				"link" : link(uri + "/votes"),
				"up" : v.up.length,
				"down" : v.down.length
			};
	};

	var creator = function(c){
		return {
			link : link(config.coreServiceBaseUri + "/user/" + c)
		};
	};
	
	var comment = function(c) {
		return {
			"comment" : {
				"link" : link(config.taskServiceBaseUri + "/task/" + docId.substr(2) + "/comment/" + c.id),
				"content" : c.content,
				"creator" : creator(c.creator),
				"creationTime" : c.creationTime,
				"votes" : votes(c.votes, config.taskServiceBaseUri + "/task/" + docId.substr(2) + "/comment/" + c.id) 
			}
		};
	};	
	
	var submission = function(s) {
		//TODO: tags...
		return {
			"submission" : {
				"link" : link(config.taskServiceBaseUri + "/task/" + docId.substr(2) + "/submission/" + s.id),
				"creator" : creator(s.creator),
				"creationTime" : s.creationTime,
				"votes" : votes(s.votes, config.taskServiceBaseUri + "/task/" + docId.substr(2) + "/submission/" + s.id),
				"document" : {
					"link": link(s.document.link.href)
				}
			}
		};
	};
	
	var task = function(t){
		return {
			//TODO: tags...

			"task" : {
				"link" : link(config.taskServiceBaseUri + "/task/" + docId.substr(2)),
				"constraints" : t.constraints,
				"title" : t.title,
				"description" : t.description,
				"votes" : votes(t.votes, config.taskServiceBaseUri + "/task/" + docId.substr(2)),
				"creator" : creator(t.creator),
				"creationTime" : t.creationTime,
			},
			"submissions" : {
				"link" : link(config.taskServiceBaseUri + "/task/" + docId.substr(2)+"/submissions")
			},
			"tags" : {
				"link" : link(config.taskServiceBaseUri + "/task/" + docId.substr(2)+"/tags")
			},
			"comments" : {
				"link" : link(config.taskServiceBaseUri + "/task/" + docId.substr(2)+"/comments")
			}
		};
	};
	
	

	return {
		comment : comment,
		task 	: task,
		submission : submission
	};
	
	

}(doc._id));

if (typeof (exports) === 'object') {
	exports.formatter = formatter;
};
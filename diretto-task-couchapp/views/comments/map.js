/**
 * Provides a view of all comments. Key is the [task id,comment id], value the comment. 
 * 
 * @author Benjamin Erb
 */
function(doc) {
	// !code vendor/diretto/config.js
  if (doc.type == "task") {
	  if(doc.comments){
		  var commentIds = Object.keys(doc.comments);
		  for(var idx in commentIds){
			  var comment = {
				  "comment" : {
					  "id" : commentIds[idx],
					  "link" : {
						"rel":"self",
						"href" : config.taskServiceBaseUri +"/task/"+ doc._id.substr(2) +"/comment/"+commentIds[idx]
					  },
					  "content" : doc.comments[commentIds[idx]].content,
					  "creator" : {
						 "id":doc.comments[commentIds[idx]].creator,
						 "link" : {
							 "rel" : "self",
							 "href" : config.coreServiceBaseUri +"/user/"+ doc.comments[commentIds[idx]].creator
						 }
					  }, 						  
					  "creationTime" : doc.comments[commentIds[idx]].creationTime,
					  "id" : commentIds[idx],
					  "votes" : {
						  "link":{
							"rel":"self",
							"href" : config.taskServiceBaseUri +"/task/"+ doc._id.substr(2) +"/comment/"+commentIds[idx]+"/votes"
						  },
							"up" : doc.comments[commentIds[idx]].votes.up.length,  
							"down" : doc.comments[commentIds[idx]].votes.down.length  
					  } 
				  }
			  };
			  emit([doc._id.substr(2),commentIds[idx]],comment);
		  }
	  }
  }
};

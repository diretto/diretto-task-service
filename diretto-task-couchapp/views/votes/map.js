function(doc) {
	
	// !code vendor/diretto/view-formatter.js
	
	if (doc.type === "task" && doc.visible === true) {
		  
		  // Task
		  emit(["task",doc._id.substr(2)], formatter.votes(doc.votes, config.taskServiceBaseUri + "/task/" + doc._id.substr(2)));
		  
		  // Submission
		  if(doc.submissions){
			  var ids = Object.keys(doc.submissions);
			  for(var idx in ids){
				  emit(["submission",doc._id.substr(2), ids[idx]], formatter.votes(doc.submissions[ids[idx]].votes, config.taskServiceBaseUri + "/task/" + doc._id.substr(2)+"/submission/"+ids[idx]));
				  
				  
				  //TODO
//				// Tag for Submission
//				  if(doc.tags){
//					  var ids = Object.keys(doc.tags);
//					  for(var idx in ids){
//						  emitVotes([doc._id.substr(2),"tag",ids[idx]],doc.tags[ids[idx]]);
//					  }
//				  }
			  }
		  }
		  
		  // Comment
		  if(doc.comments){
			  var ids = Object.keys(doc.comments);
			  for(var idx in ids){
				  emit(["comment",doc._id.substr(2), ids[idx]], formatter.votes(doc.comments[ids[idx]].votes, config.taskServiceBaseUri + "/task/" + doc._id.substr(2)+"/comment/"+ids[idx]));
			  }
		  }
//		  
//		  // Tag for Task
//		  if(doc.tags){
//			  var ids = Object.keys(doc.tags);
//			  for(var idx in ids){
//				  emitVotes(["tasktag",doc._id.substr(2),ids[idx]],doc.tags[ids[idx]]);
//			  }
//		  }
	  }	
	
};
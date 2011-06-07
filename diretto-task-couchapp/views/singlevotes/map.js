/**
 * Provides a list of all votable resources with the voting results.
 * 
 * [(res id), (up|down), (user-id)]
 * 
 * @author Benjamin Erb
 */
function(doc) {
	
	// !code vendor/diretto/view-formatter.js
	
	var emitVotes  = function(key, resource){
		["up","down"].forEach(function(voteType){
			if(resource.votes[voteType] && resource.votes[voteType].length > 0){
				resource.votes[voteType].forEach(function(user){
					  var emitKey = key.slice(0, key.length)
					  emitKey.push(user);
					  emit(emitKey,voteType);
				  });
			}
		});
	};
	
	  if (doc.type === "task" && doc.visible === true) {
		  
		  // Task
		  emitVotes(["task",doc._id.substr(2)], doc);
		  
		  // Submission
		  if(doc.submissions){
			  var ids = Object.keys(doc.submissions);
			  for(var idx in ids){
				  emitVotes(["submission",doc._id.substr(2),ids[idx]],doc.submissions[ids[idx]]);
				  
				  
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
				  emitVotes(["comment",doc._id.substr(2),ids[idx]],doc.comments[ids[idx]]);
			  }
		  }
		  
		  // Tag for Task
		  if(doc.tags){
			  var ids = Object.keys(doc.tags);
			  for(var idx in ids){
				  emitVotes(["tasktag",doc._id.substr(2),ids[idx]],doc.tags[ids[idx]]);
			  }
		  }
	  }	
};

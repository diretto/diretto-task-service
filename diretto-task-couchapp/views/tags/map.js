/**
 * Provides a list of all tags
 * 
 * 
 * @author Benjamin Erb
 */
function(doc) {
	
	// !code vendor/diretto/view-formatter.js
	
	if (doc.type === "task" && doc.visible === true) {
		if(doc.tags){
			  var tagIds = Object.keys(doc.tags);
			  for(var idx in tagIds){
				  emit(["task",doc._id.substr(2),tagIds[idx]],{
					content : formatter.tag(doc.tags[tagIds[idx]], config.taskServiceBaseUri + "/task/" + doc._id.substr(2)),
					etag : doc._rev
				  });
			  }
		 }
		
		if(doc.submissions){
			  var ids = Object.keys(doc.submissions);
			  for(var idx in ids){
				  var submission = doc.submissions[ids[idx]];
				  if(submission.tags){
					  var tagIds = Object.keys(submission.tags);
					  for(var tidx in tagIds){
						  emit(["submission",doc._id.substr(2),submission.id,tagIds[tidx]],{
							content : formatter.tag(submission.tags[tagIds[tidx]], config.taskServiceBaseUri + "/task/" + doc._id.substr(2)+ "/submission/" + submission.id),
							etag : doc._rev
						  });
					  }
				  }
			  }
		  }
	}
}
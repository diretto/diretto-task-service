/**
 * Provides a view of all submissions. Key is [task id, submission id], value the submission. 
 * 
 * @author Benjamin Erb
 */
function(doc) {
	
	// !code vendor/diretto/view-formatter.js
	
	  if (doc.type === "task" && doc.visible === true) {
		  if(doc.submissions){
			  var ids = Object.keys(doc.submissions);
			  for(var idx in ids){
				  emit([doc._id.substr(2),ids[idx]],{
					content : formatter.submission(doc.submissions[ids[idx]]),
					etag : doc._rev
				  });
			  }
		  }
	  }
};

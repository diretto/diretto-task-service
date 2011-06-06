/**
 * Provides a view of all comments. Key is the [task id,comment id], value the comment. 
 * 
 * @author Benjamin Erb
 */
function(doc) {
	
	// !code vendor/diretto/view-formatter.js
	
  if (doc.type === "task" && doc.visible === true) {
	  if(doc.comments){
		  var commentIds = Object.keys(doc.comments);
		  for(var idx in commentIds){
			  emit([doc._id.substr(2),commentIds[idx]],{
				content : formatter.comment(doc.comments[commentIds[idx]]),
				etag : doc._rev
			  });
		  }
	  }
  }
};

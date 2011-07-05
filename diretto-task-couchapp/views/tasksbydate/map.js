/**
 * Provides a view of all task ids and their creation time.
 * 
 * @author Benjamin Erb
 */
function(doc) {
	
	// !code vendor/diretto/view-formatter.js
	
	  if (doc.type === "task" && doc.visible === true) {
		  emit([doc.creationTime , doc._id.substr(2)], null);		  
	  }
};

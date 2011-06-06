/**
 * Provides a view of all tasks (meta-data only). Key is the task id, value the
 * document.
 * 
 * @author Benjamin Erb
 */
function(doc) {
	
	// !code vendor/diretto/view-formatter.js
	
	  if (doc.type === "task" && doc.visible === true) {
		  emit(doc._id.substr(2),{
			content : formatter.task(doc),
			etag : doc._rev
		  });
	  }
};

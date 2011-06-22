/**
 * Provides a list of all queries.
 * 
 * 
 * @author Benjamin Erb
 */
function(doc) {
	
	// !code vendor/diretto/view-formatter.js
	
	if (doc.type === "query") {
		emit(doc._id.substr(2),doc.querystring);
	}
}
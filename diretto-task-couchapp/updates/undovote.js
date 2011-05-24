/**
 * Undos a vote to the given entity.
 * 
 * A vote request body JSON contains a field resource, listing the IDs of the resource to vote on.
 * 
 * @author Benjamin Erb
 */
function(doc, req) {
	
	// !code vendor/diretto/vote.js
	
	//Check for document
	if(!doc || doc.type !== "task"){
		return[null, "hello new"+req.uuid+"\n"];
	}
	
	var body = {};
	try{		
		body  = JSON.parse(req.body);
	}
	catch (e) {
		return[null, "1 hello \n"];
	}
	
	var v = vote.extractId(body, doc);	
	if(v == null){
		return [null, "not found"];
	}
	
	vote.remove(v, body.userId);
	return[doc, "ok"];
};
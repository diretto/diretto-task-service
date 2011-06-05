/**
 * Adds a vote to the given entity.
 * 
 * A vote request body JSON contains a field resource, listing the IDs of the resource to vote on.
 * 
 * @author Benjamin Erb
 */
function(doc, req) {
	
	// !code vendor/diretto/vote.js
	
	//Check for document
	if(!doc || doc.type !== "task"){
		return[null,{code: 404, body:'{"status":404,"error":"not found"}', headers : {"Content-Type":"application/json"} }];
	}
	
	var body = {};
	try{		
		body  = JSON.parse(req.body);
	}
	catch (e) {
		return[null,{code: 400, body:'{"status":400,"error":"invalid request"}', headers : {"Content-Type":"application/json"} }];
	}
	
	var v = vote.extractId(body, doc);	
	if(v == null){
		return[null,{code: 400, body:'{"status":400,"error":"invalid request"}', headers : {"Content-Type":"application/json"} }];
	}
	
	vote.add(v, body.userId, (body.vote === 'up' ? "up" : "down"));
	return[doc,{code: 201, body:'{"status":201,"content":{"message":"updated"}}', headers : {"Content-Type":"application/json"} }];

};
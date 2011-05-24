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
		return[null, "hello new"+req.uuid+"\n"];
	}
	
	
	var body = {};
	try{		
		body  = JSON.parse(req.body);
	}
	catch (e) {
		return[null, "1 hello \n"];
	}
	
	var v = null;
	if(body.resource.taskId && body.resource.submissionId && body.resource.tagId){
		try{
			v = doc.submissions[body.resource.submissionId].tags[body.resource.tagId].votes;
		}
		catch (e) {
			v = null;
		}
	}
	else if(body.resource.taskId && body.resource.submissionId){
		try{
			v = doc.submissions[body.resource.submissionId].votes;
		}
		catch (e) {
			v = null;
		}
	}
	else if(body.resource.taskId && body.resource.tagId){
		try{
			v = doc.tags[body.resource.tagId].votes;
		}
		catch (e) {
			v = null;
		}
	}
	else if(body.resource.taskId && body.resource.commentId){
		try{
			v = doc.comments[body.resource.commentId].votes;
		}
		catch (e) {
			v = null;
		}
	}
	else if(body.resource.taskId){
		try{
			v = doc.votes;
		}
		catch (e) {
			v = null;
		}
	}
	else{
		return [null, "error"];
	}
	
	if(v == null){
		return [null, "not found"];
	}
	
	vote.add(v, body.userId, (body.vote === 'up' ? "up" : "down"));
	return[doc, "ok"];
	
	
//	return[null, "2 "+JSON.stringify(body)+"\n"];

//	if(!doc || doc.type !== "task"){
//		return[null, "hello new"+req.uuid+"\n"];
//	}
//	else{
////		try{
//			var x = {};
//				x = JSON.parse(req.body);
//				return[null, JSON.stringify(x.foo)];
////		}
////		catch (e) {
////			return[null, "catch"];
////		}
////		finally{
////			return[null, "finally"];
////		}
////		
//		 
//		
////		if(!doc.bla){
////			doc.bla = [];
////		}
////		doc.bla.push(req.uuid);
////		return[doc, {code: 303, body:"hello existing\n"+req.uuid+"\n",headers : { "X-Response-Code" : "303" } }];
//	}
};
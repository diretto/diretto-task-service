/**
 * Adds a comment to the given task.
 * 
 * @author Benjamin Erb
 */
function(doc, req) {
	
	//Check for document
	if(!doc || doc.type !== "task"){
		return[null, "not found"];
	}
	
	//Parse JSON
	var body = {};
	if(req.body){
		try{
			body  = JSON.parse(req.body);
		}
		catch (e) {
			return[null, "invalid JSON"];
		}
	}
	
	if(!doc.comments){
		doc.comments = {};
	}
	
	if(doc.comments[body.id]){
		return [null, "conflict"];
	}
	
	doc.comments[body.id] = body;

	return[doc, {code: 200, body:"added\n"+req.uuid+"\n",headers : { "X-Response-Code" : "303" } }];
	
};
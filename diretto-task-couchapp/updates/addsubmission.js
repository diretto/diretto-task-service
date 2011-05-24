/**
 * Adds a submission to the given task.
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
	
	if(!doc.submissions){
		doc.submissions = {};
	}
	
	if(doc.submissions[body.id]){
		return [null, "conflict"];
	}
	
	doc.submissions[body.id] = body;

	return[doc, {code: 200, body:"added\n"+req.uuid+"\n",headers : { "X-Response-Code" : "303" } }];
	
};
/**
 * Adds a submission to the given task.
 * 
 * @author Benjamin Erb
 */
function(doc, req) {
	
	//Check for document
	if(!doc || doc.type !== "task"){
		return[null,{code: 404, body:'{"status":404,"error":"not found"}', headers : {"Content-Type":"application/json"} }];
	}
	
	//Parse JSON
	var body = {};
	if(req.body){
		try{
			body  = JSON.parse(req.body);
		}
		catch (e) {
			return[null,{code: 400, body:'{"status":400,"error":"invalid request"}', headers : {"Content-Type":"application/json"} }];
		}
	}
	
	if(!doc.submissions){
		doc.submissions = {};
	}
	
	if(doc.submissions[body.id]){
		return[null,{code: 409, body:'{"status":409,"error":"duplicate"}', headers : {"Content-Type":"application/json"} }];
	}
	
	doc.submissions[body.id] = body;

	return[doc,{code: 201, body:'{"status":201,"content":{"message":"updated"}}', headers : {"Content-Type":"application/json"} }];	
	
};
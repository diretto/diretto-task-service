/**
 * Adds a comment to the given task.
 * 
 * @author Benjamin Erb
 */
function(doc, req) {
	if(!doc || doc.type !== "task"){
		return[null, "hello new"+req.uuid+"\n"];
	}
	else{
		if(!doc.bla){
			doc.bla = [];
		}
		doc.bla.push(req.uuid);
		return[doc, {code: 303, body:"hello existing\n"+req.uuid+"\n",headers : { "X-Response-Code" : "303" } }];
	}
};
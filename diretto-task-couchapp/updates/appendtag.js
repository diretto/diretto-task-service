/**
 * Adds a tag to a task/submission.
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
	
	
	if(body.resource && body.resource.taskId && body.resource.submissionId){
		//submission tagging
		if(doc.submissions && doc.submissions[body.resource.submissionId]){

			if(doc.submissions[body.resource.submissionId].tags[body.baseTagId]){
				return[null,{code: 409, body:'{"status":409,"error":"duplicate"}', headers : {"Content-Type":"application/json"} }];
			}
			
			doc.submissions[body.resource.submissionId].tags[body.baseTagId] = {
					id:body.baseTagId,
					value:body.value,
					creationTime:body.creationTime,
					creator:body.creator,
					votes : {up:[],down:[]}
			};
			return[doc,{code: 201, body:'{"status":201,"content":{"message":"updated"}}', headers : {"Content-Type":"application/json"} }];
		
		}
		else{
			return[null,{code: 404, body:'{"status":404,"error":"not found"}', headers : {"Content-Type":"application/json"} }];
		}
	}
	else if(body.resource && body.resource.taskId){
		//task tagging
		
		if(doc.tags[body.baseTagId]){
			return[null,{code: 409, body:'{"status":409,"error":"duplicate"}', headers : {"Content-Type":"application/json"} }];
		}
		
		doc.tags[body.baseTagId] = {
				id:body.baseTagId,
				value:body.value,
				creationTime:body.creationTime,
				creator:body.creator,
				votes : {up:[],down:[]}
		};
		
		return[doc,{code: 201, body:'{"status":201,"content":{"message":"updated"}}', headers : {"Content-Type":"application/json"} }];
	}
	else{
		return[null,{code: 400, body:'{"status":400,"error":"invalid request"}', headers : {"Content-Type":"application/json"} }];
	}
	
	
//	
};
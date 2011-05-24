/**
 * Extracts a valid set of resource identifiers out of a URI parameters. 
 */
module.exports = function(p) {
	
	if(p.taskId && p.submissionId && p.tagId){
		return {
				taskId: p.taskId,
				submissionId: p.submissionId,
				tagId: p.tagId,
		} ;
	}
	else if(p.taskId && p.submissionId){
		return {
				taskId: p.taskId,
				submissionId: p.submissionId
		} ;
	}
	else if(p.taskId && p.tagId){
		return  {
				taskId: p.taskId,
				tagId: p.tagId
		} ;
	}
	else if(p.taskId && p.commentId){
		return  {
				taskId: p.taskId,
				commentId: p.commentId
		} ;
	}
	else if(p.taskId){
		return {
				taskId: p.taskId
		} ;
	}
	else{
		return null;
	}
};

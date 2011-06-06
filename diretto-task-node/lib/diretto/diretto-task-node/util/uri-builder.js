module.exports = function(options){
	
	var baseUri = options.task.external.uri;
	// TODO fix screwed baseUri
	
	var builder = function(p){
		 if(p.taskId && p.submissionId && p.tagId){
			 return baseUri+"/task/"+taskId+"/submission/"+submissionId+"/tag/"+tagId;
		}
		else if(p.taskId && p.submissionId){
			return baseUri+"/task/"+taskId+"/submission/"+submissionId;
		}
		else if(p.taskId && p.tagId){
			return baseUri+"/task/"+taskId+"/tag/"+tagId;
		}
		else if(p.taskId && p.commentId){
			return  baseUri+"/task/"+p.taskId+"/comment/"+p.commentId;
		}
		else if(p.taskId){
			return  baseUri+"/task/"+p.taskId;
		}		
		else if(p.tagId){
			return  baseUri+"/tag/"+p.tagId;
		}
		else{
			return baseUri;
		}
	};
	
	return {
		task : function(task){
			return builder({
					taskId: task
			});
		},		
		tag : function(tag){
			return builder({
				tagId: tag
			});
		},
		comment : function(task, comment){
			return builder({
					taskId: task,
					commentId: comment
			});
		},
		submission : function(task, submission){
			return builder({
				taskId: task,
				submissionId: submission
			});			
		},
		taggedTask : function(task, submission){
			return builder({
				taskId: task,
				tagId: tag
			});			
		},	
		taggedSubmission : function(task, submission, tag){
			return builder({
				taskId: p.task,
				submissionId: submission,
				tagId: tag
			});			
		},				
	}
};
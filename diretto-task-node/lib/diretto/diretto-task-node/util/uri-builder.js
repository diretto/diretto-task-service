module.exports = function(options){
	
	var baseUri = options.task.external.uri;
		
	var builder = function(p){
		 if(p.taskId && p.submissionId && p.tagId){
			 return baseUri+"/task/"+p.taskId+"/submission/"+p.submissionId+"/tag/"+p.tagId;
		}
		else if(p.taskId && p.submissionId){
			return baseUri+"/task/"+p.taskId+"/submission/"+p.submissionId;
		}
		else if(p.taskId && p.tagId){
			return baseUri+"/task/"+p.taskId+"/tag/"+p.tagId;
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
		else if(p.queryId && p.page){
			return  baseUri+"/query/stored/"+p.queryId+"/cursor/"+p.page;
		}
		else if(p.queryId){
			return  baseUri+"/query/stored/"+p.queryId;
		}		else{
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
		taggedTask : function(task, tag){
			return builder({
				taskId: task,
				tagId: tag
			});			
		},	
		taggedSubmission : function(task, submission, tag){
			return builder({
				taskId: task,
				submissionId: submission,
				tagId: tag
			});			
		},	
		query : function(query){
			return builder({
				queryId: query
			});			
		},			
		queryPage : function(query, page){
			return builder({
				queryId: query,
				page : page
			});			
		},			
	}
};
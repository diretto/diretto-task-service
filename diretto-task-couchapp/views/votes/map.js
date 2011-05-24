/**
 * Provides a list of all votable resources with the voting results.
 * 
 * @author Benjamin Erb
 */
function(doc) {
	
	// !code vendor/diretto/config.js
	
  if (doc.type == "task") {
	  
    emit([doc._id.substr(2)],{
    	"votes" : {
    		"link" : {
    			"rel":"self",
    			"link": config.taskServiceBaseUri +"/task/"+ doc._id.substr(2) +"/votes"
    		},
    		"up" : doc.votes.up.length,
    		"down" : doc.votes.down.length,
    	}
    });
    
    // TODO: iterate tags
    // TODO: iterate comments
    if(doc.comments){
		  var commentIds = Object.keys(doc.comments);
		  for(var idx in commentIds){
			  emit([doc._id.substr(2),"comment",commentIds[idx]],{
			    	"votes" : {
			    		"link" : {
			    			"rel":"self",
			    			"link": config.taskServiceBaseUri +"/task/"+ doc._id.substr(2) +"/comment/"+commentIds[idx]+"/votes"
			    		},
			    		"up" : doc.comments[commentIds[idx]].votes.up.length,
			    		"down" : doc.comments[commentIds[idx]].votes.down.length
			    	}
			    });
			  
		  }
    }
  // TODO: iterate submissions
    // TODO: iterate submission tags
  }
};

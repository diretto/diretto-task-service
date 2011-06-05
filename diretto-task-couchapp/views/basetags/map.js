/**
 * Provides a view of all tags. Key is the tag id, value the tag.
 * 
 * @author Benjamin Erb
 */
function(doc) {
	// !code vendor/diretto/config.js
  if (doc.type === "basetag") {
    emit(doc._id.substr(2),{
    	"content" : {
	    	"baseTag" : {
	    		"link" : {
	    			"rel":"self",
	    			"href" : config.taskServiceBaseUri +"/tag/"+ doc._id.substr(2)   			
	    		},
	    		value :  doc.value,
	    		creationTime : doc.creationTime,
	    		creator : {
	    			"link": {
	    				"rel":"self",
	    				"href": config.coreServiceBaseUri +"/user/"+ doc.creator
	    			}
	    		}
	    	}
    	},
    	"etag" : doc._rev
    });

  }
};

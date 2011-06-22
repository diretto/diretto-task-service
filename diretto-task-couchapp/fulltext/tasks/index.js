/*
 * http://localhost:5984/tasks/_fti/_design/tasks/tasks?q=tags:d456c1f6fa85ed2f6a26b15139c6ddc2&debug=true
 * 
 * q=tags:(d456c1f6fa85ed2f6a26b15139c6ddc2 AND asd) AND ((lat1<double>:[0 TO 120] OR lat2<double>:[0 TO 120]) AND ( lon1<double>:[0 TO 120] OR lon2<double>:[0 TO 120] ))
 * 
 * 
 * 
 * 
 * q=tags:(d456c1f6fa85ed2f6a26b15139c6ddc2 AND asd) 
 * 
 * 	AND 
 * 	(
 * 		(lat1<double>:[0 TO 45] OR lat2<double>:[0 TO 45] OR ((lat1<double>:[-90 TO 0]) AND (lat2<double>:[45 TO 90]))) 
 * 		AND 
 * 		(lon1<double>:[0 TO 120] OR lon2<double>:[0 TO 120] OR ((lon1<double>:[-180 TO 0]) AND (lon2<double>:[120 TO 180]))) 
 *   )
 *   
 *  AND 
 *  
 *    (start<long>:[1246302951765 TO 1309374951765] OR end<long>:[1246302951765 TO 1309374951765] OR ((start<long>:[0 TO 1246302951765]) AND (end<long>:[1309374951765 TO 2918834151765]))) 
 *   
 *    
 * q=tags:(d456c1f6fa85ed2f6a26b15139c6ddc2 AND asd)	AND((lat1<double>:[0 TO 45] OR lat2<double>:[0 TO 45] OR ((lat1<double>:[-90 TO 0]) AND (lat2<double>:[45 TO 90]))) AND (lon1<double>:[0 TO 120] OR lon2<double>:[0 TO 120] OR ((lon1<double>:[-180 TO 0]) AND (lon2<double>:[120 TO 180]))) ) AND (start<long>:[1246302951765 TO 1309374951765] OR end<long>:[1246302951765 TO 1309374951765] OR ((start<long>:[0 TO 1246302951765]) AND (end<long>:[1309374951765 TO 2918834151765])))
 * 
 * 
 */


function (doc) {
	
	var debug = true;
	// !code vendor/diretto/rfc3339.js
	
	var store = (debug ? "yes" : "no");
	
	
	if(doc.type && doc.type  === 'task' && doc.visible && !!doc.visible){
	
		var ret=new Document();
		
		ret.add(parseRFC3339(doc.creationTime).getTime(), {"field":"creationTime","type":"long", "store": store});
		
		ret.add(parseRFC3339(doc.constraints.time.start).getTime(), {"field":"start","type":"long", "store": store});
		
		ret.add(parseRFC3339(doc.constraints.time.end).getTime(), {"field":"end","type":"long", "store": store});

		//lon, lat
		ret.add(doc.constraints.location.bbox[0], {"field":"lon1","type":"double", "store": store});
		ret.add(doc.constraints.location.bbox[1], {"field":"lat1","type":"double", "store": store});
		ret.add(doc.constraints.location.bbox[2], {"field":"lon2","type":"double", "store": store});
		ret.add(doc.constraints.location.bbox[3], {"field":"lat2","type":"double", "store": store});
		
		//Tags
		if(doc.tags){
			for (tag in doc.tags) {
				if (doc.tags.hasOwnProperty(tag)) {
					  log.info(tag);
					  ret.add(tag,{"field":"tags","type":"string", "store": store});
				}
			}
		 }
		
		//Submissions
		if(doc.submissions){
			var subs = 0;
			for (sub in doc.submissions) {
				if (doc.submissions.hasOwnProperty(sub)) {
					subs++;
				}
			}
			ret.add(subs,{"field":"submissions","type":"int", "store": store});
		 }
		
		//Votes
		if(doc.votes){
			ret.add(doc.votes.up.length,{"field":"upvotes","type":"int", "store": store});	
		}
			
		
		return ret; 
	}
};

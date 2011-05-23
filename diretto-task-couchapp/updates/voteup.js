/**
 * Adds a vote to the given entity.
 * 
 * @author Benjamin Erb
 */
function(doc, req) {
	var x  = JSON.parse(req.body);
	return[null, JSON.stringify(x)];
//	if(!doc || doc.type !== "task"){
//		return[null, "hello new"+req.uuid+"\n"];
//	}
//	else{
////		try{
//			var x = {};
//				x = JSON.parse(req.body);
//				return[null, JSON.stringify(x.foo)];
////		}
////		catch (e) {
////			return[null, "catch"];
////		}
////		finally{
////			return[null, "finally"];
////		}
////		
//		 
//		
////		if(!doc.bla){
////			doc.bla = [];
////		}
////		doc.bla.push(req.uuid);
////		return[doc, {code: 303, body:"hello existing\n"+req.uuid+"\n",headers : { "X-Response-Code" : "303" } }];
//	}
};
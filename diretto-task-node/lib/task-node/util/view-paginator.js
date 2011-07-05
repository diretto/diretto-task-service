var barrierpoints = require('barrierpoints');


module.exports = function(db) {
	/*
	 * Callback function(err, {
	 * 	list : []
	 *  next? : next
	 *  previous? : previous 
	 *  etag ? : etag
	 * })
	 */
	var getPage = function(view, cursor, paginationSize, descending, extractKeyFun, callback){
		var result = {
				list : []
		};

		var b = barrierpoints(2, function() {
			callback(null, result);
		});
		
//		callback(null, {
//			list : ["foo", "bar"],
//			next : "456",
//			previous : "123"
//		});

		//fetch page to result.list
		db.view(view, {
			limit : (paginationSize+1),
			"descending" : descending,
			startkey : cursor			
		}, function(err, dbRes){
			if(err){
				b.abort(function(){
					callback(err)
				});
			}
			else{
				if (dbRes.length > 0) {
					var i = 0;
					for (; i < paginationSize && i < dbRes.rows.length; i++) {
						result.list.push(extractKeyFun(dbRes.rows[i]));
					}
				}
				//fetch next to result.next, when existing
				if (i === paginationSize && dbRes.rows[i]) {
					result['next'] = extractKeyFun(dbRes.rows[i]);
				}				
				b.submit();
			}
		});
		
		//fetch previous to result.previous, when existing
		db.view(view, {
			limit : (paginationSize+1),
			"descending" : (!descending),
			startkey : cursor			
		}, function(err, dbRes){
			if(dbRes){
				if (dbRes.rows.length > 1) {
					result['previous'] = extractKeyFun(dbRes.rows[dbRes.rows.length - 1]);
				}
			}
			b.submit();
		});		
	};
	
	return {
		getPage : getPage 
	};
};
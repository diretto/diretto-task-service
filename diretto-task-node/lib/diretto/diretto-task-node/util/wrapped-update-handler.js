module.exports = function(db) {

	var isRetryable = function(err) {
		if(err && err.error === 'conflict'){
			return true;	
		}
		else{
			return false;
		}
	};
	
	
	//Wrapper that bugfixes https://issues.apache.org/jira/browse/COUCHDB-648 as well as missing response code from couch-client
	//When response code is ok, but X-Response-Code is a valid header, or the document contains this value, emit error.
	var request = function(method, uri, data, callback){
		db.request(method, uri, data, function(err, result) {
			if(err){
				callback(err);
			}
			else if(result.status && !(result.status === 200 || result.status === 201 || result.status === 202)){
				var error = {"status" : result.status};
				if(result.status === 409){
					error.error = "duplicate";
				}
				else{
					error.error = "error";
				}
				callback(error);
			}
			else if(result.error){
				callback(result);
			}
			else{
				callback(null, result);
			}
		});
	};

	// h.db.request('POST',
	// "/tasks/_design/tasks/_update/addcomment/t-"+req.uriParams.taskId, data,
	// function(err,result){

	var retryingUpdateHandler = function retryingUpdateHandler(method, uri, data, callback, attempts, factors, backoff) {
		if (attempts >= 1) {
			request(method, uri, data, function(err, result) {
				if (err) {
					if(attempts <= 1){
						callback(err);
					}
					else{
						if (isRetryable(err)) {
							var nextBackoff = Math.floor(factors * backoff + (Math.random()*backoff));
							console.log("RETRYING in "+nextBackoff);
							setTimeout(function() {
								retryingUpdateHandler(method, uri, data, callback, attempts - 1, factors, nextBackoff);
							}, nextBackoff);
						}
						else {
							callback(err);
						}
					}
				}
				else {
					callback(err, result)
				}
			});
		}
		else {
			callback({'error':"all attempts failed"});
		}

	};

	return {
		retryable : function(method, uri, data, callback) {
			return retryingUpdateHandler(method, uri, data, callback, 6, 1.1, 80);
		}
	}

};
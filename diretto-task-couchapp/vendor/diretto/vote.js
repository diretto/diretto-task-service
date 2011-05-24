//TODO: improve efficiency by ordering votes, using insertion sort and binary search for lookup

var vote = {
	add : function(votes, user, type) {
		//search for previous vote, if found, remove
		["up","down"].forEach(function(t){
			for(var i = votes[t].length-1; i >= 0; i--){  
			    if(votes[t][i] == user){              
			    	votes[t].splice(i,1);    
			    	break;
			    }
			}
		});
		
		//add new vote
		votes[type].push(user);
//		votes[type].sort();
	},
	remove : function(votes, user) {
		["up","down"].forEach(function(t){
			for(var i = votes[t].length-1; i >= 0; i--){  
			    if(votes[t][i] === user){              
			    	votes[t].splice(i,1);    
			    	break;
			    }
			}
		});
	}
};

if (typeof (exports) === 'object') {
	exports.vote = vote;
};
var CouchClient = require('./lib/dependencies/couch-client');
var Users = CouchClient("http://ulmapi.de:80/v1/oepnv");

//Users.get("9001001", function (err, doc) {
//	  console.dir(doc);
//	});


Users.view("/v1/oepnv/_design/oepnv/_spatial/pointsFull?bbox=0,0,0,0", {}, function(err, doc) {
	for(var i = 0; i<doc.rows.length;i++){
		console.dir(doc.rows[i]);
		
	}
	console.dir(err);
});
//
//
//Users.request("GET", "/v1/oepnv/_design/oepnv/_spatial/pointsFull?bbox=0,0,90,90", function (err, result) {
//	console.dir(err);
//	console.dir(result);
//
//});

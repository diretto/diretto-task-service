var path= require('path');

require.paths.push(path.join(__dirname, 'lib', 'dependencies'));

var uuid= require('node-uuid');
var restify = require('node-restify');

var server = restify.createServer({
	  serverName: 'MySite',  // returned in the HTTP 'Server:` header
});


var log = restify.log;

log.level(restify.LogLevel.Trace);


server.get('/my/:name', function(req, res) {
	console.log(req.uriParams);
	console.dir(req._url);
	console.dir(req.params);
  res.send(200, {
    name: req.uriParams.name
  });
});

server.post('/my', function(req, res) {
  // name could be in the query string, in a form-urlencoded body, or a
  // JSON body
  res.send(201, {
    name: req.params.name
  });
});

server.del('/my/:name', function(req, res) {
  res.send(204);
});

server.listen(8080);

//URIs including version number: http://example/v2
var config = {
	"taskServiceBaseUri" : "http://localhost:8006/v2",
	"coreServiceBaseUri" : "http://localhost:8001/v2"
};

if (typeof (exports) === 'object') {
	exports.config = config;
};
//URIs including version number: http://example/v2
var config = {
	"taskServiceBaseUri" : "http://taskservice/v2",
	"coreServiceBaseUri" : "http://coreservice/v2"
};

if (typeof (exports) === 'object') {
	exports.config = config;
};
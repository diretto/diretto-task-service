var SERVER_SIGNATURE = "diretto Task API Node/0.1.0";

var restify = require('node-restify');

var TaskNode = exports.TaskNode = function(options) {
	this.options = options;
	console.log("hal");
};

TaskNode.prototype.bind = function(){
	
};
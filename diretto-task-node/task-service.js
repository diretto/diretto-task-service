/**
 * diretto Task Service Node
 * 
 * (c) Benjamin Erb; Tobias Schlecht
 */

var path = require('path');

require.paths.push(path.join(__dirname, 'lib', 'dependencies'));
require.paths.push(path.join(__dirname, 'lib', 'diretto'));


var direttoUtil = require('diretto-util');
var TaskNode = require('diretto-task-node'); //TODO:


var config = {};
config['task'] = direttoUtil.readConfigFileSync(path.join(__dirname, 'conf', 'task.json'));

//TODO:
//
//var taskNode = new TaskNode(config);
//
//console.dir(taskNode);
//
////taskNode.bind(config.apiNode.bind.port || 8001, config.apiNode.bind.ip || "127.0.0.1");

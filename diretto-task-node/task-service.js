/**
 * diretto Task Service Node
 * 
 * (c) Benjamin Erb; Tobias Schlecht
 */

var path = require('path');

require.paths.push(path.join(__dirname, 'lib', 'dependencies'));
require.paths.push(path.join(__dirname, 'lib', 'diretto'));


var direttoUtil = require('diretto-util');
var TaskNode = require('diretto-task-node'); 

var config = {};
config['task'] = direttoUtil.readConfigFileSync(path.join(__dirname, 'conf', 'task.json'));

var taskNode = TaskNode(config);
taskNode.bind();
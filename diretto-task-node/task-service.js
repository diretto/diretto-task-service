/**
 * diretto Task Service Node
 * 
 * @author Benjamin Erb
 * 
 */

var path = require('path');

require.paths.push(path.join(__dirname, 'lib'));
require.paths.push(path.join(__dirname, 'vendor'));


var direttoUtil = require('diretto-util');
var TaskNode = require('diretto-task-node'); 

var config = {};
config['task'] = direttoUtil.readConfigFileSync(path.join(__dirname, 'conf', 'task.json'));

var taskNode = TaskNode(config);
taskNode.bind();
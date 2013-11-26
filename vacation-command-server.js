/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var serverKernel = require('./lib/lib-server/server-kernel.js');

exports.name = 'server';
exports.usage = '<command> [options]';
exports.desc = 'launch a Node.js server';
exports.register = function (commander) {

	var child_process = require('child_process');
	var spawn = child_process.spawn;

	function getConf(){
		return vacation.project.getTempPath('server/conf.json');
	}

	function getRoot(root)	{
		if(vacation.util.exists(root)){
			if(!vacation.util.isDir(root)){
				vacation.log.error('invalid document root');
			}
		} else {
			vacation.util.mkdir(root);
		}
		return vacation.util.realpath(root);
	}

	function printObj(obj, prefix){
		prefix = prefix || '';
		for(var key in obj){
			if(obj.hasOwnProperty(key)){
				if(vacation.util.is(obj[key], 'Object')){
					printObj(obj[key], prefix + key + '.');
				} else {
					console.log(prefix + key + '=' + obj[key]);
				}
			}
		}
	}
	//console.log(vacation.project.getTempPath('www'));return;
	commander
		.option('-p, --port <int>', 'server listen port', parseInt, 8080)
		.option('--root <path>', 'document root', getRoot, vacation.project.getTempPath('www'))
		.option('--script <name>', 'the name of file that to config/expand the server', String)
		//.option('--timeout <seconds>', 'start timeout', parseInt, 15)
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var conf = getConf();
			switch (cmd) {
				case 'start': 
					serverKernel.start();
					break;
				case 'stop':
					break;
				case 'reload':
					break;
				case 'restart':
					break;
				case 'info':
					break;
				case 'open':
					break;
				default:
					commander.help();
			}
			//console.log(root);
		});

	commander
		.command('start')
		.description('start server');

	commander
		.command('stop')
		.description('shutdown server');

	commander
		.command('reload')
		.description('reload the vacation_server.js');

	commander
		.command('restart')
		.description('restart server');

	commander
		.command('info')
		.description('output server info');

	commander
		.command('open')
		.description('open document root directory');

	commander
		.command('start')
		.description('start server');
}

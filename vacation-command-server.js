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

	commander
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			switch (cmd) {
				case 'start': 
					serverKernel.start();
					break;
				default:
					commander.help();
			}
		});

	commander
		.command('start')
		.description('start server');
}

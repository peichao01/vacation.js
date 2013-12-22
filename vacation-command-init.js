/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var fs = require('fs');

var util = require('./lib/lib-build/util');

exports.name = 'init';
exports.usage = '<command> [options]';
exports.desc = 'init your project';
exports.register = function (commander) {

	commander
		.option('-s, --structure', 'init a dir structure for a new project.')
		.option('-c, --config', 'create a template config file in the current dir.')
		.option('-f, --force', 'force to overwrite the file or directory.')
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();

			if(options.config){
				var targetConfigFilePath = pth.resolve(vacation.cli.cmd_cwd, 'vacation.json');
				if(fs.existsSync(targetConfigFilePath) && !options.force){
					vacation.log.error('config file has already exists('+targetConfigFilePath+'). if you want to overwrite it, use the -f option.');
				}
				else{
					try{
						var tmplConfigContent = util.readFile(vacation.cli.templateConfigFilePath);
						util.writeFile(targetConfigFilePath, tmplConfigContent);	
						vacation.log.success('init config file succeed at: ' + targetConfigFilePath);
					}
					catch(e){
						vacation.log.error('init config file failed. error: ' + e.message);
					}
				}

			}

			if(options.structure){
				
			}

			if(!options.config && !options.structure){
				commander.help();
			}
		});

	// commander
	// 	.command('config')
	// 	.description('create a template config file in the current dir.');
}

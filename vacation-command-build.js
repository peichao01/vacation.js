/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var buildKernel = require('./lib/lib-build/build-kernel.js');

exports.name = 'build';
exports.usage = '[options]';
exports.desc = 'build your project';
exports.register = function (commander) {

	//console.log(vacation.project.getTempPath('www'));return;
	commander
		.option('-d, --dest <names>', 'release output destination')
		//.option('-m, --md5 [level]', 'md5 release option')
		//.option('-D, --domains', 'add domain name')
		.option('-o, --optimize', 'with optimizing')
		.option('-p, --pack', 'with package')
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			//var cmd = args.shift();
			var conf = vacation.cli.config.build;
			var configFileDir = pth.dirname(vacation.cli.configFilePath);
			//conf.configFilePath = vacation.cli.configFilePath;
			conf.src = pth.resolve(configFileDir, conf.src);
			conf.base = pth.resolve(configFileDir, conf.base);
			//console.log(conf.src);return;
			//console.log(options);
			//console.log(conf);
			if(options.dest) conf.dest = dest;
			buildKernel.findMainFiles(conf, function (mainFiles) {
				buildKernel.generateMap(mainFiles, conf);
			});
			
		});
}

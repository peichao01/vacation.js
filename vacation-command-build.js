/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var buildKernel = require('./lib/lib-build/build-kernel.js');

exports.name = 'build';
exports.usage = '<command> [options]';
exports.desc = 'build your project';
exports.register = function (commander) {

	//console.log(vacation.project.getTempPath('www'));return;
	commander
		//.option('-d, --dest <names>', 'release output destination')
		//.option('-m, --md5 [level]', 'md5 release option')
		//.option('-D, --domains', 'add domain name')
		//.option('-o, --optimize', 'with optimizing')
		//.option('-p, --pack', 'with package')
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var conf = vacation.cli.config.build;
			var configFileDir = vacation.cli.configFileDir;
			conf.src = pth.resolve(configFileDir, conf.src);
			conf.dest = pth.resolve(configFileDir, conf.dest);
			if(!conf.base){
				conf.base = conf.src;
			}
			else{
				conf.base = pth.resolve(configFileDir, conf.base);
			}
			if(conf.www) conf.www = pth.resolve(configFileDir, conf.www);

			//if(options.dest) conf.dest = options.dest;

			if(cmd === 'start'){
				buildKernel.getPathedAlias(conf);
				//console.log(conf);process.exit(0);
				//buildKernel.find_all_and_main_files(conf, function (mainFiles, availableFiles) {
				//	console.log(availableFiles);process.exit(0);
				//	buildKernel.dealDependencies(availableFiles, conf, function () {
				//		buildKernel.writeMapFile();
				//		buildKernel.transport(conf);
				//		buildKernel.concatToMain(conf);
				//	});
				//});
				//console.log(conf);process.exit(0);
				buildKernel.check_alias_topDir_conflict();
				buildKernel.dealAllFiles(function(){
					buildKernel.dealDependencies();
					buildKernel.checkCircularReference();
					buildKernel.writeMapFile();
					buildKernel.transport();
				});
			}
			else{
				commander.help();
			}
		});

	commander
		.command('start')
		.description('start build');
}

/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var buildKernel = require('./lib/lib-build/build-kernel.js');
var buildUtil = require('./lib/lib-build/util.js');

exports.name = 'build';
exports.usage = '<command> [options]';
exports.desc = 'build your project';
exports.register = function (commander) {

	var COMMAND = {
		TPL: 'tpl',
		START: 'start'
	};

	//console.log(vacation.project.getTempPath('www'));return;
	commander
		//.option('-d, --dest <names>', 'release output destination')
		//.option('-m, --md5 [level]', 'md5 release option')
		//.option('-D, --domains', 'add domain name')
		//.option('-o, --optimize', 'with optimizing')
		//.option('-p, --pack', 'with package')
		.option('-m, --map', 'write the map.json file to the $cmd_cwd dir.')
		.option('-c, --concat', 'concat all modules that the $pkg module dependen-'
				+ '\n\tcies. config the output file rule in the vacation.json')
		.option('-t, --transport <dir>', 'transport and output the results to the `dir` dir. '
				+ '\n\t`dir` relative to the $dest dir. ')
		.option('-o, --optimize', 'optimize/uglify the modules that transported '
				+ '\n\tor/and concated results.')
		.option('-C, --cssinline', 'inline dependency css file content to the '
				+ '\n\tconcated file.')
		.option('-H, --Handlebars', 'precompile Handlebars template')
		.option('-T, --tplonly', 'only use tpl(.tpl|.html) even if transported '
				+ '\n\ttpl(.tpl.js|.html.js) exists too.')
		.option('-w, --watch', '[tpl only] watch and build templates')
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var conf = vacation.cli.config.build;
			var configFileDir = vacation.cli.configFileDir;
			if(!configFileDir){
				vacation.log.error("you should provide a config file(vacation.json) if you need the build ability. see ["+vacation.cli.info.homepage+"] for more information."
									+ vacation.cli.tips.initConfig);
			}
			if(!conf.dest || !conf.src || !conf.base){
				vacation.log.error('"dest" and "src" and "base" field must be provided in the config file build object.' + vacation.cli.tips.initConfig);
			}
			conf.src = pth.resolve(configFileDir, conf.src);
			conf.dest = pth.resolve(configFileDir, conf.dest);
			if(!conf.base){
				conf.base = conf.src;
			}
			else{
				conf.base = pth.resolve(configFileDir, conf.base);
			}
			if(conf.www) conf.www = pth.resolve(configFileDir, conf.www);

			if(buildUtil.values(COMMAND).indexOf(cmd) < 0) {
				commander.help();
			}
			// 任何命令都要先执行前几个步骤
			else{
				//console.log(conf);process.exit(0);

				// replace the alias with the paths value
				buildKernel.getPathedAlias(conf);
				// check alias & paths & base-child-dir name conflict
				buildKernel.check_alias_topDir_conflict();
				// deal all the files in the first time
				buildKernel.dealAllFiles({
					isConsoleIgnored: cmd === COMMAND.START,
					callback: function(){

						if(cmd === COMMAND.START){
							// deal module dependencies
							buildKernel.dealDependencies();
							// check circular reference
							buildKernel.checkCircularReference();
							// write the map.json file to the cmd_cwd
							if(options.map){
								buildKernel.writeMapFile();
							}

							// transport
							if(options.transport){
								buildKernel.transport({
									isOptimize: options.optimize,
									transportDir: options.transport
								});
							}
							// concat
							if(options.concat){
								buildKernel.concatByPackage({
									isOptimize: options.optimize,
									isCssInline: options.cssinline
								});
							}
						}
						else if(cmd == COMMAND.TPL){
							//console.log(options.transport);
							buildKernel.TPLBuild({
								isOptimize: options.optimize,
								isWatch: options.watch
							});
						}
					}
				});
			}
		});

	commander
		.command(COMMAND.START)
		.description('start build');
	commander
		.command(COMMAND.TPL)
		.description('build templates');
}

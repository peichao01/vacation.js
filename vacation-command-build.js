/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var buildKernel = require('./lib/lib-build/build-kernel.js');
var buildUtil = require('./lib/lib-build/util.js');
var resourceManager = require('./lib/lib-build/resource_manager.js');

exports.name = 'build';
exports.usage = '<command> [options]';
exports.desc = 'build your project';
exports.register = function (commander) {

	var COMMAND = {
		TPL: 'tpl',
		START: 'start'
	};

	commander
		.option('-m, --map', 'write the map.json file to the $cmd_cwd dir.')
		.option('-c, --concat', 'concat all modules that the $pkg module dependen-'
				+ '\n\t cies. config the output file rule in the vacation.json')
		.option('-t, --transport <dir>', 'transport and output the results to the `dir` dir. '
				+ '\n\t `dir` relative to the $dest dir. ')
		.option('-o, --optimize', 'optimize/uglify the modules that transported '
				+ '\n\t or/and concated results.')
		.option('-C, --cssinline', 'inline dependency css file content to the '
				+ '\n\t concated file.')
		.option('-H, --Handlebars [mode]', 'precompile Handlebars template.'
				+ '\n\t mode = 0, not precompile'
				+ '\n\t mode = 1, [NOT RECOMMAND] precompile and deal '
				+ 		'\n\t\t Handlebars.compile() in modules'
				+ '\n\t mode = 2, precompile but keep the Handlebars.compile'
				+ '\n\t mode = 3, precompile and keep the fn, and insert a Handlebars patch'
				+ 		'\n\t\t on top of the package file(transport or concat)'
				+ '\n\t mode = 4, do nothing but console.log the patch'
				+ '\n\t default to 0', 0)
		.option('-l, --log <mark>', 'what info to log when building'
				+ '\n\t c  - which module was concated when --concat'
				+ '\n\t nc - which module was not concated when --concat'
				+ '\n\t i  - which module was ignored'
				+ '\n\t t  - which module was transported'
				+ '\n\t nt  - which module was not transported'
				+ '\n\t r  - remote module founded in the process')
		.option('-T, --tplonly', 'only use tpl(.tpl|.html) even if transported '
				+ '\n\ttpl(.tpl.js|.html.js) exists too.')
		.option('-w, --watch', '[tpl only] watch and build templates')
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var conf = vacation.cli.config.build;

			var log = options.log = dealOptionLog(options.log);

			////////////////////////////////////////////////
			// options.Handlebars == 4 特殊对待
			options.Handlebars = buildUtil.int(options.Handlebars) || 0;
			if(cmd === COMMAND.START && options.Handlebars == 4){
				var patch = buildUtil.readFile(pth.resolve(__dirname,'./lib/lib-build/tpl_hb_precompile.txt'));
				console.log(patch);
				return;
			}
			////////////////////////////////////////////////

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
				// replace the alias with the paths value
				buildKernel.getPathedAlias(conf);
				resourceManager.setField('pathedAlias', conf.real_alias_rootPathed);

				// check alias & paths & base-child-dir name conflict
				buildKernel.check_alias_topDir_conflict();
				// deal all the files in the first time
				buildKernel.dealAllFiles({
					log: log
					, callback: function(){
						var r = resourceManager.getResource();

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
									transportDir: options.transport,
									isTplonly: options.tplonly,
									HandlebarsMode: options.Handlebars,
									log: log
								});
							}
							// concat
							if(options.concat){
								buildKernel.concatByPackage({
									isOptimize: options.optimize,
									isCssInline: options.cssinline,
									isWriteMap: options.map,
									isTplonly: options.tplonly,
									HandlebarsMode: options.Handlebars,
									log: log
								});
							}
						}
						// 这里不支持预编译模板
						// 只有部署编译时才可以
						else if(cmd == COMMAND.TPL){
							//console.log(options.transport);
							buildKernel.TPLBuild({
								isOptimize: options.optimize,
								isWatch: options.watch,
								log: log
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
};

function dealOptionLog(option){
	if(option){
		option = option.split('');
		return {
			concat: option.indexOf('c') >= 0,
			not_concat: option.indexOf('nc') >= 0,
			ignore: option.indexOf('i') >= 0,
			transport: option.indexOf('t') >=0,
			not_transport: option.indexOf('nt') >=0,
			remote_module: option.indexOf('r') >= 0
		}
	}
	return option;
}
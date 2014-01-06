/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var buildKernel = require('./lib/lib-build/kernel2.js'); //require('./lib/lib-build/build-kernel.js');
var buildUtil = require('./lib/lib-build/util.js');
var resourceManager = require('./lib/lib-build/resource_manager.js');
var Module = require('./lib/lib-build/Module');

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
		.option('-o, --optimize', 'optimize/uglify the modules that transported '
				+ '\n\t or/and concated results.')
		.option('-C, --cssinline', 'inline dependency css file content to the '
				+ '\n\t concated file.')
		.option('-H, --Handlebars [mode]', 'precompile Handlebars template.'
				+ '\n\t mode = 0, not precompile'
				+ '\n\t mode = 1, do nothing but console.log the patch'
				+ '\n\t mode = 2, precompile'
				+ '\n\t mode = 3, precompile and insert a Handlebars patch'
				+ 		'\n\t\t on top of the main package file'
				+ '\n\t default to 0', 0)
		.option('-u, --underscore [mode]', 'precompile underscore template.'
				+ '\n\t the args is the same to --Handlebars.')
		.option('-l, --log <mark>', 'what info to log when building'
				+ '\n\t c  - which module was concated when --concat'
				+ '\n\t C - which module was not concated when --concat'
				+ '\n\t i  - which module was ignored'
				+ '\n\t t  - which module was transported'
				+ '\n\t T  - which module was not transported'
				+ '\n\t r  - remote module founded in the process')
		.option('-w, --watch', '[tpl only] watch and build templates')
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var cli = vacation.cli,
				conf = cli.config.build;

			var log = options.log = dealOptionLog(options.log);

			////////////////////////////////////////////////
			// options.Handlebars == 4 特殊对待
			options.Handlebars = buildUtil.int(options.Handlebars) || 0;
			if(options.Handlebars && options.underscore) vacation.log.error('which template engine are you using?');
			if(cmd === COMMAND.START && (options.Handlebars == 1 || options.underscore == 1)){
				var tpl_patch_name = options.Handlebars ? 'tpl_hb_precompile' : 'tpl_underscore_precompile';
				var patch = buildUtil.readFile(pth.resolve(__dirname,'./lib/lib-build/'+tpl_patch_name+'.js'));
				console.log(patch);
				return;
			}
			////////////////////////////////////////////////
			buildUtil.setOptions(options);

			// build 构建必须有配置文件，且配置文件中配置的相对路径必须相对一个固定的路径，
			// 那么配置文件本身所在的目录（configFileDir）是一个最佳选择。
			// 而命令的执行目录可以在 configFileDir 内部的任意目录内执行。
			// 这样即保证了配置的路径能得到一个固定的解析结果，又保证了命令行执行目录的灵活性。
			var configFileDir = vacation.cli.configFileDir;
			if(!configFileDir){
				vacation.log.error("you should provide a config file(" + vacation.cli.configFileName
									+ ") if you need the build ability. see [" + vacation.cli.info.homepage
									+ "] for more information."
									+ vacation.cli.tips.initConfig);
			}

			dealConfig(conf);
			dealPkg(conf);

			if(buildUtil.values(COMMAND).indexOf(cmd) < 0) {
				commander.help();
			}
			else{
				//// replace the alias with the paths value
				buildKernel.getPathedAlias(conf);
				buildUtil.deal_available_ignore(conf);
				if(cmd == COMMAND.START){
					if(options.concat){
						buildKernel.findPackageModules(function(bags){
							if(!bags.length){
								vacation.log.error('no package main file was found under the config file directory('+configFileDir+').');
							}
							bags.forEach(function(bag){
								bag.writeFile();
							});
						});
					}
					else{
						commander.help();
					}
				}
				else if(cmd == COMMAND.TPL){
					buildKernel.TPLBuild({
						isOptimize: options.optimize,
						isWatch: options.watch,
						log: log
					});
				}
				//// replace the alias with the paths value
				//buildKernel.getPathedAlias(conf);
				//resourceManager.setField('pathedAlias', conf.real_alias_rootPathed);

				//// check alias & paths & base-child-dir name conflict
				//buildKernel.check_alias_topDir_conflict();
				//// deal all the files in the first time
				//buildKernel.dealAllFiles({
				//	log: log
				//	, callback: function(){
				//		var r = resourceManager.getResource();

				//		if(cmd === COMMAND.START){
				//			// deal module dependencies
				//			buildKernel.dealDependencies();
				//			// check circular reference
				//			buildKernel.checkCircularReference();
				//			// write the map.json file to the cmd_cwd
				//			if(options.map){
				//				buildKernel.writeMapFile();
				//			}

				//			// transport
				//			if(options.transport){
				//				buildKernel.transport({
				//					isOptimize: options.optimize,
				//					transportDir: options.transport,
				//					isTplonly: options.tplonly,
				//					HandlebarsMode: options.Handlebars,
				//					log: log
				//				});
				//			}
				//			// concat
				//			if(options.concat){
				//				buildKernel.concatByPackage({
				//					isOptimize: options.optimize,
				//					isCssInline: options.cssinline,
				//					isWriteMap: options.map,
				//					isTplonly: options.tplonly,
				//					HandlebarsMode: options.Handlebars,
				//					log: log
				//				});
				//			}
				//		}
				//		// 这里不支持预编译模板
				//		// 只有部署编译时才可以
				//		else if(cmd == COMMAND.TPL){
				//			//console.log(options.transport);
				//			buildKernel.TPLBuild({
				//				isOptimize: options.optimize,
				//				isWatch: options.watch,
				//				log: log
				//			});
				//		}
				//	}
				//});
			}
		});

	commander
		.command(COMMAND.START)
		.description('start build');
	commander
		.command(COMMAND.TPL)
		.description('build templates');
};

function dealConfig(conf){
	var configFileDir = vacation.cli.configFileDir;
	conf.src = pth.resolve(configFileDir, conf.src);
	conf.dist = pth.resolve(configFileDir, conf.dist);
	if(!conf.base){
		conf.base = conf.src;
	}
	else{
		conf.base = pth.resolve(configFileDir, conf.base);
	}
	if(!conf.distBase){
		conf.distBase = pth.resolve(conf.dist, pth.relative(conf.src, conf.base));
	}
	else{
		conf.distBase = pth.resolve(configFileDir, conf.distBase);
	}
	if(conf.www) conf.www = pth.resolve(configFileDir, conf.www);

	if(!conf.dist || !conf.src || !conf.base){
		vacation.log.error('"dist" and "src" and "base" field must be provided in the config file build object.' + vacation.cli.tips.initConfig);
	}

	conf.pkg && conf.pkg.forEach(function(pkg){
		pkg.type = (pkg.type || 'SeaJS').toLowerCase();
	});
}

function dealPkg(conf){
	if(conf.pkg){
		conf.pkg = conf.pkg.filter(function(pkg){ return !pkg.hidden });
		conf.pkg.forEach(function(pkg){
			pkg.sub = pkg.sub || [];
			pkg.except = pkg.except || [];
		});
		conf.pkgFile = conf.pkg.filter(function(pkg){ return !pkg.isDir });
		conf.pkgDir = conf.pkg.filter(function(pkg){ return pkg.isDir });
	}
}

function dealOptionLog(option){
	if(option){
		option = option.split('');
		return {
			concat: option.indexOf('c') >= 0,
			not_concat: option.indexOf('C') >= 0,
			ignore: option.indexOf('i') >= 0,
			transport: option.indexOf('t') >=0,
			not_transport: option.indexOf('T') >=0,
			remote_module: option.indexOf('r') >= 0
		}
	}
	return option || {};
}

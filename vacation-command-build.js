/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var buildKernel = require('./lib/lib-build/kernel2.js'); //require('./lib/lib-build/build-kernel.js');
var buildUtil = require('./lib/lib-build/util.js');
var Module = require('./lib/lib-build/Module');
var fns = require('./lib/functions');

exports.name = 'build';
exports.usage = '<command> [options]';
exports.desc = 'build your project';
exports.register = function (commander) {

	commander
		.option('-m, --map', buildUtil.format_commander('write the map.json file to the $cmd_cwd dir.'))
		.option('-c, --concat', buildUtil.format_commander('concat all modules that the $pkg module '
					+ 'dependencies. config the output file rule in the vacation.json'))
		.option('-o, --optimize', buildUtil.format_commander('optimize/uglify the modules that transported '
				+ 'or/and concated results.'))
		.option('-s, --autocheckout', buildUtil.format_commander('auto checkout TFS files if need.'))
		//.option('-S, --autocheckin', buildUtil.format_commander('auto checkin TFS files if need.'))
		.option('-C, --cssinline', buildUtil.format_commander('inline dependency css file content to the '
				+ 'concated file.'))
		.option('-t, --transport', buildUtil.format_commander('transport all matched files.'))
		.option('-T, --moduleType [seajs]', buildUtil.format_commander('what type is using for the --file or --multifiles option.\n'
				+ '[s]  - seajs\n'
				+ '[r]  - requirejs\n'
				+ '@default seajs'), 'seajs')
		// 实质是在 配置文件中快速添加了一个 pkg 配置，并且默认会先删除 配置文件中所有的 pkg
		.option('-f, --file <RegExp>', buildUtil.format_commander('one or more files that need to deal. will prompt to select.'))
		.option('-F, --multifiles <RegExp>', buildUtil.format_commander('multi files that need to deal.'))
		.option('-d, --distrule [rule]', buildUtil.format_commander('set the dist rule.\n'
				+ '@default $dir/$file.js'), "$dir/$file.js")
		.option('-p, --pkg <list>', buildUtil.format_commander('which pkg to use in the config file.\n'
				+ '@example -p 0,2\n'
				+ '@example --pkg all\n'
				+ '@example --pkg null\n'
				+ '[index] - which indexes to use.\n'
				+ '[pkgId]  - which pkg(s) with the id to use.\n'
				+ '[all]   - all pkgs in the config file.\n'
				+ '[null]  - none pkgs in the config file.\n'
				+ '@default to "all" if --file not used.\n'
				+ '@default to "null" if --file was used.'))
		.option('-H, --Handlebars [mode]', buildUtil.format_commander('precompile Handlebars template.\n'
				+ 'mode = 0, not precompile\n'
				//+ 'mode = 1, do nothing but console.log the patch\n'
				+ 'mode = 2, precompile\n'
				+ 'mode = 3, precompile and insert a Handlebars patch on top of the main package file\n'
				+ '@default to 0', 0))
		.option('-u, --underscore [mode]', buildUtil.format_commander('precompile underscore template.'
				+ ' The args is the same to --Handlebars.'))
		.option('-l, --log <mark>', buildUtil.format_commander('what info to log when building\n'
				+ '@example -l c,i,T\n'
				+ '@example --log t,T,r\n'
				+ '[d]  - set log level to L_DEBUG.\n'
				+ '[c]  - which module was concated when -c\n'
				+ '[C]  - which module was not concated when -c\n'
				+ '[i]  - which module was ignored\n'
				+ '[t]  - which module was transported\n'
				+ '[T]  - which module was not transported\n'
				+ '[r]  - remote module founded in the process\n'
				+ '[W]  - which file write failed.'))
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var cli = vacation.cli;
			var conf = cli.config.build;

			fns.dealConfig(conf);
			fns.dealPkg(conf);
			fns.dealEmitter(conf);
			fns.dealOptions(options, conf);

			buildUtil.setOptions(options);

			if(options.Handlebars && options.underscore) vacation.log.error('which template engine are you using?');
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

			if(!conf.pkg.length){
				vacation.log.error('no {Array[Object]}pkg was found in the config file, or the --pkg option was set to "null"');
			}
			// concat 比较特殊，需要调用 Bag 类
			if(options.concat){
				// 合并文件，但是不 transport 的话是没有意义的，不加ID什么的，合并之后的代码不可用
				if(!options.transport) {
					options.transport = true;
					vacation.log.notice('automatically add the --transport option cause the concated code will error if not transport.');
				}

				buildKernel.findPackageModules(function(bags, pkgs){
					if(!bags.length){
						vacation.log.error('no package main file was found under the config file directory('+configFileDir+').');
					}
					bags.forEach(function(bag){
						bag.writeFile();
					});
				});
			}
			else{
				buildKernel.iterateAllPkg();
			}
		});
};

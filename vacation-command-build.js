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
		.option('-m, --map', buildUtil.format_commander('write the map.json file to the $cmd_cwd dir.'))
		.option('-c, --concat', buildUtil.format_commander('concat all modules that the $pkg module '
					+ 'dependencies. config the output file rule in the vacation.json'))
		.option('-o, --optimize', buildUtil.format_commander('optimize/uglify the modules that transported '
				+ 'or/and concated results.'))
		.option('-C, --cssinline', buildUtil.format_commander('inline dependency css file content to the '
				+ 'concated file.'))
		.option('-t, --transport', buildUtil.format_commander('transport all matched files.'))
		// 实质是在 配置文件中快速添加了一个 pkg 配置，并且默认会先删除 配置文件中所有的 pkg
		.option('-f, --file <RegExp>', buildUtil.format_commander('one or more files that need to deal. will prompt to select.'))
		.option('-F, --multifiles <RegExp>', buildUtil.format_commander('multi files that need to deal.'))
		.option('-p, --pkg <list>', buildUtil.format_commander('which pkg to use in the config file.\n'
				+ '@example -p 0,2\n'
				+ '@example --pkg all\n'
				+ '@example --pkg null\n'
				+ '[index] - which indexes to use.\n'
				+ '[all]   - all pkgs in the config file.\n'
				+ '[null]  - none pkgs in the config file.\n'
				+ '@default to "all" if --file not used.\n'
				+ '@default to "null" if --file was used.\n'))
		.option('-H, --Handlebars [mode]', buildUtil.format_commander('precompile Handlebars template.\n'
				+ 'mode = 0, not precompile\n'
				+ 'mode = 1, do nothing but console.log the patch\n'
				+ 'mode = 2, precompile\n'
				+ 'mode = 3, precompile and insert a Handlebars patch on top of the main package file\n'
				+ '@default to 0', 0))
		.option('-u, --underscore [mode]', buildUtil.format_commander('precompile underscore template.'
				+ ' The args is the same to --Handlebars.'))
		.option('-l, --log <mark>', buildUtil.format_commander('what info to log when building\n'
				+ '@example -l c,i,T\n'
				+ '@example --log t,T,r\n'
				+ '[c]  - which module was concated when -c\n'
				+ '[C]  - which module was not concated when -c\n'
				+ '[i]  - which module was ignored\n'
				+ '[t]  - which module was transported\n'
				+ '[T]  - which module was not transported\n'
				+ '[r]  - remote module founded in the process\n'
				+ '[W]  - which file write failed.'))
		.option('-w, --watch', buildUtil.format_commander('[tpl only] watch and build templates'))
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var cli = vacation.cli,
				conf = cli.config.build;

			dealOptions(options, conf);
			var log = options.log;// = dealOptionLog(options.log);

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
			dealEmitter(conf);

			if(buildUtil.values(COMMAND).indexOf(cmd) < 0) {
				commander.help();
			}
			else{
				//// replace the alias with the paths value
				buildKernel.getPathedAlias(conf);
				buildUtil.deal_available_ignore(conf);
				if(cmd == COMMAND.START){
					if(!conf.pkg.length){
						vacation.log.error('no {Array[Object]}pkg was found in the config file, or the --pkg option was set to "null"');
					}
					// 主要的功能主要还是 合并、transport、压缩优化 三个
					/*if(!options.concat && !options.transport && !options.optimize){
						var readline =require('readline');
						var rl = readline.createInterface({
							input: process.stdin,
							output: process.stdout
						});
					}*/
					// concat 比较特殊，需要调用 Bag 类
					if(options.concat){
						// 合并文件，但是不 transport 的话是没有意义的，不加ID什么的，合并之后的代码不可用
						if(!options.transport) {
							options.transport = true;
							vacation.log.notice('automatically add the --transport option cause the concated code will error if not transport.');
						}

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
						buildKernel.iterateAllPkg();
					}
				}
				else if(cmd == COMMAND.TPL){
					buildKernel.TPLBuild({
						isOptimize: options.optimize,
						isWatch: options.watch,
						log: log
					});
				}
			}
		});

	commander
		.command(COMMAND.START)
		.description('start build');
	commander
		.command(COMMAND.TPL)
		.description('build templates');
};


function dealOptions(options, conf){
	options.log = dealOptionLog(options.log);

	var pkg, filePkg = [];
	// 在指定 --file 的时候，---pkg 的默认值为空，即默认不使用 配置文件的 pkg 选项
	if(options.file || options.multifiles){
		pkg = options.pkg || "null";
		var p = {
			main:RegExp(options.file || options.multifiles),
			dist_rule: "$dir/$file"
		};
		console.log('\n [DEBUG] --' + (options.file ? 'file' : 'multifiles') + ' RegExp is: ' + p.main);
		filePkg.push(p);
	}
	// 否则，默认使用 配置文件的 pkg
	else{
		pkg = options.pkg || "all";
	}

	if(pkg == 'all'){
	}
	else if(pkg == 'null'){
		conf.pkg = [];
	}
	else{
		pkg = pkg.split(',');
		var r = [];
		pkg.forEach(function(index, i){
			r.push(conf.pkg[index]);
		});
		conf.pkg = r;
	}
	conf.pkg = filePkg.concat(conf.pkg);
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
			remote_module: option.indexOf('r') >= 0,
			write_failed: option.indexOf('W') >= 0
		}
	}
	return option || {};
}

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

function dealEmitter(conf){
	if(conf.onInit){
		conf.onInit(vacation.cli.emitter);
	}
}


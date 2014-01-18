/*
 * vacation
 * http://vacation.peichao01.com/
 */

'use strict';

var fs = require('fs');
var uglifyJS = require('uglify-js');
var pth = require('path');
var handlebars = require('handlebars');
var walk = require('walk');

var buildUtil = require('./util');
//var htmlMinify = buildUtil.htmlMinify; //require('html-minifier').minify;
//var resourceManager = require('./resource_manager');

var Bag = require('./Bag');
var BagDir = require('./BagDir');
var Module = require('./Module');

// 把 alias 的路径 基于 paths 来转换
exports.getPathedAlias = function(conf){
	var real_alias = {};
	// 一般情况下 paths 是在需要不同域名时才用
	// 但也可以把 paths 作为 alias 之前的 alias
	if(conf.paths && Object.keys(conf.paths).length > 0){
		for(var pkey in conf.paths){
			real_alias[pkey] = conf.paths[pkey];
		}
		// alias 的路径部分可能会在paths中有过定义
		if(conf.alias && Object.keys(conf.alias).length > 0){
			for(var key in conf.alias){
				// 不能定义相同的 key
				if(real_alias[key]) vacation.log.error('[420][config file]: the key in alias('+key+') has defined in paths.');
				var pathedAlias = buildUtil.get_real_path_by_alias(conf.alias[key], conf.paths);
				// paths 是对路径的别名
				// alias 都是对具体文件的别名
				if(!pathedAlias.match(/\w+\.\w+$/)) pathedAlias += '.js';
				real_alias[key] = pathedAlias;
			}
		}
	}
	else if(conf.alias && Object.keys(conf.alias).length > 0){
		for(var key in conf.alias){
			var alias = conf.alias[key];
			// paths 是对路径的别名
			// alias 都是对具体文件的别名
			if(!alias.match(/\w+\.\w+$/)) alias += '.js';
			real_alias[key] = alias;
		}
	}

	var real_alias_rootPathed = {};
	var configFileDir = vacation.cli.configFileDir;
	buildUtil.each(real_alias, function(val, name){
		// alias 和 paths 在 seajs.config 中都是相对于 base 路径的
		real_alias_rootPathed[name] = buildUtil.isRemoteUri(val) ? val : pth.resolve(configFileDir, val);
	});
	//return real_alias;
	conf.real_alias = real_alias;
	conf.real_alias_rootPathed = real_alias_rootPathed;
};

function walkDir(dir, onFile, onDir, onEnd){
	var walker = walk.walk(dir, {
		followLinks: false
	});
	onFile && walker.on('file', function(root, fileStats, next){
		handler(root, fileStats, onFile);
		next();
	});
	onDir && walker.on('directories', function(root, dirStatsArray, next){
		dirStatsArray.forEach(function(dirStats){
			handler(root, dirStats, onDir, true);
		});
		next();
	});
	onEnd && walker.on('end', onEnd);

	function handler(root, stats, callback, isDir){
		var uri = pth.resolve(root, stats.name);
		// 有的路径实在太长了，控制台都显示不完
		var debugURI = uri.substr(51);
		if(buildUtil.isURIAvailable(uri)){
			callback(root, stats, uri, isDir);
		}
	}
}

exports.iterateAllPkg = function(){
	var SeaJS = require('./ModuleSea');
	var RequireJS = require('./ModuleRequire');
	var cwd = vacation.cli.configFileDir,
		options = buildUtil.getOptions(),
		conf = buildUtil.getBuildConfig(),
		pkgFiles = [];

	if(conf.pkgFile.length){
		walkDir(cwd, function onFile(root, stats, uri, isDir){
			// pkgDir 的【唯一】目的就是把文件夹内的文件统一合并为一个文件？
			// 所以，在这个不需要 concat 的方法内，就只处理 pkgFile 就可以了？
			conf.pkgFile.forEach(function(pkg, i){
				if(buildUtil.normalize_win_dir(uri).match(pkg.main)){
					(pkgFiles[i] = pkgFiles[i] || []).push({
						uri: uri,
						moduleType: pkg.type
					});
				}
			});
		}, 0, function onEnd(){
			//
			if(!pkgFiles.length){
				vacation.log.error('no file was matched.');
			}
			if(options.file && conf.pkgFile.length === 1 && pkgFiles[0].length > 1){
				var files = pkgFiles[0];
				var someHidden = files.length > 10, items = [], i, ii;
				var work10 = someHidden ? '\n \nthere are still '+(files.length-10)+' files, y(yes) to show the left files or to select files.' : '';
				for(i=0,ii=10;i<ii;i++){
					if(files[i])
						items.push('[' + i + ']. ' + files[i].uri);
				}
				var txt_len = 80, w_len = 2;
				buildUtil.readline().question2(buildUtil.format_commander(files.length + ' files was found, which file(s) '
					+ 'do you want to deal ?\n'
					+ '@example all\n'
					+ '@example 2,4\n \n'
					+ items.join('\n')
					+ work10, txt_len, w_len),
					function(answer){
						var r;
						if(answer == 'all'){
							r=true;
							nowSure();
						}
						else if((answer == 'y' || answer == 'yes') && someHidden){
							var items2 = [];
							for(i=10,ii=files.length; i<ii; i++){
								items2.push('['+i+']. ' + files[i].uri);
							}
							someHidden = false;
							console.log(buildUtil.format_commander(' \n' + items2.join('\n'), txt_len, w_len));
						}
						else {
							var s = answer.split(',').filter(function(el){return el.match(/^\d+$/)});
							//console.log(s);
							if(s.length){
								r = true;
								this.close();
								var  list = [];
								s.forEach(function(index){
									if(files[index]) list.push(files[index]);
								});
								pkgFiles[0] = list;
								nowSure();
							}
							else{
								console.log('please try again. like: "1" or "1,2"');
							}
						}
						return r;
				}).start();
			}
			else{
				nowSure();
			}
			function nowSure(){
				var writeFailed = [];
				pkgFiles.forEach(function(pkgFiles, i){
					pkgFiles.forEach(function(file, j){
						var ModuleClass = file.moduleType == 'seajs' ? SeaJS : RequireJS;
						var module = ModuleClass.get({
							uri: file.uri
						});
						var content = module._getContent(options.transport);
						var result = buildUtil.writeFile(module.distUri, content);
						if(result === false && writeFailed.indexOf(module.distUri) == -1) writeFailed.push(module.distUri);
					});
				});
				buildUtil.logWriteFailed(writeFailed);
			}

		});
	}
};

exports.findPackageModules = function(callback){
	var cwd = vacation.cli.configFileDir,
		conf = buildUtil.getBuildConfig(),
		bags = [];

	walkDir(cwd, (conf.pkgFile.length && onName), (conf.pkgDir.length && onName), function(){
		callback(bags);
	});

	function onName(root, stats, uri, isDir){
		var pkg = isDir ? conf.pkgDir : conf.pkgFile;
		var _Bag = isDir ? BagDir : Bag;
		pkg.forEach(function(p){
			if(buildUtil.normalize_win_dir(uri).match(p.main)){
				(p.files = p.files || []).push(uri);
				var bag = _Bag.get({
					uri: uri,
					config: p,
					moduleType: p.type
				});
				bags.push(bag);
			}
		});
	}
};

exports.TPLBuild = function(){
	var options = buildUtil.getOptions();
	var writeFailed;
	// <del>无论怎样先translate一遍，完了之后，如果有 watch，再watch</del>
	// 有 watch，则只watch
	// 没有watch，则全部 translate 一遍
	if(options.watch){
		writeFailed = [];
		var watch = require('node-watch');

		watch(vacation.cli.cmd_cwd, function(filename){
			if(buildUtil.isURIAvailable(filename) && isAvailable(filename)){
				var result = write(Module.get({uri:filename}).updateContent().transport());
				if(result === false){
					writeFailed.push(filename);
				}
			}
		});
	}
	else{
		writeFailed = [];
		walkDir(vacation.cli.cmd_cwd, function onFile(root, fileStats, uri){
			if(isAvailable(fileStats.name)){
				var result = write(Module.get({uri: uri}).transport());
				if(result === false) writeFailed.push(uri);
			}
		}, 0, function onEnd(){
			buildUtil.logWriteFailed(writeFailed);
		});
	}

	function isAvailable(uri){
		var m = uri.match(buildUtil.IS_TPL);
		// 不处理 .xx.js 的转换过的模版
		return m && !m[2];
	}

	function write(mod){
		var result = buildUtil.writeFile(mod.uri + '.js', mod.transportedContent);
		result && options.log.transport && console.log('[TRANSPORT] ' + mod.id);
		return result;
	}
};
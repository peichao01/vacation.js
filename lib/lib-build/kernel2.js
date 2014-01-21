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
		//if(buildUtil.isURIAvailable(uri)){
			callback(root, stats, uri, isDir);
		//}
	}
}

exports.iterateAllPkg = function(){
	var SeaJS = require('./ModuleSea');
	var RequireJS = require('./ModuleRequire');
	var cwd = vacation.cli.configFileDir,
		options = buildUtil.getOptions(),
		buildConf = buildUtil.getBuildConfig(),
		pkgFiles = [];

	if(buildConf.pkgFile.length){
		walkDir(cwd, function onFile(root, stats, uri, isDir){
			// pkgDir 的【唯一】目的就是把文件夹内的文件统一合并为一个文件？
			// 所以，在这个不需要 concat 的方法内，就只处理 pkgFile 就可以了？
			//buildConf.pkgFile.forEach(function(pkg, i){
			buildConf.pkg.forEach(function(pkg, i){
				if(pkg.isDir) return;
				var pkgIndex = i;
				if(buildUtil.isURIAvailable(uri, {pkgIndex: pkgIndex}) && buildUtil.normalize_win_dir(uri).match(pkg.main)){
					(pkgFiles[i] = pkgFiles[i] || []).push({
						uri: uri,
						moduleType: pkg.type,
						pkgIndex: pkgIndex
					});
				}
			});
		}, 0, function onEnd(){
			//
			if(!pkgFiles.length){
				vacation.log.error('no file was matched.');
			}
			// 当 使用了 --file，且没有使用配置文件中的pkg（只有一个 pkg），且匹配的结果 >1
			// 则，做一些交互
			// --------------- 交互 begin
			if(options.file && buildConf.pkg.length === 1 && pkgFiles[0].length > 1){
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
								var list = [];
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
			// ------------------ 交互 end

			// 这里才是正事，上面的是一些【交互】
			function nowSure(){
				var files = [];
				pkgFiles.forEach(function(pkgFiles, i){
					pkgFiles.forEach(function(file, j){
						var ModuleClass = file.moduleType == 'seajs' ? SeaJS : RequireJS;
						var module = ModuleClass.get({
							uri: file.uri,
							pkgIndex: file.pkgIndex
						});
						var pkgConf = buildUtil.getBuildConfig(file.pkgIndex);
						var banner = buildUtil.dealBanner(pkgConf.uglify.banner);
						var transport = options.transport, distUri = module.distUri;
						// 模板比较特殊，无论是 .tpl 还是 .tpl.js 文件，都是以 .tpl 的内容作为 originContent 的
						if(module.isTpl){
							if(file.uri.match(/\.js$/)){
								transport = true;
								distUri += '.js';
							}
							else if(banner){
								// 如果 banner 有【换行符】的话
								var m = banner.match(/(.*)(\n)$/), prefix = '<!--', postfix = '-->';
								if(m){
									postfix += m[2];
									banner = m[1];
								}
								banner = prefix + banner + postfix;
							}
						}
						var content = module._getContent(transport);
						files.push({
							path: distUri,
							content: banner + content
						});
					});
				});
				buildUtil.writeFiles(files, function(failedArray){
					buildUtil.logWriteFailed(failedArray);
				});
			}
		});
	}
};

exports.findPackageModules = function(callback){
	var cwd = vacation.cli.configFileDir,
		buildConf = buildUtil.getBuildConfig(),
		bags = [], pkgs = [];

	walkDir(cwd, (buildConf.pkgFile.length && onName), (buildConf.pkgDir.length && onName), function(){
		callback(bags, pkgs);
	});

	function onName(root, stats, uri, isDir){
		var pkg = buildConf.pkg;//isDir ? buildConf.pkgDir : buildConf.pkgFile;
		var _Bag = isDir ? BagDir : Bag;
		pkg.forEach(function(p, i){
			if(isDir != p.isDir) return;
			var pkgIndex = i;
			if(buildUtil.isURIAvailable(uri, {pkgIndex: pkgIndex}) && buildUtil.normalize_win_dir(uri).match(p.main)){
				var bag = _Bag.get({
					uri: uri,
					config: p,
					moduleType: p.type,
					pkgIndex: pkgIndex
				});
				bags.push(bag);
				(p.files = p.files || []).push(uri);
				(pkgs[i] = pkgs[i] || []).push(bag);
			}
		});
	}
};

exports.TPLBuild = function(){
	var options = buildUtil.getOptions();
	// <del>无论怎样先translate一遍，完了之后，如果有 watch，再watch</del>
	// 有 watch，则只watch
	// 没有watch，则全部 translate 一遍
	if(options.watch){
		var watch = require('node-watch');

		watch(vacation.cli.cmd_cwd, function(filename){
			// 编译模版的任务不属于任何一个 pkg，isURIAvailable 检测，能检测就检测，没有配置 ignore 的话也关系不大
			if(buildUtil.isURIAvailable(filename) && isAvailable(filename)){
				write(Module.get({uri:filename}).updateContent().transport(), function(success, uri){
					!success && buildUtil.logWriteFailed([uri]);
				});
			}
		});
	}
	else{
		var writeFailed = [], writeCount = 0, availableFilesCount = 0;
		walkDir(vacation.cli.cmd_cwd, function onFile(root, fileStats, uri){
			if(buildUtil.isURIAvailable(uri) && isAvailable(fileStats.name)){
				availableFilesCount++;
				write(Module.get({uri: uri}).transport(), function(success, uri){
					writeCount++;
					if(!success) writeFailed.push(uri);
					if(writeCount == availableFilesCount){
						buildUtil.logWriteFailed(writeFailed);
					}
				});
			}
		}, 0, function onEnd(){
		});
	}

	function isAvailable(uri){
		var m = uri.match(buildUtil.IS_TPL);
		// 不处理 .xx.js 的转换过的模版
		return m && !m[2];
	}

	function write(mod, callback){
		buildUtil.writeFile(mod.uri + '.js', mod.transportedContent, function(success, uri){
			if(success){
				options.log.transport && console.log('[TRANSPORT] ' + uri);
			}
		});
	}
};
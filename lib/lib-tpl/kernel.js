var buildUtil = require('../lib-build/util');
var Module = require('../lib-build/Module');
var walkDir = require('../walkDir');

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
		var isPureTpl = m && !m[2];
		var isMatchFile = !options.file || uri.match(options.file);
		return isPureTpl && isMatchFile;
	}

	function write(mod, callback){
		buildUtil.writeFile(mod.uri + '.js', mod.transportedContent, function(success, uri){
			if(success){
				options.log.transport && console.log(' [TRANSPORT] ' + uri);
			}
		});
	}
};
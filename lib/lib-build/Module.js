var pth = require('path');
var fs = require('fs');
var buildUtil = require('./util');

var _mid = 0;

var canNew = false;

var moduleCaches = {},
	uriCaches = {};

function getMid(){
	return 'm' + _mid++;
}

function parseContent(content){

}



function Module(uri){
	if(!canNew) vacation.log.error('you should use Module.get to initialize a Module.');

	// uri 被缓存，但模块没有被缓存，一定是循环引用了
	if(uriCaches[uri]) vacation.log.error('circle dependencies.');
	uriCaches[uri] = true;
	this.uri = uri;

	if(uri.indexOf('http://') == 0){
		this.isRemote = true;
		return;
	}

	this.uri2 = buildUtil.normalize_win_dir(uri);
	this.mid = getMid();
	this.baseInfo().dealDependency().deepDependencies();
}

Module.prototype.baseInfo = function(){
	var uri = this.uri;
	var conf = buildUtil.getBuildConfig();
	// 顶级标识都必须相对于 base 路径来解析
	var relative = pth.relative(conf.base, uri);
	var moduleId, idType;

	var matched = [];
	// real_alias_rootPathed 已经将 alias、paths 基于 configFileDir 转为根路径
	buildUtil.each(conf.real_alias_rootPathed, function(aliasRootPath, key){
		if(pth.relative(aliasRootPath, uri).indexOf('.') !== 0)
			matched.push([key, aliasRootPath]);
	});
	// 此模块有设置 alias 或 pahts
	if(matched.length > 0){
		// 按 aliasRootPath 的长度排序，越长越靠前。
		matched.sort(function(a,b){
			return a[1].length - b[1].length < 0;
		});
		// resolve 返回的结果(matched[0][1])，是已经去除掉最后一个'/'字符的
		moduleId = uri.replace(matched[0][1], matched[0][0]);
		idType = 'real_alias';
	}
	// 此模块ID 可以使用顶级标识
	if(relative.indexOf('.') !== 0){
		// 如果已经有 alias、paths ID，可以使用多个ID，则使用短的
		if(!moduleId || moduleId.length >= relative.length){
			moduleId = relative;
			idType = 'top';
		}
	}
	// 如果只能使用相对路径做标识ID，则报错
	if(!moduleId){
		console.log('\n [HELP INFO] paths and alias is parsed to: ' + JSON.stringify(conf.real_alias_rootPathed, null, 4));
		vacation.log.error('[423] module(uri:'+uri+') not in the base directory('+conf.base+'), and no paths or alias relative to its path.');
	}

	this.id = buildUtil.normalize_win_dir(moduleId);
	this.idType = idType;
	this.type = uri.substr(uri.lastIndexOf('.') + 1);
	this.inBase = relative.indexOf('.') !== 0;
	this.inSrc = pth.relative(conf.src, uri).indexOf('.')!==0;
	return this;
};

Module.prototype.dealDependency = function(){
	var conf = buildUtil.getBuildConfig();
	var moduleContent = this.originContent = buildUtil.readFile(this.uri);

	// 删除注释和多余的空白等
	var uglifiedContent = buildUtil.getUglifiedContent(moduleContent, {
		fromString: true,
		mangle: false,
		compress: false
	}, this.uri);
	if(this.type == 'js'){
		// 最标准的 CMD 模块
		if(uglifiedContent.match(/^define\(/g)){
			this.cmd = 0;
		}
		// 非 CMD 模块
		else if(!uglifiedContent.match(/\bdefine\(/g)){
			this.cmd = -1;
		}
		// 有 define(， 但是不在顶部，可能是兼容amd 或 cmd 或其他情况
		else{
			this.cmd = 1;
		}
	}

	// => ["require("a")", "require("b")"]
	var requireMatched = uglifiedContent.match(/\brequire\((['"]).+?\1\)/g);
	var deps = [];
	if(requireMatched){
		requireMatched.forEach(function (match) {
			var useAlias;
			// => ['"b")', '"', 'b']
			var depModuleFile = match.match(/(['"])(.*)\1\)/)[2];
			var aliasedPath = buildUtil.get_real_path_by_alias(depModuleFile, conf.real_alias);
			if(depModuleFile != aliasedPath){
				useAlias = true;
			}
			depModuleFile = buildUtil.addExtraNameToFile(aliasedPath);

			// 依赖文件的
			var depModuleRelativeTo;
			// 相对路径
			if(depModuleFile.indexOf('.') == 0){
				// 相对于 conf.base 目录
				if(useAlias){
					// seajs.config 中 alias 和 paths 是相对于 base 路径的
					// 所以 vacation.js 也调整为相对于 base 路径
					depModuleRelativeTo = conf.base;
				}
				// 相对路径：相对于当前模块
				else{
					depModuleRelativeTo = pth.dirname(this.uri);
				}
			}
			// 根路径：相对于 conf.www 目录
			else if(depModuleFile.indexOf('/') == 0){
				depModuleRelativeTo = conf.www;
				if(!conf.www) vacation.log.error('[424] module('+moduleInfo.uri+') require('+depModuleFile+') but the www directory is not config.');
			}
			// 顶级标识：相对于 base 基础路几个呢
			else {
				depModuleRelativeTo = conf.base;
			}

			if(depModuleFile.indexOf('http://') == 0){
				var depModule = Module.get(depModuleFile);
				deps.push(depModule);
			}
			else{
				var depModuleURI = pth.resolve(depModuleRelativeTo, depModuleFile);

				// 检查依赖文件是否存在
				var depIsExists = fs.existsSync(depModuleURI);
				if(!depIsExists) {
					vacation.log.error('[425-1] module('+this.id+') deps on ('+depModuleURI+'), but this file is not exists.');
				}
				var depModule = Module.get(depModuleURI);
				deps.push(depModule);
			}
		});
	}
	this.deps = deps;
	return this;
};

Module.prototype.deepDependencies = function(){
	var allDeps = [];
	this.deps.forEach(function(depModule){
		if(allDeps.indexOf(depModule) < 0) allDeps.push(depModule);
	});
	this.alldeps = allDeps;
	return this;
};

Module.get = function(uri){
	canNew = true;
	var module = moduleCaches[uri] || (moduleCaches[uri] = new Module(uri));
	canNew = false;
	return module;
};

module.exports = Module;
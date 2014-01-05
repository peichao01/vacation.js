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
var htmlMinify = buildUtil.htmlMinify; //require('html-minifier').minify;
var resourceManager = require('./resource_manager');

var Bag = require('./Bag');
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
		real_alias_rootPathed[name] = pth.resolve(configFileDir, val);
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
		var uri = pth.resolve(root, fileStats.name);
		if(buildUtil.isURIAvailable(uri)){
			onFile(root, fileStats, uri);
		}
		next();
	});
	onDir && walker.on('dir', function(root, fileStats, next){
		onDir(root, fileStats);
		next();
	});
	onEnd && walker.on('end', onEnd);
}

exports.findPackageModules = function(callback){
	var cwd = vacation.cli.configFileDir,
		conf = buildUtil.getBuildConfig(),
		pkg = conf.pkg,
		bags = [];

	walkDir(cwd, function(root, fileStats, uri){
		pkg.forEach(function(p){
			if(buildUtil.normalize_win_dir(uri).match(p.main)) {
				(p.files = p.files || []).push(uri);
				var bag = Bag.get({
					uri: uri,
					config: p,
					type: p.type
				});
				bags.push(bag);
			}
		});
	}, 0, function(){
		callback(bags);
	});
};

exports.TPLBuild = function(){
	var options = buildUtil.getOptions();
	walkDir(vacation.cli.cmd_cwd, function(root, fileStats, uri){
		if(isAvailable(fileStats.name)){
			write(Module.get({uri: uri}).transport());
		}
	}, 0, function(){
		if(options.watch){
			var watch = require('node-watch');

			watch(vacation.cli.cmd_cwd, function(filename){
				if(buildUtil.isURIAvailable(filename) && isAvailable(filename))
					write(Module.get({uri:filename}).updateContent().transport());
			});
		}
	});

	function isAvailable(uri){
		var m = uri.match(buildUtil.IS_TPL);
		// 不处理 .xx.js 的转换过的模版
		return m && !m[2];
	}

	function write(mod){
		buildUtil.writeFile(mod.uri + '.js', mod.transportedContent);
		options.log.transport && console.log('[TRANSPORT] ' + mod.id);
	}
};
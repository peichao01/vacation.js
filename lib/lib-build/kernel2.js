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

// 把 alias 的路径 基于 paths 来转换
exports.getPathedAlias = function(conf){
	var real_alias = {};
	//var configFileDir = vacation.cli.configFileDir;
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
	buildUtil.each(real_alias, function(val, name){
		// alias 和 paths 在 seajs.config 中都是相对于 base 路径的
		//real_alias_rootPathed[name] = pth.resolve(configFileDir, val);
		real_alias_rootPathed[name] = pth.resolve(conf.base, val);
	});
	//return real_alias;
	conf.real_alias = real_alias;
	conf.real_alias_rootPathed = real_alias_rootPathed;
};

exports.findPackageModules = function(callback){
	var cwd = vacation.cli.cmd_cwd,
		conf = buildUtil.getBuildConfig(),
		pkg = conf.pkg,
		bags = [];

	var walker = walk.walk(cwd, {
		followLinks:false,
		filters:[]
	});
	walker.on('file', function(root, fileStats, next){
		var uri = pth.resolve(root, fileStats.name);
		pkg.forEach(function(p){
			if(buildUtil.normalize_win_dir(uri).match(p.main)) {
				(p.files = p.files || []).push(uri);
				var bag = Bag.get({
					uri: uri,
					config: p
				});
				bags.push(bag);
			}
		});
		next();
	});
	walker.on('end', function(){
		callback(bags);
	});
};
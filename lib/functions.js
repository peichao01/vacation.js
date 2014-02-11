var pth = require('path');
var buildUtil = require('../lib/lib-build/util.js');

exports.dealConfig = function (conf){
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

	//// replace the alias with the paths value
	buildUtil.getPathedAlias(conf);
	buildUtil.deal_available_ignore(conf);
}

exports.dealPkg = function(conf){
	if(conf.pkg){
		conf.pkg = conf.pkg.filter(function(pkg){ return !pkg.hidden });
		conf.pkg.forEach(function(pkg){
			pkg.type = (pkg.type || 'SeaJS').toLowerCase();
			pkg.sub = pkg.sub || [];
			pkg.except = pkg.except || [];
			pkg.includePosition = pkg.includePosition || 'top';
		});
	}

	// conf 的所有配置都只是 pkg 的每一个包的默认配置，而pkg中的设置是个性化的覆盖默认配置的配置
	// 处理每一项 【pkg】 的时候，都优先使用当前包的配置，没有的话，再使用 conf 的默认配置
	var _pkg = conf.pkg || [], notCopy = ['onInit'];

	delete conf.pkg;
	_pkg.forEach(function(pkg){
		buildUtil.each(conf, function(value, name){
			if(notCopy.indexOf(name) >= 0) return;
			// 将默认配置复制到 pkg 每一项中
			if(pkg[name] === undefined) pkg[name] = value;
		});
	});
	conf.pkg = _pkg;
	conf.pkgFile = _pkg.filter(function(pkg){ return !pkg.isDir });
	conf.pkgDir = _pkg.filter(function(pkg){ return pkg.isDir });
//	buildUtil.setConfig('build', {
//		pkg: _pkg,
//		pkgFile: _pkg.filter(function(pkg){ return !pkg.isDir }),
//		pkgDir: _pkg.filter(function(pkg){ return pkg.isDir })
//	});
}

exports.dealEmitter = function (conf){
	conf.onInit && conf.onInit(vacation.cli.emitter);
	conf.pkg.forEach(function(pkg){
		pkg.onInit && pkg.onInit(vacation.cli.emitter);
	});
}

exports.dealOptions = function (options, conf){
	options.log = exports.dealOptionLog(options.log);
	options.moduleType = (options.moduleType == 'r' || options.moduleType == 'requirejs') ? 'requirejs' : 'seajs';

	var pkg, filePkg = [];
	// 在指定 --file 的时候，---pkg 的默认值为空，即默认不使用 配置文件的 pkg 选项
	if(options.file || options.multifiles){
		pkg = options.pkg || "null";
		var p = {
			main:RegExp(options.file || options.multifiles),
			dist_rule: options.distrule,//"$dir/$file.js",
			type: options.moduleType
		};
		vacation.log.debug('--' + (options.file ? 'file' : 'multifiles') + ' RegExp is: ' + p.main);
		filePkg.push(p);
	}
	// 否则，默认使用 配置文件的 pkg
	else{
		pkg = options.pkg || "all";
	}
	// 转为正则
	if(options.file){
		options.file = RegExp(options.file);
	}

	if(pkg == 'all'){
	}
	else if(pkg == 'null'){
		conf.pkg = [];
	}
	else{
		pkg = pkg.split(',');
		var r = [];
		pkg.forEach(function(index_or_id, i){
			// 优先使用 index
			if(index_or_id.match(/^\d+$/) && index_or_id < conf.pkg.length){
				r.push(conf.pkg[index_or_id]);
			}
			else{
				r = r.concat(conf.pkg.filter(function(pkg){ return pkg.id == index_or_id }));
			}
		});
		conf.pkg = r;
	}
	conf.pkg = filePkg.concat(conf.pkg);
}

exports.dealOptionLog = function (option){
	if(option){
		option = option.split('');
		// 设置输出级别为 DEBUG
		if(option.indexOf('d') >= 0){
			var log = require('./lib/lib-kernel/log');
			log.level = log.L_DEBUG;
		}
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
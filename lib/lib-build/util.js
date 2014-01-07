var pth = require('path');
var fs = require('fs');
var uglifyJS = require('uglify-js');
var handlebars = require('handlebars');
var underscore = require('underscore');

var toString = Object.prototype.toString;
var _isType = function(type){
	return function(source){
		return toString.call(source) === '[object '+type+']';
	}
};
exports.isArray = _isType('Array');
exports.isObject = _isType('Object');
exports.isString = _isType('String');

exports.TPL_TYPE = ['html','tpl','hbs','handlebars','underscore'];
exports.IS_TPL = new RegExp("\\.("+exports.TPL_TYPE.join('|')+")(\\.js)?$");

var REG_REMOTE_URI = /^(https?:)?\/\//;
exports.isRemoteUri = function(uri){
	return uri.match(REG_REMOTE_URI);
};

var _commander_options;
exports.setOptions = function(opt){
	_commander_options = opt;
};

exports.getOptions = function(){
	return _commander_options;
};

// id 是当前文件目录到 base 的相对路径，并不是说module一定要在 base 目录内部
exports.getModuleId = function(moduleFullPath, baseDir) {
	// 把文件夹后面的 / 斜线也去掉
	//return moduleFullPath.substr(baseDir.length + 1);
	var moduleDir = pth.dirname(moduleFullPath);
	return pth.relative(moduleDir, baseDir);
}

exports.each = function(o,fn){
	if(exports.isArray(o)){
		for(var i= 0,l= o.length; i<l; i++){
			if(fn.call(o, o[i], i, o) === false) break;
		}
	}
	else if(exports.isObject(o)){
		for(var key in o){
			if(o.hasOwnProperty(key)){
				if(fn.call(o, o[key], key, o) === false) break;
			}
		}
	}
	return o;
};

exports.difference = function (array, other){
	var r = [];
	array.forEach(function(item){
		if(other.indexOf(item) < 0) r.push(item);
	});
	return r;
};

exports.unique = function(array){
	var arr = [];
	array.forEach(function(item){
		if(arr.indexOf(item) < 0) arr.push(item);
	});
	return arr;
};

exports.is = function(moduleId, type){
	return moduleId.lastIndexOf('.'+type) === (moduleId.length - type.length - 1);
}

exports.int = function (o) {
	return parseInt(o, 10);
}

exports.delExtname = function(uri){
	return uri.substr(0, uri.lastIndexOf('.'));
};

var REG_ID_JS = /(.+)\.js$/;
exports.normalize_dist_id = function(id){
	if(!id) return id;
	var f = id.match(REG_ID_JS);
	if(f) id = f[1];
	return exports.normalize_win_dir(id);
};

exports.readDirChild = function(path, onFile, onDir){
	var stats = fs.statSync(path);
	if(stats.isDirectory()){
		var files = fs.readdirSync(path);
		files.forEach(function(filename){
			var uri = pth.resolve(path, filename)
			stats = fs.statSync(uri);
			if(stats.isFile()){
				onFile && onFile(filename, stats, uri);
			}
			else if(stats.isDirectory()){
				onDir && onDir(filename, stats, uri);
			}
		});
	}
};

exports.readFile = function(path) {
	try{
		var content = fs.readFileSync(path,{encoding:'utf8'});
		//if(!content) vacation.log.error('read file('+path+') failed.');
		return content;
	}
	catch(e){
		vacation.log.error('failed to read ['+path+']'
							+ '\n\t message: ' + e.message);
	}
};

exports.readJSON = function(path){
	var json = exports.readFile(path),
        result = {};
    try {
        result = JSON.parse(json);
    } catch(e){
        vacation.log.error('parse json file[' + path + '] fail, error [' + e.message + ']');
    }
    return result;
};

exports.writeFile = function(filePath, content) {
	try{
		vacation.util.mkdir_p(pth.dirname(filePath));
		var err = fs.writeFileSync(filePath, content, {encoding:'utf8'});
	}
	catch(e){
		vacation.log.error('write file['+filePath+'] error.\n\t message: ' + e.message);
	}
};

exports.values = function (object) {
	var r = [];
	for(var key in object){
		if(object.hasOwnProperty(key))
			r.push(object[key]);
	}
	return r;
};

/*
* @param {Boolean} removeComments
* @param {Boolean} collapseWhitespace
* @param {Boolean} removeHandlebarsComments
*/
exports.htmlMinify = function(content, opts){
	opts = opts || {};
	if(opts.removeComments){
		content = content.replace(/<!--(.|\r|\n)*?-->/g,"");
	}
	if(opts.removeHandlebarsComments){
		// 一定要：
		// 1. 加 "?"，最少匹配
		// 2. 先删除多行注释，再删除单行注释，否则会出错，
		//		如：{{!-- #is}}{{#op a}}{{/op}}{{/is --}}
		content = content.replace(/{{!--(.|\r|\n)*?--}}/g,"").replace(/{{!.*?}}/g,"");
	}
	if(opts.collapseWhitespace){
		content = content.replace(/(\r|\n)+/g," ").replace(/(\s|\t)+/g," ");
	}
	return content;
};

exports.cssMinify = function(content){
	content = content.replace(/(\s|\t)+/g," ")
					.replace(/\r|\n/g,' ');
	return content;
};

exports.content2StandardString = function(content){
	return content.replace(/(\n|\r)+/g, '\\n\\\n').replace(/('|")/g,"\\$1");
};

exports.getUglifiedContent = function (content, options, moduleId) {
	var content;
	try{
		content = uglifyJS.minify(content, options).code;
	}
	catch(e){
		vacation.log.error('uglify module['+moduleId+'] failed:\n\t'
				+ e.message
				+ '\n\t[line: ' + e.line + ', col: ' + e.col + ']');
	}
	return content;
};

exports.isHiddenEntity = function(uri){
	return uri.match(/(^|\/)\./g);
};

exports.isURIAvailable = function (URI){
	var conf = exports.getBuildConfig();
	// 让正则保持统一的 linux 风格
	// lib\inherit.js --> lib/inherit.js
	//pth.relative(vacation.cli.configFileDir, URI);
	var Linux_Style_Uri = exports.normalize_win_dir(URI);
	var Linux_Style_relativeUri = exports.normalize_win_dir(pth.relative(vacation.cli.configFileDir, URI));

	// Linux、Mac 下，避免遍历 隐藏文件
	//if(exports.isHiddenEntity(URI)) return false;

	// 正则匹配的时候，只需为 configFileDir 后面的路径来匹配
	// 比如：configFileDir => /Users/pc/proj/ , URI => /Users/pc/proj/src/detail/v_detail.js
	// 则 relativeUri 为：src/detail/v_detail.js
	// 正则匹配为：relativeUri.match(/^src\/detail.*/)
	if(conf.available && conf.available.length){
		return conf.available.some(function(reg){
			return exports.isString(reg)
					? Linux_Style_Uri.indexOf(reg) === 0
					: Linux_Style_relativeUri.match(reg);
		});
	}
	else if(conf.ignore && conf.ignore.length){
		return conf.ignore.every(function(reg){
			// 如果是字符串，必须是根路径
			return exports.isString(reg)
					? Linux_Style_Uri.indexOf(reg) !== 0
					: !Linux_Style_relativeUri.match(reg);
		});
	}
	return true;
};

exports.deal_available_ignore = function(conf){
	if(conf.ignore){
		conf.ignore = conf.ignore.map(function(ignore){
			if(exports.isString(ignore)){
				return exports.normalize_win_dir(ignore.replace('$dist', conf.dist));
			}
			return ignore;
		});
	}
};

// 根据 alias 得到被替换过的路径
exports.get_real_path_by_alias = function(path, aliasObj){
	var aliasPath = path;
	// 必须是 "/" 来分割目录，且不能是根目录
	var aliasPathArr = aliasPath.split('/');
	var i=0,len=aliasPathArr.length, prev ='';
	var haveInPaths = false;
	for(; i<len; i++){
		if(prev) prev += '/';
		prev += aliasPathArr[i];

		if(aliasObj[prev]){
			haveInPaths = true;
			break;
		}
	}
	// 如果alias的路径有部分在paths定义过，则替换回来
	if(haveInPaths){
		//aliasPath = pth.normalize(aliasPath.replace(prev, aliasObj[prev]));
		aliasPath = aliasPath.replace(prev, aliasObj[prev]);
	}
	return aliasPath;
}

exports.dealBanner = function(banner){
	var match;
	// 1. $$today
	banner = banner.replace(/\$\$today\(\s*[^\)]+\s*\)/g, function(today){
		var t;
		today = today.match(/\((.+)\)/)[1];
		// 字符串，如： "yyyy-mm-dd HH:MM:ss"
		if(t = today.match(/^('|")(.+)\1$/)){
			today = t[2];
			return exports.today(today);
		}
	});
	return banner;
};

exports.date = function(date, format){
	var d = date;
	var pad = vacation.util.pad;
	var result = format.replace(/m+/g,function(match){
		return pad(d.getMonth() + 1 + '', match.length, '0', true);
	})
	.replace(/y+/g, function(match){
		var year = d.getFullYear() + '';
		return year.substr(year.length - match.length);
	})
	.replace(/d+/g, function(match){
		return pad(d.getDate() + '', match.length, '0', true);
	})
	.replace(/H+/g, function(match){
		return pad(d.getHours() + '', match.length, '0', true);
	})
	.replace(/M+/g, function(match){
		return pad(d.getMinutes() + '', match.length, '0', true);
	})
	.replace(/s+/g, function(match){
		return pad(d.getSeconds() + '', match.length, '0', true);
	});
	return result;
}

exports.today = function(format){
	return exports.date(new Date(), format);
}

exports.normalize_win_dir = function (path) {
	if(!path) return path;
	return path.replace(/\\/g, '/')
}

exports.getBuildConfig = function (){
	return vacation.cli.config.build;
}

exports.precompileTemplate = function (content, tplType, moduleId){
	try{
		if(tplType == 'Handlebars'){
			return handlebars.precompile(content);
		}
		else if(tplType == 'underscore'){
			return underscore.template(content).source;
		}
		return content;
	}
	catch(e){
		vacation.log.error('precompile template['+moduleId+'] failed.'
			+ '\n\t message: ' + e.message
			//+ '\n\t [line: '+e.line+', col: '+e.col+']'
			+ '\n\t stack: ' + e.stack);
	}
}

// 没有后缀名的都是 js 文件
exports.addExtraNameToFile = function (moduleId){
	//var conf = exports.getBuildConfig();
	//if(!moduleId.match(new RegExp('\\.('+conf.availableType.join('|')+')$')))
	var extName = pth.extname(moduleId);
	if(extName == '.js' || extName == '.css') return moduleId;
	return moduleId += '.js';
}
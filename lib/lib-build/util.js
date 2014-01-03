var pth = require('path');
var fs = require('fs');
var uglifyJS = require('uglify-js');
var handlebars = require('handlebars');

var toString = Object.prototype.toString;

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
	if(toString.call(o) == '[object Array]'){
		for(var i= 0,l= o.length; i<l; i++){
			if(fn.call(o, o[i], i, o) === false) break;
		}
	}
	else if(toString.call(o) == '[object Object]'){
		for(var key in o){
			if(o.hasOwnProperty(key)){
				if(fn.call(o, o[key], key, o) === false) break;
			}
		}
	}
	return o;
};

exports.is = function(moduleId, type){
	return moduleId.lastIndexOf('.'+type) === (moduleId.length - type.length - 1);
}

exports.int = function (o) {
	return parseInt(o, 10);
}

exports.readFile = function(path) {
	try{
		var content = fs.readFileSync(path,{encoding:'utf8'});
		if(!content) vacation.log.error('read file('+path+') failed.');
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
		//buildUtil.writeFile(pth.resolve(vacation.cli.cmd_cwd, 'aaa.txt'), content);
		vacation.log.error('uglify module['+moduleId+'] failed:\n\t'
				+ e.message
				+ '\n\t[line: ' + e.line + ', col: ' + e.col + ']');
	}
	return content;
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
	return path.replace(/\\/g, '/')
}

exports.getBuildConfig = function (){
	return vacation.cli.config.build;
}

exports.precompileHandlebars = function (content, moduleId){
	try{
		return handlebars.precompile(content);
	}
	catch(e){
		vacation.log.error('precompile Handlebars template['+moduleId+'] failed.'
			+ '\n\t message: ' + e.message
			//+ '\n\t [line: '+e.line+', col: '+e.col+']'
			+ '\n\t stack: ' + e.stack);
	}
}

// 没有后缀名的都是 js 文件
exports.addExtraNameToFile = function (moduleId){
	var conf = exports.getBuildConfig();
	if(!moduleId.match(new RegExp('\\.('+conf.availableType.join('|')+')$')))
		moduleId += '.js';
	return moduleId;
}
/*
 * vacation
 * http://vacation.peichao01.com/
 */

'use strict';

var fs = require('fs'),
    pth = require('path'),
    _exists = fs.existsSync || pth.existsSync,
    toString = Object.prototype.toString;

var IS_WIN = process.platform.indexOf('win') === 0;

var _ = module.exports = {};

_.dirSpliter = IS_WIN ? '\\' : '/';

_.isRoot = function(uri){
	return IS_WIN ? uri.match(/[a-zA-Z]:\\$/) : uri == '/';
};

_.getConfigPath = function(){
	var path = vacation.cli.cmd_cwd,
		file = vacation.cli.configFileName,
		isExit, p;
	while(!(isExit = _exists(p = pth.resolve(path, file))) && !_.isRoot(path)){
		path = pth.resolve(path, '..');
	}
	return isExit && p;
};

_.getConfig = function(){
	if(vacation.cli.configFilePath){
		var config = require(vacation.cli.configFilePath);
		if(!_.is(config, 'Object')) vacation.log.error('config script should exports a map object.');
		return config;
	}
	return {};
};

_.exists = _exists;

_.is = function(source, type){
    return toString.call(source) === '[object ' + type + ']';
};

_.map = function(obj, callback, merge){
    var index = 0;
    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            if(merge){
                callback[key] = obj[key];
            } else if(callback(key, obj[key], index++)) {
                break;
            }
        }
    }
};

_.pad = function(str, len, fill, pre){
    if(str.length < len){
        fill = (new Array(len)).join(fill || ' ');
        if(pre){
            str = (fill + str).substr(-len);
        } else {
            str = (str + fill).substring(0, len);
        }
    }
    return str;
};

_.merge = function(source, target){
    if(_.is(source, 'Object') && _.is(target, 'Object')){
        _.map(target, function(key, value){
            source[key] = _.merge(source[key], value);
        });
    } else {
        source = target;
    }
    return source;
};

_.isWin = function(){
    return IS_WIN;
};

_.getPathArr = function(pathStr){
	var dirarr;
	if(IS_WIN){
		dirarr = pathStr.split('\\');
		// windows 上，只有 "C:\" 这种才能被 path.resolve 为根目录
		// 否则被认为是相对路径
		if(dirarr[0].indexOf(':') === dirarr[0].length - 1) dirarr[0] += '\\';
	}
	else{
		var isFromRoot = pathStr.indexOf('/') === 0;
		dirarr = pathStr.split('/');
		if(isFromRoot) dirarr[0]='/'+dirarr[0];
	}
	return dirarr;
};

// win && linux 通用的 mkdir -p 方法
_.mkdir_p = function (path, mode) {
    if (typeof mode === 'undefined') {
        //511 === 0777
        mode = 511 & (~process.umask());
    }
    if(_exists(path)) return;
    
    var dirarr = _.getPathArr(path);
    dirarr.reduce(function (prev, next) {
        if(prev && !fs.existsSync(prev)){
            fs.mkdirSync(prev, mode);
        }
        return pth.resolve(prev, next);
    });

    if(!_exists(path)) {
        fs.mkdirSync(path, mode);
    }
}
// 这个只能在 类linux 上使用
_.mkdir = function(path, mode){
    if (typeof mode === 'undefined') {
        //511 === 0777
        mode = 511 & (~process.umask());
    }
    if(_exists(path)) return;
    path.split('/').reduce(function(prev, next) {
        if(prev && !_exists(prev)) {
            fs.mkdirSync(prev, mode);
        }
        return prev + '/' + next;
    });
    if(!_exists(path)) {
        fs.mkdirSync(path, mode);
    }
};

_.readJSON = function(path){
    var json = _.read(path),
        result = {};
    try {
        result = JSON.parse(json);
    } catch(e){
        vacation.log.error('parse json file[' + path + '] fail, error [' + e.message + ']');
    }
    return result;
};

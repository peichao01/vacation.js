/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

exports.DEFAULT_REMOTE_REPOS = '';

exports.getSource = function(){
	var root = exports.getProjectPath(),
		source = {};
}

var PROJECT_ROOT;
var TEMP_ROOT;

function getPath(root, args){
	if(args && args.length > 0){
		args = root + '/' + [].join.call(args, '/');
		return vacation.util(args);
	} else {
		return root;
	}
}

function initDir(path, title){
	if(vacation.util.exists(path)){
		if(!vacation.util.isDir(path)){
			vacation.log.error('unable to set path['+path+'] as '+title+' directory.');
		}
	} else {
		vacation.util.mkdir(path);
	}
	path = vacation.util.realpath(path);
	if(path){
		return path;
	} else {
		vacation.log.error('unable to create dir ['+path+'] for ' + title + ' directory.');
	}
}

exports.getProjectPath = function () {
	if(PROJECT_ROOT){
		return getPath(PROJECT_ROOT, arguments);
	} else {
		vacation.log.error('undefined project root');
	}
};

exports.setProjectPath = function (path) {
	if(vacation.util.isDir(path)){
		PROJECT_ROOT = vacation.util.realpath(path);
	} else {
		vacation.log.error('invalid project root path ['+path+']');
	}
};

exports.setTempRoot = function (tmp) {
	TEMP_ROOT = initDir(tmp);
};

exports.getTempPath = function () {
	if(!TEMP_ROOT){
		var list = ['LOCALAPPDATA', 'APPDATA', 'HOME'];
		var tmp;
		for(var i=0,len=list.length; i<len; i++){
			if(tmp = process.env[list[i]]){
				break;
			}
		}
		tmp = tmp || __dirname + '/../';
		exports.setTempRoot(tmp + '/.vacation-tmp');
	}
	return getPath(TEMP_ROOT, arguments);
};

exports.getCachePath = function () {
	return getPath(exports.getTempPath('cache'), arguments);
};
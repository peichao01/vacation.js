/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

//var http = require('http');
var fs = require('fs');
// var url = require('url');
var pth = require('path');
var walk = require('walk');

exports.findMainFiles = function (conf, cb) {
	var walker = walk.walkSync(conf.src, {
		followLinks: false,
		filters: []
	});
	var mainFiles = [];
	var availableFiles = {};
	walker.on('file', function (root, fileStats, next) {
		//console.log(fileStats.name);
		var isMain = conf.main.some(function (main) {
			return fileStats.name.match(main);
		});
		if(isMain){
			mainFiles.push(pth.resolve(root, fileStats.name));
		}
		//else{}

		for (var i = conf.availableType.length - 1; i >= 0; i--) {
			var type = conf.availableType[i];
			if(fileStats.name.match(new RegExp('\\.'+type+'$'))){
				var fullPath = pth.resolve(root, fileStats.name);
				//console.log(conf.base)
				// 把文件夹后面的 / 斜线也去掉
				var id = fullPath.substr(conf.base.length + 1);
				// js  可以省略 .js 后缀名
				//if(type == 'js') id = id.substr(0, id.length - 3);
				availableFiles[id] = {
					uri: fullPath,
					type: type
				}
			}
		};

		next();
	});
	walker.on('end', function () {
		cb(mainFiles, availableFiles);
	});
}

exports.transport = function () {
	
}

var status_when_deal_dependencies = {
	NOT_READ:0,
	READING:1,
	READED:2
};
exports.dealDependencies = function (availableFiles) {
	for(var id in availableFiles){
		var val = availableFiles[id];
		var fileContent = fs.readFileSync(val.uri,{encoding:'utf8'});
		if(!fileContent) vacation.log.error('read file('+val.uri+') failed.');

		//console.log(fileContent);return;
		var requireMatched = fileContent.match(/require\((['"]).+?\1\)/g);
		if(requireMatched){
			requireMatched.forEach(function (match) {
				var file = match.match(/(['"])(.*)\1\)/)[2];
				console.log(id+' deps on: ' + file);
				console.log('--------'+pth.resolve(pth.dirname(val.uri), file));
			});
		}
	}
}

exports.generateMap = function(mainFiles, availableFiles, conf){
	//console.log(availableFiles);
	exports.dealDependencies(availableFiles);
}

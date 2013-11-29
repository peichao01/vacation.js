/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

//var http = require('http');
//var fs = require('fs');
// var url = require('url');
var pth = require('path');
var walk = require('walk');

exports.findMainFiles = function (conf, cb) {
	var walker = walk.walkSync(conf.src, {
		followLinks: false,
		filters: []
	});
	var mainFiles = [];
	walker.on('file', function (root, fileStats, next) {
		//console.log(fileStats.name);
		var isMain = conf.main.some(function (main) {
			return fileStats.name.match(main);
		});
		if(isMain){
			mainFiles.push(pth.resolve(root, fileStats.name));
		}
		else{}
		next();
	});
	walker.on('end', function () {
		cb(mainFiles);
	});
}

exports.transport = function () {
	
}

exports.generateMap = function(mainFiles, conf){
	
}

/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

//var http = require('http');
var fs = require('fs');
var uglifyJS = require('uglify-js');
// var url = require('url');
var pth = require('path');
var walk = require('walk');

function getModuleId (fullPath, base) {
	return fullPath.substr(base.length + 1);
}

function is(moduleId, type){
	return moduleId.lastIndexOf('.'+type) === (moduleId.length - type.length - 1);
}

var mainFiles = [];
var availableFiles = {};

exports.find_all_and_main_files = function (conf, cb) {
	var walker = walk.walkSync(conf.src, {
		followLinks: false,
		filters: []
	});
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
				var id = getModuleId(fullPath, conf.base);
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
};

function readFile (path) {
	var content = fs.readFileSync(path,{encoding:'utf8'});
	if(!content) vacation.log.error('read file('+path+') failed.');
	return content;
}

exports.transport = function (conf) {
	for(var moduleId in availableFiles){
						//console.log('aaaaaaaaaa')
		var module = availableFiles[moduleId];
		
		var moduleFullPath = module.uri,
			moduleFullPathLength = moduleFullPath.length;

		// 模板文件 && 允许转换模板
		if(conf.transportTpl && (is(moduleFullPath, 'html') || is(moduleFullPath, 'tpl'))){
			var htmlMinify = require('html-minifier').minify;
			var content = readFile(moduleFullPath);
			var options = {
				removeComments:true
			};
			// 去除空白
			if(conf.tplRemoveWhiteSpace){
				options.collapseWhitespace = true;
			}
			content = htmlMinify(content, options);

			var destContent = 'define("'+moduleId+'",[],function(){return "'+content+'"});';
			console.log(destContent);
		}
		// js文件
		else if(is(moduleFullPath, 'js')){

		}
	}
};

function dealFileDependency (moduleId, conf) {
	var val = availableFiles[moduleId];
	var fileFullPath = val.uri;
	var fileContent = readFile(fileFullPath);
	var uglifiedContent = fileContent;
	// 删除注释和多余的空白等
	if(is(moduleId, 'js')){
		uglifiedContent = uglifyJS.minify(fileContent, {
			fromString: true,
			mangle: false,
			compress: false
		}).code;
	}
	//var uglifiedContent = fileContent;

	//console.log(fileContent);return;
	var requireMatched = uglifiedContent.match(/require\((['"]).+?\1\)/g),
		deps = [];
	//console.log(availableFiles);return;
	if(requireMatched){
		requireMatched.forEach(function (match) {
			var file = match.match(/(['"])(.*)\1\)/)[2];
			// 没有后缀名的都是 js 文件
			if(!file.match(new RegExp('\\.('+conf.availableType.join('|')+')$')))
				file += '.js';
			// 依赖文件的相对路径坐标  
			var depFileRelativeTo = pth.dirname(val.uri);
			if(!file.match(/^(\.\.\/|\.\/|\/)/))
				depFileRelativeTo = conf.base;
			var depFullPath = pth.resolve(depFileRelativeTo, file);
			var depId = getModuleId(depFullPath, conf.base);
			deps.push(depId);
			
			// 检查依赖文件是否在源码目录内
			if(!availableFiles[depId]) 
				vacation.log.error('['+moduleId+ '] dependency on ['+depFullPath+'], but the dependency is not in the src directory ['+conf.src+'].');

			// 检查依赖文件是否存在
			//console.log(depFullPath);return;
			var depIsExists = fs.existsSync(depFullPath);
			if(!depIsExists) 
				vacation.log.error('file('+fileFullPath+') deps on ('+file+')['+depFullPath+'], but this file is not exists.');


			// 检查是否是标准的 seajs 模块
			if(conf.checkCMD){
				if(uglifiedContent.indexOf('define(') !== 0
					&& moduleId.lastIndexOf('.js') !== moduleId.length-3){
					vacation.log.warning('['+moduleId+'] is not a standard CMD module.');
				}
			}
		});
	}

	return deps;
}

/*
* 
* @param {Array} modIds [  // 要检查的模块
*						{id:'script/a.js', index: 0},
*						{id:'script/b.js', index: 0},
*					]
* @param {Number} dependencyIndexToCheck // 检查模块的第几个依赖
*/
function check_circular_reference(modIds, dependencyIndexToCheck){
	if(modIds.length){
		// 要检查的 模块
		var currentModToCheck = modIds[modIds.length - 1];
		var currentModIdToCheck = currentModToCheck.id;
		var currentModDepsToCheck = availableFiles[currentModIdToCheck].deps;

		// 要检查的 依赖
		var currentDepIdToCheck = currentModDepsToCheck[dependencyIndexToCheck];
		// 当前模块有依赖其他模块 && 要检查的依赖也是存在的
		if(currentModDepsToCheck.length && currentDepIdToCheck){
			

			// 要检查的依赖不存在，说明，当前模块的依赖已经检查完了，推出当前模块
			// if(!currentDepIdToCheck){
			// 	modIds.pop();
			// 	if(currentModToCheck.index !== -1){
			// 		var nextIndexToCheck = currentModToCheck.index + 1;
			// 		check_circular_reference(modIds, nextIndexToCheck);
			// 	}
			// }
			// else {
				var findIfTheDepIsAreadyInTheIDChain = modIds.filter(function(ele){return ele.id==currentDepIdToCheck}).pop();
				// ERROR. 循环引用了
				if(findIfTheDepIsAreadyInTheIDChain){
					var index = modIds.indexOf(findIfTheDepIsAreadyInTheIDChain);
					var circularModIds = modIds.splice(index).concat(findIfTheDepIsAreadyInTheIDChain).map(function (mod) {
						return mod.id;
					});
					var seperator = '\n --> ';
					vacation.log.error('[' + seperator + circularModIds.join(seperator)+'\n]\n are circulare referenced.');
				}
				else{
					var nextModToCheck = {
						id: currentDepIdToCheck,
						index: dependencyIndexToCheck
					};
					// 推入当前要检查的依赖，作为模块从第一个开始检查它的依赖
					modIds.push(nextModToCheck);
					check_circular_reference(modIds, 0);
				}
			//}
		}
		// ①当前模块不依赖其他模块 || ②要检查的依赖不存在
		// ①. 说明：当前模块的依赖可以当作检查完了，推出当前模块
		// ②. 说明：当前模块的依赖已经检查完了，推出当前模块
		else{
			// 先把当前模块吐出来
			modIds.pop();
			// modIds.length === 1 的时候，就是 currentModToCheck.index === -1 的时候
			// 即只剩下要当前检查的【根模块】了，直接退出即可，以便检查下一个【根模块】
			if(currentModToCheck.index !== -1){
				// 如果不是【根模块】
				// 再检查当前模块的下一个兄弟模块
				var nextIndexToCheck = currentModToCheck.index + 1;
				check_circular_reference(modIds, nextIndexToCheck);
			}
		}
	}
}

exports.dealDependencies = function (availableFiles, conf, cb) {
	for(var id in availableFiles){
		var val = availableFiles[id];
		
		val.deps = dealFileDependency(id, conf);
	}

	// 检查循环引用
	for(var modId in availableFiles){
		var idsWithThisMod = [{
			id:modId,
			index: -1
		}];
		check_circular_reference(idsWithThisMod, 0);
	}

	cb();
}

exports.writeMapFile = function (conf) {
	var err = fs.writeFileSync(pth.resolve(conf.base, 'map.json'), JSON.stringify(availableFiles, '\t', 4), {encoding:'utf8'});
	if(err) vacation.log.error('write map file error.');
}

exports.generateMap = function(mainFiles, availableFiles, conf){
	//console.log(availableFiles);
	exports.dealDependencies(availableFiles);
}

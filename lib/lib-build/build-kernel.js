/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var fs = require('fs');
var uglifyJS = require('uglify-js');
var pth = require('path');
var walk = require('walk');

var buildUtil = require('./util');
var resourceManager = require('./resource_manager');




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
				if(real_alias[key]) vacation.log.error('[config file]: the key in alias('+key+') has defined in paths.');
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
	//return real_alias;
	conf.real_alias = real_alias;
	//console.log(real_alias);process.exit(0);
};

// 比如 paths 中有设置 "lib":".."
// base 目录的子级目录也有一个叫 lib 的文件夹
// 则 模块的 ID 就会存在歧义。
// lib/jquery，究竟是 paths 中 lib 指向的目录下面的 jquery，还是  base/lib 下面的jquery？
exports.check_alias_topDir_conflict = function(){
	var conf = getBuildConfig();
	var real_alias_keys = Object.keys(conf.real_alias);
	if(fs.existsSync(conf.base)){
		var conflict = false, name, dirInBase;
		var dirs = fs.readdirSync(conf.base);
		//console.log(dirs);process.exit(0);
		dirs.forEach(function(dir){
			var path = pth.resolve(conf.base, dir);
			var stats = fs.statSync(path);
			if(stats.isDirectory()){
				if(real_alias_keys.indexOf(dir) >= 0){
					name = dir;
					dirInBase = path;
					conflict = true;
				}
			}
		});
		if(conflict){
			vacation.log.error('paths or alias set the conflict name('+name+') with the directory in the base directory('+dirInBase+').');
		}
	}
	else{
		vacation.log.error('base directory('+conf.base+') not exists.');
	}
};

function getBuildConfig(){
	return vacation.cli.config.build;
}

function getModuleInfoFromURI(uri){
	var configFileDir = vacation.cli.configFileDir;
	var conf = getBuildConfig();
	// 顶级标识都必须相对于 base 路径来解析
	var relative = pth.relative(conf.base, uri);
	var moduleId, idType, type, inBase;
	// module 不在 base 目录内
	if(relative.indexOf('.') === 0){
		var matched = [];
		inBase = false;
		for(var key in conf.real_alias){
			// 先将别名等转换为 根路径，alias、paths 都是基于 vacation.json 配置文件所在目录在转换的。
			var aliasRootPath = pth.resolve(configFileDir, conf.real_alias[key]);
			if(pth.relative(aliasRootPath, uri).indexOf('.') !== 0){
				matched.push([key, aliasRootPath]);
			}
		}
		if(matched.length > 0){
			// 按 aliasRootPath 的长度排序，越长越靠前。
			matched.sort(function(a,b){
				return a[1].length - b[1].length < 0;
			});
			// resolve 返回的结果(matched[0][1])，是已经去除掉最后一个'/'字符的
			moduleId = uri.replace(matched[0][1], matched[0][0]);
			idType = 'real_alias';
		}
		else{
			vacation.log.error('module(uri:'+uri+') not in the base directory('+conf.base+'), and no paths or alias relative to its path.');
		}
	}
	else{
		moduleId = relative;
		idType = 'top';
		inBase = true;
	}
	type = uri.substr(uri.lastIndexOf('.') + 1);

	return {
		uri: uri,
		id:normalize_win_dir(moduleId),
		type: type,
		idType: idType,
		inBase: inBase,
		inSrc: pth.relative(conf.src, uri).indexOf('.')!==0
	};
}

function normalize_win_dir (path) {
	return path.replace(/\\/g, '/')
}

function isURIAvaliable(URI){
	var conf = getBuildConfig();
	var relativeUri = pth.relative(vacation.cli.configFileDir, URI);

	// Linux、Mac 下，避免遍历 隐藏文件
	if(URI.split('/').some(function(dir){return dir.match(/^\./)})) return false;

	// 正则匹配的时候，只需为 configFileDir 后面的路径来匹配
	// 比如：configFileDir => /Users/pc/proj/ , URI => /Users/pc/proj/src/detail/v_detail.js
	// 则 relativeUri 为：src/detail/v_detail.js
	// 正则匹配为：relativeUri.match(/^src\/detail.*/)
	if(conf.avaliable && conf.avaliable.length){
		return conf.avaliable.some(function(reg){
			return relativeUri.match(reg);
		});
	}
	else if(conf.ignore && conf.ignore.length){
		return conf.ignore.every(function(reg){
			return !relativeUri.match(reg);
		});
	}
	return true;
}

// 把文件都走一遍，处理 ID，URI，cmd，idType，type 等。
exports.dealAllFiles = function(callback){
	var conf = getBuildConfig();
	// configFileDir >= cmd_cwd
	//var walker = walk.walkSync(vacation.cli.config.cmd_cwd, {
	var walker = walk.walkSync(vacation.cli.configFileDir, {
		followLinks:false,
		filters:[]
	});
	walker.on('file', function(root, fileStats, next){
		var URI = pth.resolve(root, fileStats.name);

		if(isURIAvaliable(URI)){
			var moduleInfo = getModuleInfoFromURI(URI);
			resourceManager.setResource(moduleInfo.id, moduleInfo);
		}
		else{
			console.log('ignored: ' + URI);
		}
	});
	walker.on('end',function(){
		callback();
	});
};

function addExtraNameToFile(moduleId){
	var conf = getBuildConfig();
	if(!moduleId.match(new RegExp('\\.('+conf.availableType.join('|')+')$')))
		moduleId += '.js';
	return moduleId;
}

function dealModuleDependency(moduleId,moduleInfo){
	var conf = getBuildConfig();
	var moduleContent = buildUtil.readFile(moduleInfo.uri);
	var uglifiedContent = moduleContent;
	// 删除注释和多余的空白等
	if(buildUtil.is(moduleInfo.uri, 'js')){
		uglifiedContent = uglifyJS.minify(moduleContent, {
			fromString: true,
			mangle: false,
			compress: false
		}).code;
		// 最标准的 CMD 模块
		if(uglifiedContent.match(/^define\(/g)){
			moduleInfo.cmd = 0;
		}
		// 非 CMD 模块
		else if(!uglifiedContent.match(/\bdefine\(/g)){
			moduleInfo.cmd = -1;
		}
		// 有 define(， 但是不在顶部，可能是兼容amd 或 cmd 或其他情况
		else{
			moduleInfo.cmd = 1;
		}
	}
	else{
	}

	// => ["require("a")", "require("b")"]
	var requireMatched = uglifiedContent.match(/require\((['"]).+?\1\)/g);
	var deps = [];
	if(requireMatched){
		requireMatched.forEach(function (match) {
			var useAlias;
			// => ['"b")', '"', 'b']
			var depModuleFile = match.match(/(['"])(.*)\1\)/)[2];
			var aliasedPath = buildUtil.get_real_path_by_alias(depModuleFile, conf.real_alias);
			if(depModuleFile != aliasedPath){
				useAlias = true;
			}
			depModuleFile = aliasedPath;
			// 没有后缀名的都是 js 文件
			depModuleFile = addExtraNameToFile(depModuleFile);

			// 依赖文件的
			var depModuleRelativeTo;
			// 顶级标识：相对于 base 基础路几个呢
			if(depModuleFile.match(/^\w+/)){
				depModuleRelativeTo = conf.base;
			}
			// 相对路径
			else if(depModuleFile.match(/^(\.\.\/|\.\/)/)){
				// 相对于 conf.base 目录
				if(useAlias){
					depModuleRelativeTo = vacation.cli.configFileDir;
				}
				// 相对路径：相对于当前模块
				else{
					depModuleRelativeTo = pth.dirname(moduleInfo.uri);
				}
			}
			// 根路径：相对于 conf.www 目录
			else if(depModuleFile.match(/^\//)){
				depModuleRelativeTo = conf.www;
				if(!conf.www) vacation.log.error('module('+moduleInfo.uri+') require('+depModuleFile+') but the www directory is not config.');
			}
			var depModuleURI = pth.resolve(depModuleRelativeTo, depModuleFile);
			if(depModuleURI.indexOf('http://') == 0){
				deps.push(depModuleURI);
			}
			else{
				var depModuleID = resourceManager.getResourceIDByURI(depModuleURI);

				// 检查依赖文件是否存在
				var depIsExists = fs.existsSync(depModuleURI);
				if(!depIsExists) {
					//console.log(vacation.cli.configFileDir);
					//console.log(useAlias);
					//console.log(depModuleFile);
					//console.log(depModuleRelativeTo);
					//console.log(depModuleFile.match(/^\w+/));
					//console.log(depModuleFile.match(/^(\.\.\/|\.\/)/));
					//console.log(depModuleFile.match(/^\//));
					console.log('module('+moduleId+') deps on ('+depModuleURI+'), but this file is not exists.');
				}

				// 检查文件是否在 confFileDir 目录内
				if(!depModuleID){
					vacation.log.error('module('+depModuleURI+') is not found.');
				}

				deps.push(depModuleID);
			}
		});
	}
	moduleInfo.deps = deps;
	return deps;
}

exports.dealDependencies = function(){
	var allResources = resourceManager.getResource();
	for(var moduleId in allResources){
		var moduleInfo = allResources[moduleId];
		dealModuleDependency(moduleId, moduleInfo);
	}
};

/*
*
* @param {Array} modIds [  // 要检查的模块
*						{id:'script/a.js', index: 0},
*						{id:'script/b.js', index: 0},
*					]
* @param {Number} dependencyIndexToCheck // 检查模块的第几个依赖
*/
// 这段代码虽然很短，但感觉很绕，搞了大半天，虽然可以了，但以后再看还是很绕。。。
function check_circular_reference(modIds, dependencyIndexToCheck){
	if(modIds.length){
		// 要检查的 模块
		var currentModToCheck = modIds[modIds.length - 1];
		var currentModIdToCheck = currentModToCheck.id;
		var currentModDepsToCheck = resourceManager.getResource(currentModIdToCheck).deps;

		// 要检查的 依赖
		var currentDepIdToCheck = currentModDepsToCheck[dependencyIndexToCheck];
		// 当前模块有依赖其他模块 && 要检查的依赖也是存在的
		if(currentModDepsToCheck.length && currentDepIdToCheck){
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

// 检查循环引用
exports.checkCircularReference = function(){
	var allResources = resourceManager.getResource();
	for(var moduleId in allResources){
		var idsWithThisModule = [{
			id:moduleId,
			index: -1
		}];
		check_circular_reference(idsWithThisModule, 0);
	}
};

// 写 map.json
exports.writeMapFile = function () {
	var mapFilePath = pth.resolve(pth.dirname(vacation.cli.configFilePath), 'map.json');
	buildUtil.writeFile(mapFilePath, JSON.stringify(resourceManager.getAvailableFile(), null, 4));
}

/*
* @param {String} moduleId
* @param {Config} conf
* @param {Boolean} [delCssInDep = false]
* @param {String} [idWriteOnModule = moduleId]
* @param {Boolean} [convertDependency_tpl_2_js = false]
*
* @return {Object} destContent
*/
function _transport(moduleId, conf, optionalArgs){
	optionalArgs = optionalArgs||{};
	var delCssInDep = optionalArgs.delCssInDep;
	var idWriteOnModule = optionalArgs.idWriteOnModule || moduleId;
	var module = getResource(moduleId);
	
	var moduleFullPath = module.uri,
		moduleFullPathLength = moduleFullPath.length;

	// 在 windows 下，虽然路径都显示为："C:\\cygwin64\\home\\peic\\ctrip-vacation-test\\src\\script\\index.js"
	// 但是读取文件什么的都正常
	var content = readFile(moduleFullPath);
	var destContent;
	// 模板文件 && 允许转换模板
	if(is(moduleFullPath, 'html') || is(moduleFullPath, 'tpl')){
		var htmlMinify = require('html-minifier').minify;
		var options = {
			removeComments:true
		};
		// 优化模板，去除空白等
		if(conf.optimizeTpl){
			options.collapseWhitespace = true;
		}
		destContent = htmlMinify(content, options);

		// html 里面用的都是【"】双引号，所以 return 要用 【'】单引号
		if(conf.transportTpl){
			//到最后拼接字符串的时候，如果有换行，就需要反斜线转义
			// \r windows
			// \n *nux
			destContent = destContent.replace(/\r/g, '\\').replace(/\n/g,'\\\n');
			destContent = 'define("'+moduleId+'",[],function(){'
				+(conf.optimizeTpl?'':'\n\n')+'return \''
				+destContent+'\''+(conf.optimizeTpl?'':'\n\n')+'});';
		}
	}
	// js文件
	else if(is(moduleFullPath, 'js')){// && isMarkedCMD(conf, moduleId)){
		//destContent = 'define("'+moduleId+'", ["'+module.deps.join('", "')+'"], function(require, exports, module){\n\n'+content+'\n\n})';
		var reg = /(define\()[^\(]*(function\s*\()/g;
		if(content.match(reg)){
			if(optionalArgs.convertDependency_tpl_2_js){
				content = content.replace(/\brequire\(\s*('|")(.+?\.(?:html|tpl))\1\s*\)/g, "require($1$2.js$1)");
			}
			// if(optionalArgs.dd){
			// 	console.log(content);
			// }
			destContent = content.replace(reg, function(match, $1, $2){
				var deps = '', depsArr = module.deps;
				if(delCssInDep){
					depsArr = depsArr.filter(function(dep){ return !is(dep, 'css') });
				}
				if(depsArr.length){ 
					if(optionalArgs.convertDependency_tpl_2_js){
						depsArr = depsArr.map(function(dep){
							return dep.replace(/\.(html|tpl)$/g,".$1.js");
						});
					}
					deps += '"' + depsArr.join('", "') + '"';
				}

				return $1 + '"'+idWriteOnModule+'", ['+deps+'], '+$2;
			});
		}else{
			console.log('[NOT TRANSPORT]: '+moduleId);
			destContent = content;
		}

		if(conf.optimize){
			destContent = uglifyJS.minify(destContent, {
				fromString: true,
				mangle: true,
				compress: true
			}).code;
		}
	}
	else{
		destContent = content;
	}
	return destContent;
}

exports.transport = function (conf) {
	for(var moduleId in availableFiles.res){
		var module = getResource(moduleId);
		var destContent = _transport(moduleId, conf, {
			convertDependency_tpl_2_js: true
		});
		var originUri = module.uri,
			destUri = pth.resolve(conf.dest, moduleId);
		if(conf.transportTpl){
			if(is(moduleId,'html') || is(moduleId, 'tpl')){
				destUri += '.js';
			}
			else if(is(moduleId, 'js')){

			}
		}
		writeFile(destUri, destContent);
	}
};

function getAllDeps(moduleId, allDeps){
	var module = getResource(moduleId);
	var deps = module.deps;
	//var allDeps = [];
	if(!deps){
		console.log(module);
		process.exit(0);
	}
	deps.forEach(function(depId){
		if(allDeps.indexOf(depId)<0){
			allDeps.push(depId);
			//allDeps = allDeps.concat(getAllDeps(depId, allDeps));
			getAllDeps(depId, allDeps)
		}
	});
	//return allDeps;
}

// 其实只要在依赖数组中剔除就可以了
function concatDealInlineCss(jsContent, conf){
	// 剔除 inline 的 css
	// if(conf.style === 'inline'){
	// 	jsContent = jsContent.replace(/\brequire\(\s*('|").+?\.css\s*\1\s*\)/g,'');
	// }
	return jsContent;
}

exports.concatToMain = function(conf){
	// 此处假定 main 肯定是 JS 文件
	var ext = '.js',
		extlen = ext.length;
	mainFiles.forEach(function(main){
		var filename = pth.basename(main),
			basename = filename.substr(0, filename.length - extlen);
		var allDeps = [];
		getAllDeps(main, allDeps);
		//allDeps.push(main);

		// p0
		var pkgName = 'p' + Object.keys(availableFiles.pkg).length;
		var pkgHas = [];

		var fileContent = '';
		var isLoadSeajsStyle = false;
		allDeps.forEach(function(depId){
			var module = getResource(depId);
			var hasThisDep = true;
			if(is(depId, 'css')){
				var depFullPath = pth.resolve(conf.src, depId);
				if(conf.style === 'inline'){
					if(!isLoadSeajsStyle){
						isLoadSeajsStyle = true;
						var seajsTextContent = uglifyJS.minify(pth.resolve(__dirname,'../seajs-style.js')).code;
						fileContent += ';'+seajsTextContent+'\n';
					}
					var cssContent = readFile(depFullPath);
					cssContent = cssContent.replace(/\t/g,' ').replace(/\s+/g,' ').replace(/\r|\n/g,'').replace(/('|")/g,'\\$1');
					fileContent += ';seajs.importStyle("'+cssContent+'")\n';
				} else {
					hasThisDep = false;
					console.log('[CSS]: ' + depFullPath);
				}
			} else {
				var jsContent = ';'+_transport(depId, conf, {
					delCssInDep:true,
					convertDependency_tpl_2_js: true
				})+'\n'; //readFile(filePath)+';\n';
				fileContent += concatDealInlineCss(jsContent, conf);
			}
			if(hasThisDep){
				module.pkg = pkgName;
				pkgHas.push(depId);
			}
		});

		var destObj = conf.pkg[filename];
		var destFileRule = destObj.rule;
		var destfilename = destFileRule.replace('$1',basename).replace('$2', pkgName);
		var destpath = pth.resolve(conf.dest, pth.dirname(main), destfilename);
		//console.log(destpath)
		//var destpath = pth.resolve(conf.dest, 'pkg', destfilename);

		availableFiles.pkg[pkgName] = {
			uri:destpath,
			has: pkgHas
		};

		// 最终输出的打包文件要更换ID
		var mainFileContent = _transport(main, conf, {
			delCssInDep:true,
			idWriteOnModule: getModuleId(destpath, pth.resolve(conf.dest)),
			convertDependency_tpl_2_js: true
		});
		/*mainFileContent = mainFileContent.replace(/(define\(\s*)('|")([^'"]+)\2/g,function(match,$1,$2,$3){
			return $1+$2+ getModuleId(destpath, pth.resolve(conf.dest)) +$2;
		});*/
		fileContent += concatDealInlineCss(mainFileContent, conf);

		exports.writeMapFile();
		writeFile(destpath, fileContent);
	});
}

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




function getUglifiedContent (content, options, moduleId) {
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
}

function precompileHandlebars(content, moduleId){
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
	//return real_alias;
	conf.real_alias = real_alias;
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
			vacation.log.error('[421] paths or alias set the conflict name('+name+') with the directory in the base directory('+dirInBase+').');
		}
	}
	else{
		vacation.log.error('[422] base directory('+conf.base+') not exists.');
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
			vacation.log.error('[423] module(uri:'+uri+') not in the base directory('+conf.base+'), and no paths or alias relative to its path.');
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

function isURIAvailable(URI){
	var conf = getBuildConfig();
	var relativeUri = pth.relative(vacation.cli.configFileDir, URI);
	// 让正则保持统一的 linux 风格
	// lib\inherit.js --> lib/inherit.js
	var Linux_Style_relativeUri = relativeUri.replace(/\\/g, '/');

	// Linux、Mac 下，避免遍历 隐藏文件
	if(URI.split('/').some(function(dir){return dir.match(/^\./)})) return false;

	// 正则匹配的时候，只需为 configFileDir 后面的路径来匹配
	// 比如：configFileDir => /Users/pc/proj/ , URI => /Users/pc/proj/src/detail/v_detail.js
	// 则 relativeUri 为：src/detail/v_detail.js
	// 正则匹配为：relativeUri.match(/^src\/detail.*/)
	if(conf.available && conf.available.length){
		return conf.available.some(function(reg){
			return Linux_Style_relativeUri.match(reg);
		});
	}
	else if(conf.ignore && conf.ignore.length){
		return conf.ignore.every(function(reg){
			return !Linux_Style_relativeUri.match(reg);
		});
	}
	return true;
}

// 把文件都走一遍，处理 ID，URI，cmd，idType，type 等。
/*
* @param {Function} callback
* @param {Boolean} isConsoleIgnored
*/
exports.dealAllFiles = function(args){
	var conf = getBuildConfig();
	// configFileDir >= cmd_cwd
	//var walker = walk.walkSync(vacation.cli.config.cmd_cwd, {
	var walker = walk.walkSync(vacation.cli.configFileDir, {
		followLinks:false,
		filters:[]
	});
	walker.on('file', function(root, fileStats, next){
		var URI = pth.resolve(root, fileStats.name);

		if(isURIAvailable(URI)){
			var moduleInfo = getModuleInfoFromURI(URI);
			resourceManager.setResource(moduleInfo.id, moduleInfo);
		}
		else{
			if(args.isConsoleIgnored) console.log('ignored: ' + URI);
		}
	});
	walker.on('end',function(){
		args.callback();
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
		uglifiedContent = getUglifiedContent(moduleContent, {
			fromString: true,
			mangle: false,
			compress: false
		}, moduleInfo.id);
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
			//var $1 = depModuleFile;
			var aliasedPath = buildUtil.get_real_path_by_alias(depModuleFile, conf.real_alias);
			//var $2 = aliasedPath;
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
				if(!conf.www) vacation.log.error('[424] module('+moduleInfo.uri+') require('+depModuleFile+') but the www directory is not config.');
			}
			//var $3 = depModuleFile;
			
			//var $4 = depModuleURI;
			if(depModuleFile.indexOf('http://') == 0){
				deps.push(depModuleFile);
			}
			else{
				var depModuleURI = pth.resolve(depModuleRelativeTo, depModuleFile);
				var depModuleID = resourceManager.getResourceIDByURI(depModuleURI);

				// 检查依赖文件是否存在
				var depIsExists = fs.existsSync(depModuleURI);
				if(!depIsExists) {
					vacation.log.error('[425-1] module('+moduleId+') deps on ('+depModuleURI+'), but this file is not exists.');
				}

				// 检查被依赖的文件是否在 confFileDir 目录内
				if(!depModuleID){
					var Linux_Style_uriFromConfigFileDir = pth.relative(vacation.cli.configFileDir, depModuleURI)
															.replace(/\\/g, '/');
					var ignoredReg = conf.ignore.filter(function(reg){
						return Linux_Style_uriFromConfigFileDir.match(reg);
					});
					// 检查是否是被 ignore 正则过滤掉了
					if(ignoredReg.length){
						vacation.log.error('[425-2] module('+moduleId+') deps on module('+depModuleURI+'), but it has beed ignored by: ' + ignoredReg[0]);
					}
					else{
						vacation.log.error('[425-3] module('+moduleId+') deps on module('+depModuleURI+'), but it is not found.');
					}
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
		var resource = resourceManager.getResource(currentModIdToCheck);
		if(!resource){
			// http:// 模块不必检查
			if(currentModIdToCheck.indexOf('http://') == 0){
				return;
			}
			else{
				var moduleId = modIds[modIds.length - 2].id;
				var depModuleId = modIds[modIds.length - 1].id
				vacation.log.error('[425-4] module('+moduleId+') deps on ('+depModuleId+'), but this module can not be found.');
			}
		}
		var currentModDepsToCheck = resource.deps;

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
				vacation.log.error('[426] [' + seperator + circularModIds.join(seperator)+'\n]\n are circulare referenced.');
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
	var mapFilePath = pth.resolve(vacation.cli.configFileDir, 'map.json');
	buildUtil.writeFile(mapFilePath, JSON.stringify(resourceManager.getAvailableFile(), null, 4));
}

/*
 * @param {String} content 模板文件的文字内容 readFile 得到
 * @param {String} moduleId 
 * @param {String} [idWriteOnModule = moduleId]
 * @param {Boolean} [precompile]
 * @param {Boolean} [transport = false]
 * @param {Boolean} [optimize = false]
 * @param {Boolean} [precompile = false]
 * @param {Boolean} [removeComments = true]
 */
exports.transportTemplate = function(options){
	options = options||{};
	var idWriteOnModule = options.idWriteOnModule || options.moduleId;
	if(typeof options.removeComments === 'undefined') options.removeComments = true;

	var opt = {
		removeComments: options.removeComments,
		removeHandlebarsComments: options.removeComments
	};

	// 优化模板，去除空白等
	if(options.optimize){
		opt.collapseWhitespace = true;
	}

	var destContent = htmlMinify(options.content, opt);

	// 预编译，返回值为函数
	if(options.precompile){
		var compiledTplFn = precompileHandlebars(destContent, options.moduleId); //handlebars.precompile(destContent);
		if(options.optimize) {
			// 一个匿名函数作为一个表达式来说是不成立的，所以无法 uglify
			var prefixBeforeUglify = 'var a=';
			compiledTplFn = getUglifiedContent(prefixBeforeUglify + compiledTplFn, {
				fromString: true,
				mangle: true,
				compress: true
			}, options.moduleId).substr(prefixBeforeUglify.length);
		}

		if(options.transport){
			// 模板预编译，因为有 Handlebars.compile 和 Handlebars.registerPartial 两种
			// 所以，还是需要直接在模板中 Handlebars.template，兼容上面两个方法
			// Handlebars.registerPartial 的第二个参数既可以是 string模板，也可以是 template 之后的函数
			// fn.isPrecompiled 供 Handlebars 的 预编译补丁使用(/lib/lib-build/tpl_hb_precompile.txt)
			destContent = 'define("'+idWriteOnModule+'",[],function(require,exports,module){'
							+	'var fn = Handlebars.template(' + compiledTplFn + ');'
							+	'fn.isPrecompiled = true;'
							+	'module.exports = fn;'
							+'});';
		}
		// 不推荐
		// precompile 但没有 transport
		else{
			vacation.log.warn('[NOT RECOMMAND] template will be precompiled but not transported.');
			destContent = ['(function(){'
							, 	'var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};'
							,	'template["'
							,		idWriteOnModule
							,	'"] = template('
							,		compiledTplFn
							,	')'
							,'})()'].join('');
		}
	}
	// 值为字符串
	else{
		if(options.transport){
			// 转义换行符和引号
			destContent = destContent.replace(/(\n|\r)+/g, '\\n\\\n')
									.replace(/('|")/g,"\\$1");
			destContent = 'define("'+idWriteOnModule+'",[],"'+destContent+'");';
		}
		// 既没有 precompile，也没有 transport
		// 相当于只是删除空白注释
		else{

		}
	}

	return destContent;
}

// 此函数必须以遍历模块的方式来调用
// 因为预编译的话，模板和调用的模板都会被改变
/*
* @param {String} moduleId
* @param {Boolean} isOptimize
* @param {Number} [HandlebarsMode]
* @param {Boolean} [delCssInDep = false]
* @param {String} [idWriteOnModule = moduleId]
* @param {Boolean} [convertDependency_tpl_2_js = false]
*
* @return {Object} destContent
*/
function getTransportedContent(moduleId, optionalArgs){

	if(moduleId.indexOf('http://') == 0){
		console.log('[REMOTE MODULE] [GET CONTENT] ' + moduleId);
		return;
	}

	optionalArgs = optionalArgs||{};
	var conf = getBuildConfig();
	var delCssInDep = optionalArgs.delCssInDep;
	var idWriteOnModule = optionalArgs.idWriteOnModule || moduleId;
	var module = resourceManager.getResource(moduleId);

	if(!module){
		vacation.log.error('can not find module: ' + moduleId);
	}

	// 在 windows 下，路径显示为："C:\\cygwin64\\home\\peic\\ctrip-vacation-test\\src\\script\\index.js"
	// 因为反斜线本身就是转义字符
	var content = buildUtil.readFile(module.uri);
	var destContent;
	// 模板文件
	if(buildUtil.is(module.uri, 'html') || buildUtil.is(module.uri, 'tpl')){
		destContent = exports.transportTemplate({
			content: content,
			moduleId: moduleId,
			idWriteOnModule: optionalArgs.idWriteOnModule,
			precompile: optionalArgs.HandlebarsMode,
			transport: true,//conf.transportTpl,
			optimize: optionalArgs.isOptimize //conf.optimizeTpl
		});
	}
	// js文件
	else if(buildUtil.is(module.uri, 'js')){// && isMarkedCMD(conf, moduleId)){
		//destContent = 'define("'+moduleId+'", ["'+module.deps.join('", "')+'"], function(require, exports, module){\n\n'+content+'\n\n})';
		var reg = /(define\()[^\(]*(function\s*\()/g;
		//if(content.match(reg)){
		if(module.cmd === 0){
			//将模块中对 模版的依赖 改为对 transport后的模板的依赖
			if(optionalArgs.convertDependency_tpl_2_js){
				content = content.replace(/\brequire\(\s*('|")(.+?\.(?:html|tpl))\1\s*\)/g, "require($1$2.js$1)");
			}
			destContent = content.replace(reg, function(match, $1, $2){
				var deps = '', depsArr = module.deps;
				// 删除对CSS的依赖
				if(delCssInDep){
					depsArr = depsArr.filter(function(dep){ return !buildUtil.is(dep, 'css') });
				}
				// 拿到对依赖模块数组的字符串序列
				if(depsArr.length){ 
					// 将 模版依赖 改为对 transport后模版的依赖
					if(optionalArgs.convertDependency_tpl_2_js){
						depsArr = depsArr.map(function(dep){
							return dep.replace(/\.(html|tpl)$/g,".$1.js");
						});
					}
					deps += '"' + depsArr.join('", "') + '"';
				}

				return $1 + '"'+idWriteOnModule+'", ['+deps+'], '+$2;
			});
			// mode == 1 需要处理引用模板的JS模块
			if(optionalArgs.HandlebarsMode == 1){
				// 目前不支持在 Handlebars.compile 函数中使用第二个参数
				// 因为静态编译无法准确将第二个参数转到合适的模板中去
				var useTheSecondParamInCompile = destContent.match(/Handlebars\.compile\(([^,|\)]*),[^\)]*\)/g);
				if(useTheSecondParamInCompile){
					vacation.log.error('precompile doest not support the second options argument in Handlebars.compile(). '
									+ 'code at : ' + useTheSecondParamInCompile[0]);
				}
				// 模板预编译，因为有 Handlebars.compile 和 Handlebars.registerPartial 两种
				// 所以，还是需要直接在模板中 Handlebars.template，兼容上面两个方法
				destContent = destContent.replace(/Handlebars\.compile\(([^\)]*)\)/g
												//, 'Handlebars.template($1')
												, '$1');
			}
		}else{
			console.log('[NOT TRANSPORT]: '+moduleId);
			destContent = content;
		}

		//if(conf.optimize){
		if(optionalArgs.isOptimize){
			destContent = getUglifiedContent(destContent, {
				fromString: true,
				mangle: true,
				compress: true
			}, moduleId);
		}
	}
	else{
		destContent = content;
	}
	return destContent;
}

/*
* @param {String} moduleUri
* @param {String} [relativeTo = $dest]
*/
exports.getRelativeUri = function(moduleUri, relativeTo){
	var conf = getBuildConfig();
	relativeTo = relativeTo || conf.dest;
	var destUri = pth.resolve(relativeTo, pth.relative(conf.src, moduleUri));
	return destUri;
};

function isPackageModule (moduleId) {
	resourceManager.dealPkgInfo();
	var conf = getBuildConfig();
	var r = conf.pkg.filter(function (module) {
		return module.id == moduleId;
	});
	return r.length > 0;
}

// 默认只 transport config.src 目录下的模块
/*
* @param {Boolean} isOptimize
* @param {String} transportDir
* @param {Number} HandlebarsMode
* @param {Boolean} isTplonly only use tpl(.tpl|.html) even if transported tpl(.tpl.js|.html.js) exists too.
*/
exports.transport = function (args) {
	var conf = getBuildConfig();
	var destDir = pth.resolve(conf.dest, args.transportDir);
	if(!fs.existsSync(destDir)){
		vacation.log.error('the dir that provided['+destDir+'] by option `transport` does not exists.');
	}
	if(destDir == conf.src || destDir == conf.base){
		vacation.log.error('the dir that provided['+destDir+'] is the src or base dir. it is forbidden.');
	}
	var stats = fs.statSync(destDir);
	if(!stats.isDirectory()){
		vacation.log.error('the dir that provided['+destDir+'] by option `transport` is not a directory.');
	}
	var allResources = resourceManager.getResource();
	for(var moduleId in allResources){
		var module = resourceManager.getResource(moduleId);
		var isTransportedTpl = moduleId.match(/\.(html|tpl)\.js$/);
		// 如果 isTplonly 则 过滤掉 transported template
		if(module.inSrc 
			&& !(args.isTplonly && isTransportedTpl)
			&& moduleId.trim().indexOf('http://') !== 0)
		{
			var destContent = getTransportedContent(moduleId, {
				convertDependency_tpl_2_js: true,
				isOptimize: args.isOptimize,
				HandlebarsMode: args.HandlebarsMode,
				type: 'transport'
			});
			// 把文件URI，从 src 搬到 dest 目录
			var destUri = exports.getRelativeUri(module.uri, destDir);//pth.resolve(conf.dest, pth.relative(conf.src, module.uri));
			if(conf.transportTpl){
				if(buildUtil.is(moduleId,'html') || buildUtil.is(moduleId, 'tpl')){
					destUri += '.js';
				}
				else if(buildUtil.is(moduleId, 'js')){

				}
			}

			// 如果 -H 模式为 3，则 入口模块 都添加这个 Handlebars 补丁
			if(args.HandlebarsMode == 3 && isPackageModule(moduleId)){
				destContent = getHandlebarPrecompilePache(true) + '\n' + destContent;
			}

			module.destUri = destUri;
			buildUtil.writeFile(destUri, destContent);
		}
	}
	// 增加了 destUri 字段
	exports.writeMapFile();
};

function getAllDeps(moduleId, allDeps){

	// 对于远程模块不予理会
	if(moduleId.indexOf('http://') == 0) {
		console.log('[REMOTE MODULE] [DEPENDENCY FIRST DEAL] ' + moduleId);
		return;
	}

	var module = resourceManager.getResource(moduleId);
	if(!module){
		vacation.log.error('can not find module: ' + moduleId);
	}
	var deps = module.deps;
	if(!deps){
		console.log(module);
		process.exit(0);
	}
	deps.forEach(function(depId){
		if(allDeps.indexOf(depId)<0){
			allDeps.push(depId);
			getAllDeps(depId, allDeps)
		}
	});
}

function getHandlebarPrecompilePache (optimize) {
	var content = buildUtil.readFile(pth.resolve(__dirname, './tpl_hb_precompile.txt'));
	if(optimize){
		content = getUglifiedContent(content, {
			fromString: true,
			mangle: true,
			compress: true
		});
	}
	return content;
}

/*
* @param {Boolean} isOptimize
* @param {Boolean} isCssInline
* @param {Boolean} isWriteMap
* @param {Number} HandlebarsMode
* @param {Boolean} isTplonly only use tpl(.tpl|.html) even if transported tpl(.tpl.js|.html.js) exists too.
*/
exports.concatByPackage = function(args){
	resourceManager.dealPkgInfo();
	var conf = getBuildConfig();
	var allResources = resourceManager.getResource();
	var pkg = conf.pkg;
	if(!pkg){
		vacation.log.error('[427] no pkg specified.');
	}
	pkg.forEach(function(pkgTarget){
		var pkgModule = pkgTarget.module;

		if(pkgModule.id.trim().indexOf('http://') == 0){
			console.log('package module['+pkgModule.id+'] is a remove module. ignored.');
			return;
		}

		// 只处理 JS 文件
		if(!buildUtil.is(pkgModule.id, 'js')) {
			console.log('pkg('+pkgModule.id+') is not a js file, so will not concat this.');
			return;
		}
		var filename = pth.basename(pkgModule.uri);
		var filenameNoExt = filename.substr(0, filename.length - pth.extname(pkgModule.uri).length);
		var allDeps = [];

		getAllDeps(pkgModule.id, allDeps);

		// p0
		var pkgName = 'p' + resourceManager.getPkgLen();
		var pkgHas = [];

		var fileContent = '';
		var isLoadedSeajsStyle = false;
		allDeps.forEach(function(depId){
			var originDepId;
			var module = resourceManager.getResource(depId);

			if(depId.trim().indexOf('http://') == 0){
				console.log('[REMOTE MODULE] [DEPENDENCY IN CONCAT] ' + depId);
				return;
			}

			if(!module){
				vacation.log.error('dep module['+depId+'] not found');
			}

			var hasThisDep = true;
			if(buildUtil.is(depId, 'css')){
				var depFullPath = module.uri;//pth.resolve(conf.src, depId);
				if(args.isCssInline){
					if(!isLoadedSeajsStyle){
						isLoadedSeajsStyle = true;
						var seajsTextContent = getUglifiedContent(pth.resolve(__dirname,'../seajs-style.js'));
						fileContent += ';'+seajsTextContent+'\n';
					}
					var cssContent = buildUtil.readFile(depFullPath);
					if(args.isOptimize){
						cssContent = cssContent.replace(/\t/g,' ')
												.replace(/\s+/g,' ')
												.replace(/\r|\n/g,'')
												.replace(/('|")/g,'\\$1');
					}
					fileContent += ';seajs.importStyle("'+cssContent+'")\n';
				} else {
					hasThisDep = false;
					console.log('[CSS NOT CONCAT]: ' + depFullPath);
				}
			} 
			//else if(depId.trim().indexOf('http://') !== 0){
			else{
				var isTransportedTpl = depId.match(/(.*\.(?:html|tpl))\.js/);
				if(args.isTplonly && isTransportedTpl && allResources[isTransportedTpl[1]]){
					originDepId = depId;
					// 去掉 ".js"
					depId = isTransportedTpl[1];
					//console.log('========' + originDepId+'================='+depId)
				}
				var jsContent = ';'+getTransportedContent(depId, {
					// 即便查找的模块换成 .html 了，但是 ID 还是要写 .html.js 的
					idWriteOnModule: originDepId,
					// 要删除对CSS的依赖，因为无论 是否 isCssInline
					// 在线上都不要发起对 CSS 的依赖请求
					delCssInDep:true,
					convertDependency_tpl_2_js: true,
					isOptimize: args.isOptimize,
					HandlebarsMode: args.HandlebarsMode,
					type: 'concat:dep'
				})+'\n'; //readFile(filePath)+';\n';
				fileContent += jsContent;
			}
			if(hasThisDep){
				module.pkg = pkgName;
				pkgHas.push(depId);
			}
		});

		var destFileRule = pkgTarget.rule;
		var destfilename = destFileRule.replace('$1',filenameNoExt).replace('$2', pkgName);
		// 把 pkg 的名字替换为 dest，以便得出ID
		var destPathInSrc = pth.resolve(pth.dirname(pkgModule.uri), destfilename);
		var destId = getModuleInfoFromURI(destPathInSrc).id;
		var destpath = exports.getRelativeUri(destPathInSrc);

		resourceManager.setPkg(pkgName, {
			uri:destpath,
			has: pkgHas
		});

		// 最终输出的打包文件要更换ID
		var mainFileContent = getTransportedContent(pkgModule.id, {
			delCssInDep:true,
			idWriteOnModule: destId,//getModuleId(destpath, pth.resolve(conf.dest)),
			convertDependency_tpl_2_js: true,
			isOptimize: args.isOptimize,
			HandlebarsMode: args.HandlebarsMode,
			type:'concat:package'
		});
		fileContent += ';'+mainFileContent;

		if(args.HandlebarsMode == 3){
			fileContent = getHandlebarPrecompilePache(true) + '\n' + fileContent;
		}

		buildUtil.writeFile(destpath, fileContent);
		if(args.isWriteMap) exports.writeMapFile();
	});
}






////////////////////////////
////////////////////////////
/*
* @param {Object} res resourc
* @param {Object} args arguments on TPLBuild()
*/
function _tpl_transport(res, args){
	var originContent = buildUtil.readFile(res.uri);
	try{
		var destContent = exports.transportTemplate({
			content: originContent,
			moduleId: res.id + '.js',
			transport: true,
			optimize: args.isOptimize,
			removeComments: args.isOptimize
		});

		buildUtil.writeFile(res.uri + '.js', destContent);
		console.log('[TRANSPORT] template('+res.id+') transported.');
	}
	catch(e){
		vacation.log.error('build ['+res.uri+'] failed, message: ' + e.message);
	}
}
/*
* @param {Boolean} isOptimize
* @param {Boolean} isWatch
*/
exports.TPLBuild = function (args) {
	var allResources = resourceManager.getResource(),
		allResArr = buildUtil.values(allResources);
	//console.log(Object.keys(allResources));
	//console.log(allResArr.map(function(res){return res.uri}));
	allResArr.forEach(function(res, i){
		if(res.uri.match(/\.(html|tpl)$/g)){
			_tpl_transport(res, args);
		}
	});
	
	if(args.isWatch){
		var conf = getBuildConfig();
		var watch = require('node-watch');
		
		watch(conf.src, function(filename){
			//console.log(filename);
			if(filename.match(/\.(tpl|html)$/g)){
				var res = allResArr.filter(function(res){
					return res.uri == filename;
				});
				if(res.length){
					res = res[0];
					_tpl_transport(res, args);
				}
			}
		});
	}
}
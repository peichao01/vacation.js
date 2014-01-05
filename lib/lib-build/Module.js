var pth = require('path');
var fs = require('fs');
var buildUtil = require('./util');

var _mid = 0;

var canNew = false;

var moduleCaches = {},
	uriCaches = {};

function getMid(){
	return 'module-' + _mid++;
}

// 模板模块的 uri 结尾没有 .js

/**
 *
 * @param {String} uri
 * @param {Boolean} isMain
 * @param {Module} requiredBy
 * @constructor
 */
function Module(opt){
	this.uri = opt.uri;
	// isMain 和 requiredBy 是互斥的
	this.isMain = opt.isMain;
	this.requiredBy = [];
	this.addRequiredBy(opt.requiredBy);

	if(this.uri.indexOf('http://') == 0){
		this.isRemote = true;
		return;
	}

	this._check();
	this.mid = getMid();
	this.baseInfo().dealDependency().deepDependencies();//.transport();
}

Module.prototype.setPackage = function(package){
	this.package = package;
	return this;
};

Module.prototype.addRequiredBy = function(mod){
	if(mod) this.requiredBy.push(mod);
	return this;
};

Module.prototype._check = function(){
	if(!canNew) vacation.log.error('you should use Module.get to initialize a Module.');

	var tpl;
	if(tpl = this.uri.match(buildUtil.IS_TPL)){
		this.isTpl = true;
		// uri 需要去除 .js 结尾
		if(tpl[2]){
			this.uri = this.uri.substr(0, this.uri.length - 3);
		}
	}

	// uri 被缓存，但模块没有被缓存，一定是循环引用了
	if(uriCaches[this.uri]) vacation.log.error('circle dependencies.');
	uriCaches[this.uri] = true;

	// 检查依赖文件是否存在
	var depIsExists = fs.existsSync(this.uri);
	if(!depIsExists) {
		vacation.log.error('[425-1] module('+this.id+') deps on ('+this.uri+'), but this file is not exists.');
	}
	return this;
};

Module.prototype.baseInfo = function(){
	var uri = this.uri;
	var conf = buildUtil.getBuildConfig();
	// 顶级标识都必须相对于 base 路径来解析
	var relative = pth.relative(conf.base, uri);
	var moduleId, idType;

	var matched = [];
	// real_alias_rootPathed 已经将 alias、paths 基于 configFileDir 转为根路径
	buildUtil.each(conf.real_alias_rootPathed, function(aliasRootPath, key){
		if(pth.relative(aliasRootPath, uri).indexOf('.') !== 0)
			matched.push([key, aliasRootPath]);
	});
	// 此模块有设置 alias 或 pahts
	if(matched.length > 0){
		// 按 aliasRootPath 的长度排序，越长越靠前。
		matched.sort(function(a,b){
			return a[1].length - b[1].length < 0;
		});
		// resolve 返回的结果(matched[0][1])，是已经去除掉最后一个'/'字符的
		moduleId = uri.replace(matched[0][1], matched[0][0]);
		idType = 'real_alias';
	}
	// 此模块ID 可以使用顶级标识
	if(relative.indexOf('.') !== 0){
		// 如果已经有 alias、paths ID，可以使用多个ID，则使用短的
		if(!moduleId || moduleId.length >= relative.length){
			moduleId = relative;
			idType = 'top';
		}
	}
	// 如果只能使用相对路径做标识ID，则报错
	if(!moduleId){
		console.log('\n [HELP INFO] paths and alias is parsed to: ' + JSON.stringify(conf.real_alias_rootPathed, null, 4));
		var info = this.isMain ? 'is main module' : ('required by "'+this.requiredBy[0].uri+'"');
		vacation.log.error('[423] module(uri:'+uri+')('+info+') not in the base directory('+conf.base+'), and no paths or alias relative to its path.');
	}


	this.distUri = pth.resolve(conf.dist, pth.relative(conf.src, this.uri));
	// linux 风格路径
	this.uri_nux = buildUtil.normalize_win_dir(this.uri);
	this.id = buildUtil.normalize_win_dir(moduleId);
	this.distId = this.isTpl ? (this.id + '.js') : this.id;
	this.idType = idType;
	this.type = uri.substr(uri.lastIndexOf('.') + 1).toLowerCase();
	this.filename = pth.basename(uri, '.' + this.type);
	this.inBase = relative.indexOf('.') !== 0;
	this.inSrc = pth.relative(conf.src, uri).indexOf('.')!==0;
	return this;
};

Module.prototype.updateContent = function(){
	this.originContent = buildUtil.readFile(this.uri);
	return this;
};

Module.prototype.dealDependency = function(){
	var conf = buildUtil.getBuildConfig();
	var moduleContent = this.updateContent().originContent;

	var deps = [];
	if(this.type == 'js'){
		// 删除注释和多余的空白等
		var uglifiedContent = buildUtil.getUglifiedContent(moduleContent, {
			fromString: true,
			mangle: false,
			compress: false
		}, this.uri);
		// 最标准的 CMD 模块
		if(uglifiedContent.match(/^define\(/g)){
			this.cmd = 0;
		}
		// 非 CMD 模块
		else if(!uglifiedContent.match(/\bdefine\(/g)){
			this.cmd = -1;
		}
		// 有 define(， 但是不在顶部，可能是兼容amd 或 cmd 或其他情况
		else{
			this.cmd = 1;
		}

		// 非 CMD 标准模块不能依赖其他模块，只能被其他模块所依赖
		if(this.cmd === 0){
			// => ["require("a")", "require("b")"]
			var requireMatched = uglifiedContent.match(/\brequire\((['"]).+?\1\)/g);
			if(requireMatched){
				requireMatched.forEach(function (match) {
					var useAlias;
					// => ['"b")', '"', 'b']
					var depModuleFile = match.match(/(['"])(.*)\1\)/)[2];
					var aliasedPath = buildUtil.get_real_path_by_alias(depModuleFile, conf.real_alias);
					if(depModuleFile != aliasedPath){
						useAlias = true;
					}
					depModuleFile = buildUtil.addExtraNameToFile(aliasedPath);

					// 依赖文件的
					var depModuleRelativeTo;
					// 相对路径
					if(depModuleFile.indexOf('.') == 0){
						// 相对于 conf.base 目录
						if(useAlias){
							// seajs.config 中 alias 和 paths 是相对于 base 路径的
							// 所以 vacation.js 也调整为相对于 base 路径
							depModuleRelativeTo = conf.base;
						}
						// 相对路径：相对于当前模块
						else{
							depModuleRelativeTo = pth.dirname(this.uri);
						}
					}
					// 根路径：相对于 conf.www 目录
					else if(depModuleFile.indexOf('/') == 0){
						depModuleRelativeTo = conf.www;
						if(!conf.www) vacation.log.error('[424] module('+moduleInfo.uri+') require('+depModuleFile+') but the www directory is not config.');
					}
					// 顶级标识：相对于 base 基础路几个呢
					else {
						depModuleRelativeTo = conf.base;
					}

					if(depModuleFile.indexOf('http://') == 0){
						var depModule = Module.get({uri:depModuleFile});
						deps.push(depModule);
					}
					else{
						var depModuleURI = pth.resolve(depModuleRelativeTo, depModuleFile);
						var depModule = Module.get({
							uri:depModuleURI,
							requiredBy: this
						});
						deps.push(depModule);
					}
				}.bind(this));
			}
		}
	}
	this.deps = deps;
	return this;
};

function deepDependency(_module, alldeps){
	_module.deps.forEach(function(depModule){
		depModule.alldeps.forEach(function(mod){
			if(alldeps.indexOf(mod) < 0) alldeps.push(mod);
		});
		if(alldeps.indexOf(depModule) < 0) alldeps.push(depModule);
	});
	return alldeps;
}

Module.prototype.deepDependencies = function(){
	this.alldeps = deepDependency(this, []);
	return this;
};

var REG_REQUIRE_TPL = new RegExp("\\brequire\\(\\s*('|\")(.+?\\.(?:"+buildUtil.TPL_TYPE.join('|')+"))\\1\\s*\\)","g");// /\brequire\(\s*('|")(.+?\.(?:html|tpl))\1\s*\)/g
var REG_SIMPLE_DEFINE = /(define\()[^\(]*(function\s*\()/g;
/*
* @param {Boolean} [optimize]
* @param {Number} [Handlebars = 0]
* */
Module.prototype.transport = function(){
	var opt = buildUtil.getOptions();
	var content = this.originContent;
	var distId = this.isMain ? this.package.distId : this.distId;
	if(this.isTpl){
		content = buildUtil.htmlMinify(content, {
			removeComments:opt.optimize,
			removeHandlebarsComments:opt.optimize,
			collapseWhitespace: opt.optimize
		});
		if(opt.Handlebars >= 2){
			var compiledTplFn = buildUtil.precompileHandlebars(content, this.id);
			content = 'define("'+distId+'",[],function(require,exports,module){'
					+ 		'var fn = Handlebars.template('+compiledTplFn+');'
					+		'fn.___vacationPrecompiled = true;'
					+		'module.exports = fn;'
					+ '});';
		}
		else{
			content = 'define("'+distId+'",[],"'+buildUtil.content2StandardString(content)+'")';
		}
	}
	// 对于源码里面的 对CSS文件的require不必理会，因为 seajs 发现require的模块如果是CSS，
	// 即便没有factory函数，没有exports值也没关系
	// [seajs源码]： if (exports === null && !IS_CSS_RE.test(uri)) { emit("error", mod) }
	else if(this.type == 'css'){
		if(opt.cssinline){
			if(opt.optimize) content = buildUtil.cssMinify(this.originContent);
			content = 'seajs.importStyle("'+buildUtil.content2StandardString(content)+'");';
		}
		else content = '';
	}
	else if(this.type == 'js'){
		if(this.cmd == 0){
			//将模块中对 模版的依赖 改为对 transport后的模板的依赖
			content = content.replace(REG_REQUIRE_TPL, "require($1$2.js$1)");
			content = content.replace(REG_SIMPLE_DEFINE, function(match, $1, $2){
				var depsArr = this.deps;
				// 如果 inline CSS，就删除对CSS的依赖，因为写在依赖中就会发起额外的请求
				// 如果不 inline CSS，也删除对CSS的依赖，因为CSS（很可能）是被单独部署的，已经被加载到页面上了
				depsArr = depsArr.filter(function(mod){ return mod.type != 'css' });
				// 将 模版依赖 改为对 transport后模版的依赖
				depsArr = buildUtil.unique(depsArr.map(function(mod){
					// 只要不是主包，都改为对包名的依赖，重复也无所谓，模块依赖自身的包也无所谓
					return mod.package.isMain ? mod.distId : mod.package.getDistId(this.distUri);
				}.bind(this)));

				return $1 + '"'+distId+'",'+JSON.stringify(depsArr)+','+$2;
			}.bind(this));
		}
		else if(this.cmd === -1){
			content = 'define("'+distId+'",[],function(){'+content+'});';
		}
	}
	// 已经是JS 的内容可以进行压缩优化
	if(opt.optimize && (this.type == 'js' || this.isTpl)){
		var conf = buildUtil.getBuildConfig();
		content = buildUtil.getUglifiedContent(content, {
			fromString: true,
			mangle: conf.uglify && conf.uglify.mangle || true,
			compress: true
		}, this.distId);
	}
	this.transportedContent = content;
	return this;
};

/**
 * @param {String} uri
 * @param {Boolean} isMain
 * @param {Module} requiredBy
 */
Module.get = function(opt){
	canNew = true;
	if(!buildUtil.isURIAvailable(opt.uri)) vacation.log.error('uri('+opt.uri+') is ignored.');
	var _module;
	if(_module = moduleCaches[opt.uri]){
		// 已经缓存了，但可以更新 被谁依赖了
		if(opt.requiredBy) _module.addRequiredBy(opt.requiredBy);
	}
	else{
		_module = moduleCaches[opt.uri] = new Module(opt);
	}
	canNew = false;
	return _module;
};

module.exports = Module;
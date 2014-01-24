var pth = require('path');
var inherit = require('../inherit');
var buildUtil = require('./util');
var underscore = require('underscore');

var canNew = false;

var caches = {};
var _pid = 0;
function getPid(){
	return 'package-' + _pid++;
}

var BaseBag = inherit({
	/**
	 * @param {String} uri
	 * @param {Number} pkgIndex
	 * @param {Array} [includeModules<Module>]
	 * @constructor
	 */
	__constructor: function(opt){
		this._check(opt);
		var pkgConf = buildUtil.getBuildConfig(opt.pkgIndex);
		this.options = opt;
		this.config = pkgConf;//opt.config;
		this.moduleType = pkgConf.type;//opt.moduleType;
		this.pkgIndex = opt.pkgIndex;
		this.pid = getPid();
	},
	_check: function(opt){
		if(!canNew) vacation.log.error('you should use Package.get to initialize a Package.');
		return this;
	},
	contain: function(_mod){
		return this.contains.some(function(mod){
			return mod == _mod;
		});
	},
	_distRuleReplace: function(rule, pkgConf){
		if(rule.indexOf('$file')>=0) rule = rule.replace('$file', this.mainModule && this.mainModule.filename || '$file');
		if(rule.indexOf('$all')>=0) rule = rule.replace('$all', this.contains.map(function(mod){return mod.filename}).join('_'));
		// 无论是主包、子包，都是用 入口模块的 dir
		if(rule.indexOf('$dir')>=0) rule = rule.replace('$dir', pth.relative(pkgConf.src, pth.dirname((this.isMain ? this : this.parent).mainModule.uri)));
		return rule;
	},
	genDistFilename: function(){
		var pkgConf = buildUtil.getBuildConfig(this.pkgIndex);
		var rule = this.config.dist_rule;
		if(rule.indexOf('$pkg')>=0) rule = rule.replace('$pkg',this.pid);
		rule = this._distRuleReplace(rule, pkgConf);
		var fullpath = pth.resolve(pkgConf.dist, rule);
		if(pth.relative(pkgConf.dist, fullpath).indexOf('.') == 0){
			var msg = 'package dist dir('+fullpath+') is not in the dist directory('+pkgConf.dist+')';
			// 主包必须发布到 dist 目录内
			if(this.isMain){
				vacation.log.error(msg);
			}
			// 子包可以发布到任意目录
			else{
				vacation.log.notice(msg);
			}
		}
		this.distFilename = fullpath;
		return this;
	},
	genDistId: function(){
		var pkgConf = buildUtil.getBuildConfig(this.pkgIndex);
		var distId = pth.relative(pkgConf.distBase, this.distFilename);
		// 如果文件在 dist base 目录内
		// 则可以生成固定 ID（顶级标识）
		if(distId.indexOf('.') !== 0){
			this.distId = buildUtil.normalize_dist_id(distId);
		}
		// 主包一定要在 base 目录下，使用【顶级标识】，因为被打包后的 入口模块 要使用主包的 ID
		else if(this.isMain){
			vacation.log.error('main package('+this.distFilename+') is not dist in the dist base dir('+pkgConf.distBase+')');
		}
		return this;
	},
	/**
	 * 因为包（虚拟模块）只会被写在依赖数组中（此处的【相对标识】相对于模块自身来解析），
	 * 而不会被作为 ID 来被写上
	 * 所以可以使用【相对标识】
	 *
	 * 相对于具体的 uri 来产生相对路径的 distId
	 *
	 * @param {String} fileFullPath
 	 */
	getDistId: function(fileFullPath){
		if(this.distId) return this.distId;
		var relativeDistId = pth.relative(pth.dirname(fileFullPath), this.distFilename);
		return buildUtil.normalize_dist_id(relativeDistId);
	},
	dealModules: function(){
		//this.contains.concat(this.exceptedModules || []).forEach(function(mod){
		this.mainModule.alldeps.concat(this.mainModule).forEach(function(mod){
			mod.setPackage(this);
		}.bind(this));
		return this;
	},
	genDistContent: function(){
		var additionalMods = [];

		// banner
		var pkgConf = buildUtil.getBuildConfig(this.pkgIndex);
		if(pkgConf.uglify && pkgConf.uglify.banner){
			this.banner = buildUtil.dealBanner(pkgConf.uglify.banner);
		}
		else{
			this.banner = '';
		}

		// 主包要先添加额外的信息
		if(this.isMain){
			var options = buildUtil.getOptions();
			if(options.Handlebars == 3 && this.hasTypeModule('tpl', true)){
				additionalMods.push(buildUtil.readFile(pth.resolve(__dirname, './tpl_hb_precompile.min.js')));
			}
			if(options.underscore == 3 && this.hasTypeModule('tpl', true)){
				additionalMods.push(buildUtil.readFile(pth.resolve(__dirname, './tpl_underscore_precompile.min.js')));
			}
			if(options.cssinline && this.hasTypeModule('css', true)){
				var styleLoader = underscore.template(buildUtil.readFile(pth.resolve(__dirname, '../style-loader.js')));
				additionalMods.push(styleLoader({moduleType: this.moduleType}));
			}
		}

		var includesContent = [];
		if(this.options.includeModules){
			this._dealIncludeModules(this.options.includeModules);
			includesContent = this._getModsTransportedContent(this.includes, []);
		}
		var distContent = this._getModsTransportedContent(this.contains, []);
		this.distContent = this._getDistContentString(additionalMods, includesContent, distContent);
		//this.originContent = originContent.join('');
		return this;
	},
	_getDistContentString: function(additionalContent, includesContent, distContent){
		var str = '', spliter = ';\n';
		var pkgConf = buildUtil.getBuildConfig(this.pkgIndex);

		if(additionalContent.length) str  += additionalContent.join(spliter) + spliter;
		if(includesContent.length){
			if(pkgConf.includePosition == 'bottom'){
				str += distContent.join(spliter) + spliter + includesContent.join(spliter);
			}
			// top
			else{
				str += includesContent.join(spliter) + spliter + distContent.join(spliter);
			}
		}
		else{
			str += distContent.join(spliter);
		}
		return str;
	},
	_getModsTransportedContent: function(mods, container){
		var distContent = container;
		mods.forEach(function(mod){
			var _content = mod.transport().transportedContent;
			if(_content) {
				distContent.push(_content);
				//originContent.push(mod.originContent + spliter);
			}
		});
		return distContent;
	},
	_dealIncludeModules: function(includeModules){
		var pkgConf = buildUtil.getBuildConfig(this.pkgIndex);

		// 所有的 include 进来的模块以及依赖模块
		var includesWithAllDepMods = [];
		includeModules.forEach(function(module){
			module.alldeps.concat(module).forEach(function(mod){
				if(includesWithAllDepMods.indexOf(mod) == -1) includesWithAllDepMods.push(mod);
			}.bind(this));
		}.bind(this));

		// 因为 requirejs 的模块必须按照模块依赖的顺序排列才行，seajs不介意
		// 如果 includes 在 下面，则去除 contains 中已经包含的模块
		if(pkgConf.includePosition == 'bottom'){
			var includes = [];
			includesWithAllDepMods.forEach(function(mod){
				if(this.contains.indexOf(mod) == -1) includes.push(mod);
			}.bind(this));
			this.includes = includes;
		}
		// top
		// 如果 includes 在上面，则从 contains 中去除 includes 已经包含的模块
		else{
			var contains = [];
			this.contains.forEach(function(mod){
				if(includesWithAllDepMods.indexOf(mod) == -1) contains.push(mod);
			});
			this.contains = contains;
			this.includes = includesWithAllDepMods;
		}
		return this;
	},
	/**
	 *
	 * @param type "tpl" means all template types
	 * @param inAllModules
	 * @returns {*}
	 */
	hasTypeModule: function(type, inAllModules){
		if(type == 'js') return true;
		var mods;
		if(!inAllModules || this.isDir){
			mods = this.contains;
		}
		else{
			mods = (this.isMain ? this : this.parent).mainModule.alldeps;
		}
		return mods.some(function(mod){
			return type == 'tpl' ? mod.isTpl : (mod.type == type);
		});
	},
	get_distContent_md5: function(length){
		if(this.distContent){
			return buildUtil.md5(this.distContent, length);
		}
		return false;
	},
	writeFile: function(){
		vacation.cli.emitter.emit('bag-before-write', this);
		//this.distUri = pth.resolve(this.distDirname, this.distFilename);
		var options = buildUtil.getOptions();
		if(options.log.concat) this.contains.forEach(function(mod){
			console.log('[CONCAT] '+ mod.distId);
		});
		//var result =
		buildUtil.writeFile(this.distFilename, this.banner + this.distContent, function(success, uri){
			if(!success) buildUtil.logWriteFailed([uri]);
			vacation.cli.emitter.emit('bag-after-write', this);
		});
//		if(result === false && options.log.write_failed){
//			vacation.log.notice('write dist pkg ['+this.distFilename+'] failed.');
//		}
		//vacation.cli.emitter.emit('bag-after-write', this);
		return this;
	}
},{
	get: function (opt){
		canNew = true;
		var package = caches[opt.uri] || (caches[opt.uri] = new this.prototype.__self(opt));//new Klass(opt));
		canNew = false;
		return package;
	}
});

module.exports = BaseBag;

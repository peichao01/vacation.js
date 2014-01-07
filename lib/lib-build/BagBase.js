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
	 * @param {String} moduleType
	 * @param {Object} config
	 * @private
	 */
	__constructor: function(opt){
		this._check(opt);
		this.moduleType = opt.moduleType;
		this.config = opt.config;
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
	_distRuleReplace: function(rule, conf){
		if(rule.indexOf('$file')>=0) rule = rule.replace('$file', this.mainModule && this.mainModule.filename || '$file');
		if(rule.indexOf('$all')>=0) rule = rule.replace('$all', this.contains.map(function(mod){return mod.filename}).join('_'));
		// 无论是主包、子包，都是用 入口模块的 dir
		if(rule.indexOf('$dir')>=0) rule = rule.replace('$dir', pth.relative(conf.src, pth.dirname((this.isMain ? this : this.parent).mainModule.uri)));
		return rule;
	},
	genDistFilename: function(){
		var conf = buildUtil.getBuildConfig();
		var rule = this.config.dist_rule;
		if(rule.indexOf('$pkg')>=0) rule = rule.replace('$pkg',this.pid);
		rule = this._distRuleReplace(rule, conf);
		var fullpath = pth.resolve(conf.dist, rule);
		if(pth.relative(conf.dist, fullpath).indexOf('.') == 0){
			var msg = 'package dist dir('+fullpath+') is not in the dist directory('+conf.dist+')';
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
		var conf = buildUtil.getBuildConfig();
		var distId = pth.relative(conf.distBase, this.distFilename);
		// 如果文件在 dist base 目录内
		// 则可以生成固定 ID（顶级标识）
		if(distId.indexOf('.') !== 0){
			this.distId = buildUtil.normalize_dist_id(distId);
		}
		// 主包一定要在 base 目录下，使用【顶级标识】，因为被打包后的 入口模块 要使用主包的 ID
		else if(this.isMain){
			vacation.log.error('main package('+this.distFilename+') is not dist in the dist base dir('+conf.distBase+')');
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
		this.contains.concat(this.exceptedModules || []).forEach(function(mod){
			mod.setPackage(this);
		}.bind(this));
		return this;
	},
	genDistContent: function(){
		var distContent = [], spliter = ';\n';

		// banner
		var conf = buildUtil.getBuildConfig();
		if(conf.uglify && conf.uglify.banner){
			distContent.push(buildUtil.dealBanner(conf.uglify.banner));
		}

		// 主包要先添加额外的信息
		if(this.isMain){
			var options = buildUtil.getOptions();
			if(options.Handlebars == 3 && this.hasTypeModule('tpl', true)){
				distContent.push(buildUtil.readFile(pth.resolve(__dirname, './tpl_hb_precompile.min.js')) + spliter);
			}
			if(options.underscore == 3 && this.hasTypeModule('tpl', true)){
				distContent.push(buildUtil.readFile(pth.resolve(__dirname, './tpl_underscore_precompile.min.js')) + spliter);
			}
			if(options.cssinline && this.hasTypeModule('css', true)){
				var styleLoader = underscore.template(buildUtil.readFile(pth.resolve(__dirname, '../style-loader.js')));
				distContent.push(styleLoader({moduleType: this.moduleType}) + spliter);
			}
		}

		this.contains.forEach(function(mod){
			var _content = mod.transport().transportedContent;
			if(_content) distContent.push(_content + spliter);
		});
		this.distContent = distContent.join('');
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
	writeFile: function(){
		//this.distUri = pth.resolve(this.distDirname, this.distFilename);
		var options = buildUtil.getOptions();
		if(options.log.concat) this.contains.forEach(function(mod){
			console.log('[CONCAT] '+ mod.distId);
		});
		buildUtil.writeFile(this.distFilename, this.distContent);
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

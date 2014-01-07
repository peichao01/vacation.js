var inherit = require('../inherit');

var Module = require('./Module');
var buildUtil = require('./util');

var REG_REQUIRE =/\brequire\((['"]).+?\1\)/g;
var REG_REQUIRE_STR = /(['"])(.*)\1\)/;
// 最标准的 CMD 模块
var REG_IS_CMD_0 = /^define\s*\(/;
// 非 CMD 模块
var REG_IS_CMD_N1 = /\bdefine\s*\(/;

var REG_REQUIRE_TPL = new RegExp("\\brequire\\(\\s*('|\")(.+?\\.(?:"+buildUtil.TPL_TYPE.join('|')+"))\\1\\s*\\)","g");// /\brequire\(\s*('|")(.+?\.(?:html|tpl))\1\s*\)/g
var REG_SIMPLE_DEFINE = /(define\s*\()[^\(]*(function\s*\()/g;

var ModuleSea = inherit(Module, {
	__constructor: function(opt){
		this.moduleType = 'seajs';
		this.__base(opt);
	},
	_getCmd: function(contentNoComments){
		if(contentNoComments.match(REG_IS_CMD_0)) return 0;
		if(contentNoComments.match(REG_IS_CMD_N1)) return -1;
		return 1;
	},
	_getDependenciesIdFromContent: function(contentNoComments){
		// => ["require("a")", "require("b")"]
		var requireMatched = contentNoComments.match(REG_REQUIRE);
		if(requireMatched){
			return requireMatched.map(function(require){
				// => ['"b")', '"', 'b']
				return require.match(REG_REQUIRE_STR)[2].trim();
			});
		}
		return [];
	},
	_getStandardJSModuleContent: function(content, distId){
		// [seajs only] 将模块中对 模版的依赖 改为对 transport后的模板的依赖
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
		return content;
	}
});

module.exports = ModuleSea;

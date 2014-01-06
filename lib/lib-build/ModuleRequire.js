var inherit = require('../inherit');

var Module = require('./Module');

var REG_DEP_ARR = /\b(?:define|require)\s*\(\s*\[([^\]]+)\]\s*,\s*function\s*\(/;
var REG_MODULE_ID = /('|")([^\1]+)\1/;
var REG_IS_DEFINE = /^define\s*\(/;
var REG_IS_REQUIRE = /^require\s*\(/;
// 最标准的 AMD 模块
var REG_IS_AMD_0 = /^(define|require)\s*\(/;
// 非 AMD 模块
var REG_IS_AMD_N1 = /^(define|require)\s*\(/;

var DEFINE_TYPE = {
	DEFINE: 'define',
	REQUIRE: 'require'
};

var ModuleRequire = inherit(Module, {
	__constructor: function(opt){
		this.moduleType = 'requirejs';
		this.__base(opt);
	},
	isModuleDefined: function(){
		return this.defineType === DEFINE_TYPE.DEFINE;
	},
	_getCmd: function(contentNoComments){
		if(contentNoComments.match(REG_IS_AMD_0)) return 0;
		if(contentNoComments.match(REG_IS_AMD_N1)) return -1;
		return 1;
	},
	_getDependenciesIdFromContent: function(contentNoComments){
		// 是 define([], fn) 一个模块还是  require([], fn)
		if(contentNoComments.match(REG_IS_DEFINE)){
			this.defineType = DEFINE_TYPE.DEFINE;
		}
		else if(contentNoComments.match(REG_IS_REQUIRE)){
			this.defineType = DEFINE_TYPE.REQUIRE;
		}
		// => ["define(["a/bcc",'a/cdd'],function", ""a/bcc",'a/cdd'"]
		var depArr = contentNoComments.match(REG_DEP_ARR);
		if(depArr){
			// => [""a/bcc"", "'a/cdd'"]
			return depArr[1].split(',').map(function(modId){
				// => [""a/bcc"", """, "a/bcc"]
				return modId.match(REG_MODULE_ID)[2].trim();
			});
		}
		return [];
	},
	_getStandardJSModuleContent: function(content){
		if(this.isModuleDefined()){
			content = content.replace(/(\bdefine\s*\()\s*(\[|function\()/, function(match, $1, $2){
				//var depsArr = this.deps;
				return $1 + '"'+this.distId+'",'+$2;
			}.bind(this));
		}
		else{
			content = 'define("'+this.distId+'",function(){});' + content;
		}
		return content;
	}
}, {
	DEFINE_TYPE: DEFINE_TYPE
});

module.exports = ModuleRequire;
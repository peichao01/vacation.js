var inherit = require('../inherit');

var Module = require('./Module');

var REG_DEP_ARR = /\bdefine\s*\(\s*\[([^\]]+)\]\s*,\s*function\s*\(/;
var REG_MODULE_ID = /('|")([^\1]+)\1/;

var ModuleRequire = inherit(Module, {
	/*__constructor: function(opt){
		this.__base(opt);
	},*/
	_getDependenciesIdFromContent: function(contentNoComments){
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
	}
});

module.exports = ModuleRequire;
var inherit = require('../inherit');

var Module = require('./Module');

var REG_REQUIRE =/\brequire\((['"]).+?\1\)/g;
var REG_REQUIRE_STR = /(['"])(.*)\1\)/;

var ModuleSea = inherit(Module, {
	/*__constructor: function(opt){
		this.__base(opt);
	},*/
	dealDependency: function(contentNoComments){
		// => ["require("a")", "require("b")"]
		var requireMatched = contentNoComments.match(REG_REQUIRE);
		if(requireMatched){
			return requireMatched.map(function(require){
				// => ['"b")', '"', 'b']
				return require.match(REG_REQUIRE_STR)[2].trim();
			});
		}
		return [];
	}
});

module.exports = ModuleSea;

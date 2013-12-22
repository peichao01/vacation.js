define("Modules/SelectBase.js", ["jquery", "underscore", "lib/inherit.js", "public/EventEmitter.js"], function (require, exports, module) {
	var $ = require("../../../lib/jquery"),
		_ = require("../../../lib/underscore"),
		inherit = require("../../../lib/inherit"),
		EventEmitter = require("../public/EventEmitter");
	var SelectBase = inherit({});

	EventEmitter.mixTo(SelectBase);
	module.exports = SelectBase;
});
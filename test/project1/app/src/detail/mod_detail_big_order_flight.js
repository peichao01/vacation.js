define(function (require, exports, module) {
	var $ = require("../../../lib/jquery"),
		_ = require("../../../lib/underscore"),
		inherit = require("../../../lib/inherit"),
		EventEmitter = require("../public/EventEmitter");
	var Flight = inherit({});
	EventEmitter.mixTo(Flight);

	module.exports = Flight;
});
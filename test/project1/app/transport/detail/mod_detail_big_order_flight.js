define("detail/mod_detail_big_order_flight.js", ["jquery", "underscore", "lib/inherit.js", "public/EventEmitter.js"], function (require, exports, module) {
	var $ = require("../../../lib/jquery"),
		_ = require("../../../lib/underscore"),
		inherit = require("../../../lib/inherit"),
		EventEmitter = require("../public/EventEmitter");
	var Flight = inherit({});
	EventEmitter.mixTo(Flight);

	module.exports = Flight;
});
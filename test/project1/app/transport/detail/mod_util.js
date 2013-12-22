define("detail/mod_util.js", ["underscore", "jquery"], function (require, exports, module) {
	var _ = require('../../../lib/underscore.js');
	var $ = require('jquery');

	var noop = function () {};

	exports.data = {
		get: noop,
		set: noop
	};

	exports.int = noop;

	exports.getMoneyHtml = noop;

	exports.extendDeep = noop;
	exports.getWeekday = noop;

	exports.isSameDay = noop;
	exports.decimal = noop;
	exports.dtdate = noop;
	exports.onResize = noop;
	exports.onScroll = noop;
	exports.onDocClick = noop;
	exports.onDocKeyup = noop;
});
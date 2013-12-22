//团队游详情页，预定订单，酒店部分
define("detail/mod_detail_big_order_other.js", ["jquery", "underscore", "lib/inherit.js", "detail/mod_util.js", "public/EventEmitter.js", "Modules/SelectBase.js", "Interface/IDetailPageOrderComponent.js"], function (require, exports, module) {
	var $ = require("../../../lib/jquery"),
		_ = require("../../../lib/underscore"),
		inherit = require("../../../lib/inherit"),
		util = require('./mod_util'),
		EventEmitter = require("../public/EventEmitter");

	var Selector = require('../Modules/SelectBase');
	var IDetailPageOrderComponent = require('../Interface/IDetailPageOrderComponent');
	var OtherBase = inherit({});
	EventEmitter.mixTo(OtherBase);

	var OtherSingal = inherit(OtherBase, {});
	var OtherOptional = inherit(OtherBase, {});

	exports.OtherSingal = OtherSingal;
	exports.OtherOptional = OtherOptional;

});
define("detail/mod_detail_big_order.js", ["jquery", "underscore", "public/EventEmitter.js", "detail/mod_util.js", "Modules/HotelSelect.js", "detail/mod_detail_big_order_flight.js", "detail/mod_detail_big_order_other.js", "detail/mode_detail_orderbar_fix.js", "http://webresource.xxx.com/path/to/here.js", "detail/mod_detail_dataManager.js", "Modules/SelectBase.js", "lib/inherit.js", "tpl/detail/hotel_room_list.html.js", "tpl/detail/big_order.html.js", "tpl/detail/order_money_contain.html.js"], function (require, exports, module) {
	var $ = require("../../../lib/jquery"),
		_ = require("../../../lib/underscore"),
		EventEmitter = require("../public/EventEmitter"),
		util = require('./mod_util'),
		//helpers = require('./helpers'),
		OrderHotel = require('../Modules/HotelSelect'),
		OrderFlight = require('./mod_detail_big_order_flight'),
		orderOther = require('./mod_detail_big_order_other');

	require('./mode_detail_orderbar_fix');
	require('http://webresource.xxx.com/path/to/here.js');

	var dataManager = require('./mod_detail_dataManager');

	var Selector = require('../Modules/SelectBase');
	var inherit = require("../../../lib/inherit")

	Handlebars.registerPartial("RoomList", require('tpl/detail/hotel_room_list.html.js'));
	var tplOrder = Handlebars.compile(require('tpl/detail/big_order.html.js'));
	var tplMoneyContain = Handlebars.compile(require('tpl/detail/order_money_contain.html.js'));
});
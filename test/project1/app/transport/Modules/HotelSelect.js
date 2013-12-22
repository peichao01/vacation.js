define("Modules/HotelSelect.js", ["jquery", "underscore", "lib/inherit.js", "public/EventEmitter.js", "detail/mod_util.js", "Modules/SelectBase.js", "Interface/IDetailPageOrderComponent.js", "tpl/detail/hotel_room_list.html.js"], function (require, exports, module) {
	var $ = require("../../../lib/jquery"),
		_ = require("../../../lib/underscore"),
		inherit = require("../../../lib/inherit"),
		EventEmitter = require("../public/EventEmitter"),
		util = require('../detail/mod_util');
	var Selector = require('./SelectBase');

	var IDetailPageOrderComponent = require('../Interface/IDetailPageOrderComponent');
	var tplRoomList = Handlebars.compile(require('tpl/detail/hotel_room_list.html.js'));
	var Room = inherit({});
	EventEmitter.mixTo(Room);

	var Hotel = inherit({});
	EventEmitter.mixTo(Hotel);

	module.exports = Hotel;
});
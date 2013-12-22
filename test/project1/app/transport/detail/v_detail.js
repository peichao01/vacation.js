define("detail/v_detail.js", ["jquery", "underscore", "detail/mod_util.js", "detail/mod_detail_big_order.js", "detail/mod_detail_calendar.js", "detail/mod_detail_needknow.js", "detail/v_hotel.js", "detail/v_dp.js", "detail/v_flight.js", "style/v_detail.css", "tpl/Modules/ProductPreviewManager.html.js", "tpl/detail/special_info.html.js", "Modules/ProductPreviewManager.js"], function (require, exports, module) {
	var $ = require("../../../lib/jquery"),
		_ = require('underscore'),
		util = require('./mod_util');

	require('./mod_detail_big_order');
	var calendar = require('./mod_detail_calendar');
	require('./mod_detail_needknow');
	require('./v_hotel');
	require('./v_dp').init();
	require('./v_flight').init();

	require('../style/v_detail.css');
	
	var tplPicPreview = Handlebars.compile(require('tpl/Modules/ProductPreviewManager.html.js'));
	var tplSpecialLabel = Handlebars.compile(require('tpl/detail/special_info.html.js'));
	var ProductPreviewManager = require('../Modules/ProductPreviewManager');

});

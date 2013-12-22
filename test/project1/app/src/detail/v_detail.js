define(function (require, exports, module) {
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

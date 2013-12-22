define("detail/mod_detail_dataManager.js", ["jquery", "underscore", "detail/mod_util.js"], function (require, exports, module) {
	var $ = require('jquery');
	var _ = require('underscore');
	var util = require('./mod_util');

	var noop = function () {};

	var dataManager = {
		setJSON: noop,
		getRresourceData: noop,
		getSingleData: noop,
		getOptionalData: noop,
		setRresourceData: noop,
		setSingleData: noop,
		setOptionalData: noop,
		getChosedResourceRequest: noop,
		_delEmptyInChosedResource: noop,
		delEmptyOptionInChosedResource: noop,
		getChosedSingle: noop,
		setChosedSingle: noop,
		_setOneBaoxianByResourceID: noop,
		setChosedBaoxian: noop,
		getChosedBaoxian: noop,
		getChosedOptional: noop,
		getChosedHotel: noop,
		setChosedHotel: noop,
		getChosedFlight: noop,
		setChosedFlight: noop,
		getSegmentDatasById: noop,
		getSegmentDatasByNumber: noop,
		setHotelData: noop,
		getHotelData: noop,
		getHotelDefaultCompareMoney: noop,
		setFlightData: noop,
		getFlightData: noop,
		getResourceBaoxian: noop,
		dealSingle: noop,
		dealOptional: noop,
		dealFlightInfo: noop,
		dealHotelInfo: noop,
		calendar: {
			bigCalendar: {},
			ajaxError: false,
			loadData: noop,
			availableDate: {},
			init: noop,
			getDateData: noop,
			getAvailableDate: noop,
			getBigCalendar: noop,
			getFirstAvailableDate: noop
		}
	};

	module.exports = dataManager;
});
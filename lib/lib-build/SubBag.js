var inherit = require('../inherit');
var BaseBag = require('./BaseBag');

var SubBag = inherit(BaseBag, {
	/**
	 *
	 * @param {Array[Module]} modules
	 * @param {Object} config
	 * @constructor
	 */
	__constructor: function(opt){
		this.__base(opt);
		this.contains = opt.modules;
		this.dealModules();
	}
});

module.exports = SubBag;
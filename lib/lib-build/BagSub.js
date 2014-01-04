var pth = require('path');
var inherit = require('../inherit');
var BagBase = require('./BagBase');

var BagSub = inherit(BagBase, {
	/**
	 *
	 * @param {Array[Module]} modules
	 * @param {Object} config
	 * @param {Bag} parent
	 * @param {String} distFilename
	 * @constructor
	 */
	__constructor: function(opt){
		this.__base(opt);
		this.parent = opt.parent;
		this.distFilename = opt.distFilename;
		this.contains = opt.modules;

		this.dealModules().genDistFilename().genDistId();
	}/*,
	genDistId: function(){
		// 1. 包是虚拟模块
		// 2. 包的 distId 只会被写在依赖数组中，而这里的相对路径是相对模块自身来计算的
		this.distId = pth.relative(pth.dirname(this.parent.distId), this.distFilename);
		return this;
	}*/
});

module.exports = BagSub;
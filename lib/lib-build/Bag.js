//var fs = require('fs');
var pth = require('path');
var inherit = require('../inherit');
var buildUtil = require('./util');
var BaseBag = require('./BaseBag');
var SubBag = require('./SubBag');
var Module = require('./Module');


var TYPE = {
	FILE: 'file',
	DIR: 'dir'
};

function difference(array, other){
	var r = [];
	array.forEach(function(item){
		if(other.indexOf(item) < 0) r.push(item);
	});
	return r;
}

// package 标识符 在 strict 模式下不能使用
var Bag = inherit(BaseBag, {
	/**
	 *
	 * @param {String} uri
	 * @param {Object} config
	 * @constructor
	 */
	__constructor: function(opt){
		this.__base(opt);
		this.config = opt.config;
		this.mainModule = Module.get({
			uri: opt.uri,
			isMain: true
		});
		this.destId().exceptMods().subBag().dealModules();
	},
	distId: function(){
		var config = this.config;
		var filename = pth.basename(this.mainModule.uri);
		var distId = config.dest_rule.replace('$file', )
	},
	exceptMods: function(){
		this.exceptedModules = [];
		this.config.except.forEach(function(exceptReg){
			this.mainModule.alldeps.forEach(function(mod){
				if(mod.uri_nux.match(exceptReg) && this.exceptedModules.indexOf(mod) < 0) this.exceptedModules.push(mod);
			}.bind(this));
		}.bind(this));

		this.contains = difference(this.mainModule.alldeps, this.exceptedModules);
		return this;
	},
	subBag: function(){
		var config = this.config;
		var modules = this.contains;
		this.subbags = [];
		config.sub && config.sub.forEach(function(sub){
			sub.contain.forEach(function(subReg){
				var mods = [];
				modules.forEach(function(mod){
					if(mod.uri_nux.match(subReg)){
						mods.push(mod);
					}
				});
				if(mods.length) {
					var subbag = SubBag.get({
						modules: mods
					});
					this.subbags.push(subbag);
					this.contains = difference(this.contains, mods);
				}
			}.bind(this));
		}.bind(this));
		return this;
	}
},{
	TYPE: TYPE
});

module.exports = Bag;
var pth = require('path');

var inherit = require('../inherit');
var buildUtil = require('./util');
var Bag = require('./Bag');

var BagDir = inherit(Bag, {
	/**
	 * @param options
	 * @private
	 */
	__constructor: function(options){
		options.isDir = true;
		this.basename = pth.basename(options.uri);
		this.dirname = pth.dirname(options.uri);
		this.__base(options);
		this.genDistFilename().genDistContent();
		'';
	},
	_init: function(opt){
		this.bags = [];
		this.contains = [];
		buildUtil.readDirChild(opt.uri, function(filename, stats, uri){
			var bag = Bag.get({
				uri: uri,
				config: opt.config,
				moduleType: opt.moduleType
			});
			this.bags.push(bag);

			bag.contains.forEach(function(mod){
				if(this.contains.indexOf(mod) < 0) this.contains.push(mod);
			}.bind(this));
		}.bind(this));
	},
	_distRuleReplace: function(rule, conf){
		if(rule.indexOf('$file')>=0) rule = rule.replace('$file', this.basename);
		if(rule.indexOf('$all')>=0) rule = rule.replace('$all', this.bags.map(function(bag){
			var mainModule = bag.mainModule;
			return pth.basename(mainModule.uri, '.' + mainModule.type);
		}).join('_'));
		if(rule.indexOf('$dir')>=0) rule = rule.replace('$dir', pth.relative(conf.src, this.dirname));
		return rule;
	},
	writeFile: function(){
		buildUtil.writeFile(this.distFilename, this.distContent);
		return this;
	}
});

module.exports = BagDir;
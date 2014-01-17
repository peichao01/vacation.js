var pth = require('path');

var inherit = require('../inherit');
var buildUtil = require('./util');
var Bag = require('./Bag');

var underscore = require('underscore');

var BagDir = inherit(Bag, {
	/**
	 * @param options
	 * @private
	 */
	__constructor: function(options){
		this.isDir = true;
		this.basename = pth.basename(options.uri);
		this.dirname = pth.dirname(options.uri);
		this.__base(options);
		this.genDistFilename().genDistId().genDistContent();
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
	genDistContent: function(){
		this.__base();
		if(this.moduleType == 'seajs'){
			// 目前的情况是：每一个 bag
			var moduleIDsRequired = this.bags.map(function(bag){ return '"' + bag.distId + '"' });
			var tpl = "define(\"<%= distId %>\", [<%= moduleIDsRequired.join(',') %>], function(require){"
					+		"<% moduleIDsRequired.forEach(function(modID){ %>"
					+			"require(<%= modID %>);"
					+		"<% }); %>"
					+ "});";
			this.distContent += underscore.template(tpl, {
				distId: this.distId,
				moduleIDsRequired: moduleIDsRequired
			});
		}
		return this;
	},
	writeFile: function(){
		vacation.cli.emitter.emit('bag-before-write', this);
		var options = buildUtil.getOptions();
		if(options.log.concat) this.contains.forEach(function(mod){
			console.log('[CONCAT] '+ mod.distId);
		});
		var result = buildUtil.writeFile(this.distFilename, this.banner + this.distContent);
		if(result === false){
			// 这个应该是不允许的，所以需要【报错】
			vacation.log.notice('write dist pkg ['+this.distFilename+'] failed.');
		}

		vacation.cli.emitter.emit('bag-after-write', this);
		return this;
	}
});

module.exports = BagDir;
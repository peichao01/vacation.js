var inherit = require('../inherit');

var canNew = false;

var caches = {};
var _pid = 0;
function getPid(){
	return 'p' + _pid++;
}

var BaseBag = inherit({
	__constructor: function(){
		this._check();
		this.pid = getPid();
	},
	_check: function(){
		if(!canNew) vacation.log.error('you should use Package.get to initialize a Package.');
		return this;
	},
	dealModules: function(){
		this.contains.forEach(function(mod){
			mod.setPackage(this);
		}.bind(this));
		return this;
	}
},{
	get: function (opt){
		canNew = true;
		var package = caches[opt.uri] || (caches[opt.uri] = new this.prototype.__self(opt));//new Klass(opt));
		canNew = false;
		return package;
	}
});

module.exports = BaseBag;

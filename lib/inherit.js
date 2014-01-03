/**
 * Inheritance plugin
 *
 * Copyright (c) 2010 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * source: https://raw.github.com/dfilatov/jquery-plugins/master/src/jquery.inherit/jquery.inherit.js
 *		   https://github.com/dfilatov/jquery-plugins/tree/master/src/jquery.inherit
 *
 * modified by peic@ctrip.com
 *
 * dependencies: none
 *
 * @version 1.3.6
 */

var eachObj=function(list,iterator){ for(var key in list) if(list.hasOwnProperty(key)) iterator(key,list[key]) },
	isFunction = function(fn){return Object.prototype.toString.call(fn)==='[object Function]'},
	extend=function(target,source){eachObj(source,function(name,value){target[name]=value});return target};
var hasIntrospection = (function(){'_';}).toString().indexOf('_') > -1,
	emptyBase = function() {},
	objCreate = Object.create || function(ptp) {
		var inheritance = function() {};
		inheritance.prototype = ptp;
		return new inheritance();
	},
	needCheckProps = true,
	testPropObj = { toString : '' };

for(var i in testPropObj) { // fucking ie hasn't toString, valueOf in for
	testPropObj.hasOwnProperty(i) && (needCheckProps = false);
}

var specProps = needCheckProps? ['toString', 'valueOf'] : null;

function override(base, result, add) {

	var hasSpecProps = false;
	if(needCheckProps) {
		var addList = [];
		for(var i=0,l=specProps.length;i<l;i++){
			add.hasOwnProperty(this) && (hasSpecProps = true) && addList.push({
				name : this,
				val  : add[this]
			});
		};
		if(hasSpecProps) {
			eachObj(add, function(name) {
				addList.push({
					name : name,
					val  : this
				});
			});
			add = addList;
		}
	}

	eachObj(add, function(name, prop) {
		if(hasSpecProps) {
			name = prop.name;
			prop = prop.val;
		}
		if(isFunction(prop) &&
			(!hasIntrospection || prop.toString().indexOf('.__base') > -1)) {

			var baseMethod = base[name] || function() {};
			result[name] = function() {
				var baseSaved = this.__base;
				this.__base = baseMethod;
				var result = prop.apply(this, arguments);
				this.__base = baseSaved;
				return result;
			};

		}
		else {
			result[name] = prop;
		}

	});

}

//inherit
exports = module.exports = function() {

	var args = arguments,
		hasBase = isFunction(args[0]),
		base = hasBase? args[0] : emptyBase,
		props = args[hasBase? 1 : 0] || {},
		staticProps = args[hasBase? 2 : 1],
		result = props.__constructor || (hasBase && base.prototype.__constructor)?
			function() {
				return this.__constructor.apply(this, arguments);
			} : function() {};

	if(!hasBase) {
		result.prototype = props;
		result.prototype.__self = result.prototype.constructor = result;
		return extend(result, staticProps);
	}

	extend(result, base);

	var basePtp = base.prototype,
		resultPtp = result.prototype = objCreate(basePtp);

	resultPtp.__self = resultPtp.constructor = result;

	override(basePtp, resultPtp, props);
	staticProps && override(base, result, staticProps);

	return result;

};

exports.inheritSelf = function(base, props, staticProps) {

	var basePtp = base.prototype;

	override(basePtp, basePtp, props);
	staticProps && override(base, base, staticProps);

	return base;

};


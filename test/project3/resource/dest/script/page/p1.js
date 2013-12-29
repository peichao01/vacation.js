/*! lastmodify: 2013-12-29 17:07:49 */
;define("module/module_a.js", ["lib_a", "page/p1.js"], function(require, exports){
	var lib_a = require('lib_a');
	var module_b = require('./module_b');
	var module_d = require('./module_d');
	console.log('module a');
});
;define("module/module_b.js", ["page/p1.js"], function(require, exports){
	var module_c = require('./module_c');
	console.log('module b');
});
;define("module/module_c.js", [], function(require, exports){
	console.log('module c');
});
;define("module/module_d.js", [], function(require){
	console.log('module d.');
});

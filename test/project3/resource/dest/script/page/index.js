/*! lastmodify: 2013-12-29 17:16:57 */
;define("lib_a", [], function(require, exports, module){
	console.log('lib a');
});
;define("module/module_a.js", ["lib_a", "module/module_b.js", "module/module_d.js"], function(require, exports){
	var lib_a = require('lib_a');
	var module_b = require('./module_b');
	var module_d = require('./module_d');
	console.log('module a');
});
;define("module/module_b.js", ["module/module_c.js"], function(require, exports){
	var module_c = require('./module_c');
	console.log('module b');
});
;define("module/module_c.js", [], function(require, exports){
	console.log('module c');
});
;define("module/module_d.js", [], function(require){
	console.log('module d.');
});
;define("page/index.js", ["lib_a", "module/module_a.js"], function(require, exports, module){

	var lib_a = require('lib_a');
	var module_a = require('module/module_a');

	console.log('index');
});
/*! lastmodify: 2014-01-05 22:28:03 */
define("module/c",[],function(require){
	console.log('module c');
});;
define("module/d",["non-CMD"],function(require){
	require('../non-CMD');
	console.log('module d');
});;
define("module/b",["../../../modules"],function(require){
	var mod_c = require('module/c');
	var mod_d = require('module/d');
	console.log('module b');
});;
define("module/a",["lib/a","../../../modules","tpl/module/a.tpl"],function(require){
	var lib_a = require('lib/a');
	var mod_b = require('module/b');
	var tpl = Handlebars.compile(require('../../tpl/module/a.tpl.js'));
	require('../../style/module/a.css');
	document.body.innerHTML = tpl({
		Name:'David',
		Age: 25
	});
	console.log('module a');
});;
define("module/E/E",[],function(require,exports,module){
	console.log('module e');
});;

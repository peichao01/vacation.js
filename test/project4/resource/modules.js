/*! lastmodify: 2014-01-05 17:54:16 */
define("module/c.js",[],function(require){
	console.log('module c');
});;
define("module/d.js",["non-CMD.js"],function(require){
	require('../non-CMD');
	console.log('module d');
});;
define("module/b.js",["../../../modules.js"],function(require){
	var mod_c = require('module/c');
	var mod_d = require('module/d');
	console.log('module b');
});;
define("module/a.js",["lib/a.js","../../../modules.js","tpl/module/a.tpl.js"],function(require){
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
define("module/E/E.js",[],function(require,exports,module){
	console.log('module e');
});;

/*! lastmodify: 2014-01-07 10:59:16 */
define("module/a",[],function(require, exports, module){
	console.log('module a');
	module.exports = 'module a';
});;
define("page/main_widgets/_top",[],function(require){
	console.log('main - top');
	return '_top';
});;
define("page/main",["module/a","page/main_widgets/_top"],function(require){
	require('../module/a');
	require('./main_widgets/_top');
	console.log('page main');
});;
define("page/detail",["module/a"],function(require){
	require('../module/a');
	console.log('page detail');
});;
define("page", ["page/main","page/detail"], function(require){require("page/main");require("page/detail");});
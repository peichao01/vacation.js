/*! lastmodify: 2014-01-08 09:49:37 */
define("module/a",[],function(require, exports, module){
	console.log('module a');
	module.exports = 'module a';
});;
define("page/main_widgets/_top",[],function(require){
	console.log('main - top');
	return '_top';
});;
define("page/main",["module/a","http://webresource.c-ctrip.com/code/cquery/mod/calendar-6.0.js","page/main_widgets/_top"],function(require){
	require('../module/a');
	require('http://webresource.c-ctrip.com/code/cquery/mod/calendar-6.0.js');
	require('./main_widgets/_top');
	console.log('page main');
});;

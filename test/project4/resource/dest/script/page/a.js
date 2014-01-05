/*! lastmodify: 2014-01-05 22:28:03 */
define("non-CMD",[],function(){(function(){
	console.log('this is not a cmd module');
})();});;
define("lib/a",[],function(require){
	console.log('lib a');
});;
define("tpl/module/a.tpl",[],function(){
	return "<div id=\"wrapper\">\n\
	<h1>姓名：{{Name}}</h1>\n\
	<div>年龄：{{Age}}</div>\n\
	<p></p>\n\
</div>"});;
define("page/a",["non-CMD","lib/a","../../../modules"],function(require){
	require('non-CMD');
	var lib_a = require('lib/a');
	var mod_a = require('../module/a');
	var mod_e = require('../module/E/E');
	console.log('page a');
});;

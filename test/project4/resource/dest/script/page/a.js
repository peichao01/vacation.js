/*! lastmodify: 2014-01-05 17:54:16 */
define("non-CMD.js",[],function(){(function(){
	console.log('this is not a cmd module');
})();});;
define("lib/a.js",[],function(require){
	console.log('lib a');
});;
define("tpl/module/a.tpl.js",[],"<div id=\"wrapper\">\n\
	<h1>姓名：{{Name}}</h1>\n\
	<div>年龄：{{Age}}</div>\n\
	<p></p>\n\
</div>");
define("page/a.js",["non-CMD.js","lib/a.js","../../../modules.js"],function(require){
	var lib_a = require('lib/a');
	var mod_a = require('../module/a');
	var mod_e = require('../module/E/E');
	require('non-CMD');
	console.log('page a');
});;

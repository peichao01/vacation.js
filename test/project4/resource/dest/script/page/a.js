/*! lastmodify: 2014-01-05 00:18:55 */
define("lib/a.js",[],function(require){
	console.log('lib a');
});;
define("tpl/module/a.tpl.js",[],"<h1>姓名：{{Name}}</h1>\n\
<div>年龄：{{Age}}</div>");
define("page/a.js",["lib/a.js","../../../modules.js"],function(require){
	var lib_a = require('lib/a');
	var mod_a = require('../module/a');
	var mod_e = require('../module/E/E');
	console.log('page a');
});;

/*! lastmodify: 2014-01-24 00:04:28 */
define("view/view3",function(){var e="view/view3.js";return console.log(e),{name:e}});;
define("lib/lib2",function(){var e="lib/lib2.js";return console.log(e),{name:e}});;
define("view/view1",["./view3","../lib/lib2"],function(e,n){var o="view1";return console.log(o+": "+e),console.log(o+": "+n),{name:o}});;
define("view/view2",["./view3"],function(e){var n="view2";return console.log(n+": "+e.name),{name:n}});;
define("module/c.base",function(){return console.log("c.base.js"),{name:"c.base.js"}});;
define("module/c.kk",function(){}),require([],function(){console.log("c.kk.js")});;
define("module/c.pop",["./c.base","./c.kk"],function(){console.log("c.pop.js")});;
define("page/main_r",["lib","../module/c.pop"],function(e){console.log("main.js"),console.log(e.name)});;

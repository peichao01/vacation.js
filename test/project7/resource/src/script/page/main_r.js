/*! lastmodify: 2014-01-22 23:02:55 */
define("module/c.base",function(){return console.log("c.base.js"),{name:"c.base.js"}});;
define("module/c.kk",function(){}),require([],function(){console.log("c.kk.js")});;
define("module/c.pop",["./c.base","./c.kk"],function(){console.log("c.pop.js")});;
define("page/main_r",["lib","../module/c.pop"],function(e){console.log("main.js"),console.log(e.name)});;

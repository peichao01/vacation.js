/*! lastmodify: 2014-01-24 16:44:43 */
define("module/c.base",function(){return console.log("c.base.js"),{name:"c.base.js"}});;
define("module/c.kk",function(){}),require([],function(){console.log("c.kk.js")});;
define("module/c.pop",["./c.base","./c.kk"],function(){console.log("c.pop.js")});;
define("lib/lib3",function(){var e="lib/lib3";return console.log(e),{name:e}});;
define("text!tpl/a.html",[],function(){return"<div> <% for(var i=0;i<10;i++){ %> <span>这是第<%= i %>次循环</span> <% } %> </div>"});;
define("page/main_r",["lib","../module/c.pop","../lib/lib3","text!tpl/a.html"],function(e,n,o,i){var l="main.js";console.log(l),console.log(l+": "+e.name),console.log(l+": "+o.name),console.log(i)});;
define("view/view3",function(){var e="view/view3.js";return console.log(e),{name:e}});;
define("view/view2",["./view3"],function(e){var n="view2";return console.log(n+": "+e.name),{name:n}});;
define("lib/lib2",function(){var e="lib/lib2.js";return console.log(e),{name:e}});;
define("view/view1",["./view3","../lib/lib2","../lib/lib3"],function(e,i,n){var o="view1";return console.log(o+": "+e),console.log(o+": "+i),console.log(o+": "+n),{name:o}});
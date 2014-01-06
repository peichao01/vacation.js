/*! lastmodify: 2014-01-06 17:19:39 */
define("module/C",[],function(){return console.log("module c"),"module c"});;
define("page/_main_top",function(){}),require(["module/C"],function(){console.log("_main_top")});;
define("tpl/module/A.tpl",[],function(){return'<div class="wrapper"> <ul> <% for(var i=0, len = students.length; i<len; i++){ %> <% var student = students[i]; %> <li><%= student.name %>: <%= student.age %></li> <% } %> </ul> </div>'});;
define("module/A",["tpl/module/A.tpl"],function(e){function n(){var n=[{name:"小张",age:20},{name:"小王",age:19},{name:"小李",age:23},{name:"小姨",age:18}],t=_.template(e,{students:n}),u=_.template(e)({students:n});document.body.innerHTML=t+u}return console.log("module A."),n});;
define("page/main",function(){}),require(["jquery","page/_main_top","module/A"],function(e,n,t){new t,console.log("page a")});;

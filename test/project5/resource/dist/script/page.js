/*! lastmodify: 2014-01-07 11:02:34 */
define("module/C",[], function(){
	console.log('module c');
	return 'module c';
});;
define("page/main_widgets/_main_top",function(){});require(['module/C'], function(modC){
	console.log('_main_top');
});;
define("tpl/module/A.tpl",[],function(){
	return "<div class=\"wrapper\">\n\
	<ul>\n\
	<% for(var i=0, len = students.length; i<len; i++){ %>\n\
		<% var student = students[i]; %>\n\
		<li><%= student.name %>: <%= student.age %></li>\n\
	<% } %>\n\
	</ul>\n\
</div>"});;
define("module/A",['tpl/module/A.tpl'],function(tplModA){
//define(['tpl/module/A.tpl','css/module/A.css'],function(tplModA){

	function A(){
		var data_students = [
			{name:"小张",age:20},
			{name:"小王",age:19},
			{name:"小李",age:23},
			{name:"小姨",age:18}
		];
		var m1 = _.template(tplModA, {students:data_students});
		var m2 = _.template(tplModA)({students:data_students});
		document.body.innerHTML = m1 + m2;
	}
	console.log('module A.');

	return A;
});;
define("page/main",function(){});// 首页
require(['jquery','page/main_widgets/_main_top','module/A'], function($, _main_top, ModuleA){
	var modA = new ModuleA();
	console.log('page a');
});;
define("module/B",function(){
	console.log('module B.');
	return 'module B';
});;
define("page/detail",function(){});// 详情页
require(['./module/A', 'module/B'], function(ModA, ModB){
	var modA = new ModA();
	console.log('page detail');
});;

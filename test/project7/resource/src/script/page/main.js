define(['lib','../module/c.pop','../lib/lib3','text!tpl/a.html'],function(lib, pop, lib3, tpl_a){
	var name = 'main.js';
	console.log(name);
	console.log(name + ': ' + lib.name);
	console.log(name + ': ' + lib3.name);
	console.log(tpl_a);
});
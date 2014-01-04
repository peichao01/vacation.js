define(function(require){
	var lib_a = require('lib/a');
	var mod_b = require('module/b');
	var tpl = Handlebars.compile(require('../../tpl/module/a.tpl.js'));
	require('../../style/module/a.css');
	document.body.innerHTML = tpl({
		Name:'David',
		Age: 25
	});
	console.log('module a');
});
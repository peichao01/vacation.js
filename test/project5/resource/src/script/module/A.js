define(['tpl/module/A.tpl'],function(tplModA){
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
});
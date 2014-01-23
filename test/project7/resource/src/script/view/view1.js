define(['./view3','../lib/lib2'], function(view3, lib2){
	var name = 'view1';
	console.log(name + ': ' + view3);
	console.log(name + ': ' + lib2);
	return {
		name: name
	};
});
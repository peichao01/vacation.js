define(['./view3','../lib/lib2','../lib/lib3'], function(view3, lib2, lib3){
	var name = 'view1';
	console.log(name + ': ' + view3);
	console.log(name + ': ' + lib2);
	console.log(name + ': ' + lib3);
	return {
		name: name
	};
});
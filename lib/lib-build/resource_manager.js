var mainFiles = [];
var availableFiles = {
	res:{},
	pkg:{}
};

function extend(a,b){
	for(var key in b){
		if(b.hasOwnProperty(key)){
			a[key] = b[key];
		}
	}
	return a;
}

exports.getMainFiles = function(){
	return mainFiles;
}

exports.getResource = function(moduleId){
	if(moduleId){
		return availableFiles.res[moduleId];
	}
	else{
		return availableFiles.res;
	}
}
exports.setResource = function(moduleId, module){
	availableFiles.res[moduleId] = extend(availableFiles.res[moduleId] || {}, module);
	//console.log(moduleId)
	//console.log(module)
	//console.log(availableFiles);process.exit(0)
}
//exports.setResourceOneProp = function(moduleId, propertyName, value){
//	availableFiles.res[moduleId] = availableFiles.res[moduleId] || {};
//	availableFiles.res[moduleId][propertyName] = value;
//}

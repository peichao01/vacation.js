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

exports.getAvailableFile = function(){
	return availableFiles;
};

exports.getMainFiles = function(){
	return mainFiles;
};

exports.getResourceIDByURI = function(uri){
	for(var moduleId in availableFiles.res){
		var moduleInfo = availableFiles.res[moduleId];
		if(uri == moduleInfo.uri) return moduleId;
	}
};

exports.getResource = function(moduleId){
	if(moduleId){
		return availableFiles.res[moduleId];
	}
	else{
		return availableFiles.res;
	}
};

exports.setResource = function(moduleId, module){
	availableFiles.res[moduleId] = extend(availableFiles.res[moduleId] || {}, module);
};

exports.getPkg = function(){
	return availableFiles.pkg;
};

exports.setPkg = function(pkgName, value){
	availableFiles.pkg[pkgName] = value;
};

exports.getPkgLen = function(){
	return Object.keys(availableFiles.pkg).length;
};
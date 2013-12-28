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



function getModuleByUriReg(reg){
	var allResources = exports.getResource();
	for(var key in allResources){
		var module = allResources[key];
		if(module.uri.match(reg)){
			return module;
		}
	}
}

var pkgDealed = false;
exports.dealPkgInfo = function (){
	if(pkgDealed) return;
	
	var conf = vacation.cli.config.build;
	if(conf.pkg){
		conf.pkg = conf.pkg.map(function(pkg){
			var reg = RegExp.apply(null, pkg.main);
			var module = getModuleByUriReg(reg);
			if(!module){
				vacation.log.error('no package founded. does you specified a right pkg RegExp('+reg+')?');
			}

			var except = pkg.except && pkg.except.map(function(regArr){return RegExp.apply(null, regArr)}),
				concatedExcept = except || [];

			return {
				module: module,
				dest_rule: pkg.dest_rule,
				sub: pkg.sub && pkg.sub.map(function(subPkg){
					subPkg.contain = subPkg.contain.map(function(regArr){return RegExp.apply(null, regArr)});
					// 被别的子包 包含的模块
					concatedExcept = concatedExcept.concat(subPkg.contain);
					return subPkg;
				}),
				except: except,
				concatedExcept: concatedExcept
			}
		});
	}
	pkgDealed = true;
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
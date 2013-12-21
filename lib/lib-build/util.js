var pth = require('path');
var fs = require('fs');

// id 是当前文件目录到 base 的相对路径，并不是说module一定要在 base 目录内部
exports.getModuleId = function(moduleFullPath, baseDir) {
	// 把文件夹后面的 / 斜线也去掉
	//return moduleFullPath.substr(baseDir.length + 1);
	var moduleDir = pth.dirname(moduleFullPath);
	return pth.relative(moduleDir, baseDir);
}

exports.is = function(moduleId, type){
	return moduleId.lastIndexOf('.'+type) === (moduleId.length - type.length - 1);
}

exports.readFile = function(path) {
	var content = fs.readFileSync(path,{encoding:'utf8'});
	if(!content) vacation.log.error('read file('+path+') failed.');
	return content;
}

exports.values = function (object) {
	var r = [];
	for(var key in object){
		if(object.hasOwnProperty(key))
			r.push(object[key]);
	}
	return r;
}

/*
* @param {Boolean} removeComments
* @param {Boolean} collapseWhitespace
* @param {Boolean} removeHandlebarsComments
*/
exports.htmlMinify = function(content, opts){
	opts = opts || {};
	if(opts.removeComments){
		content = content.replace(/<!--(.|\r|\n)*-->/g,"");
	}
	if(opts.removeHandlebarsComments){
		content = content.replace(/{{!.*}}/g,"").replace(/{{!--(.|\r|\n)*--}}/g,"");
	}
	if(opts.collapseWhitespace){
		content = content.replace(/(\r|\n)/g," ").replace(/\s+/g," ");
	}
	return content;
};

exports.writeFile = function(filePath, content) {
	vacation.util.mkdir_p(pth.dirname(filePath));
	var err = fs.writeFileSync(filePath, content, {encoding:'utf8'});
	if(err) vacation.log.error('write file('+filePath+') error.');
}


// 根据 alias 得到被替换过的路径
exports.get_real_path_by_alias = function(path, aliasObj){
	var aliasPath = path;
	// 必须是 "/" 来分割目录，且不能是根目录
	var aliasPathArr = aliasPath.split('/');
	var i=0,len=aliasPathArr.length, prev ='';
	var haveInPaths = false;
	for(; i<len; i++){
		if(prev) prev += '/';
		prev += aliasPathArr[i];

		if(aliasObj[prev]){
			haveInPaths = true;
			break;
		}
	}
	// 如果alias的路径有部分在paths定义过，则替换回来
	if(haveInPaths){
		//aliasPath = pth.normalize(aliasPath.replace(prev, aliasObj[prev]));
		aliasPath = aliasPath.replace(prev, aliasObj[prev]);
	}
	return aliasPath;
}

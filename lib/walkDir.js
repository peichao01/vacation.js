var walk = require('walk');
var pth = require('path');

var walkDir = function(dir, onFile, onDir, onEnd){
	var walker = walk.walk(dir, {
		followLinks: false
	});
	onFile && walker.on('file', function(root, fileStats, next){
		handler(root, fileStats, onFile);
		next();
	});
	onDir && walker.on('directories', function(root, dirStatsArray, next){
		dirStatsArray.forEach(function(dirStats){
			handler(root, dirStats, onDir, true);
		});
		next();
	});
	onEnd && walker.on('end', onEnd);

	function handler(root, stats, callback, isDir){
		var uri = pth.resolve(root, stats.name);
		// 有的路径实在太长了，控制台都显示不完
		var debugURI = uri.substr(51);
		//if(buildUtil.isURIAvailable(uri)){
			callback(root, stats, uri, isDir);
		//}
	}
}

module.exports = walkDir;
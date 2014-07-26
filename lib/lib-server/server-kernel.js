/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var http = require('http');
var fs = require('fs');
var url = require('url');
var pth = require('path');

var contentType = {
	'html':'text/html',
	'css':'text/css',
	'js':'application/x-javascript',
	'png':'image/png',
	'jpeg':'image/jpeg',
	'jpg':'image/jpeg',
	'gif':'image/gif',
	'txt':'text/plain',
	'tpl':'text/plain',
	'json':'application/json'
	//'json':'text/plain'
};

exports.start = function(){
	var config = vacation.cli.config;
	var serverConf = config.server;
	var port = serverConf.port;
	//console.log(config.cmd_cwd);

	var rootRelativeTo;
	if(serverConf.rootRelative === 'cwd')
		rootRelativeTo = vacation.cli.cmd_cwd; //config.cmd_cwd;
	else if(serverConf.rootRelative === 'confFile')
		rootRelativeTo = pth.dirname(vacation.cli.configFilePath);

	var rootDir = pth.resolve(rootRelativeTo, serverConf.root);
	contentType = vacation.util.merge(contentType, config.contentType||{});

	var app = http.createServer(function(req, res){

		if(!config.server.onRequest || config.server.onRequest(req, res) !== false){

			var parsedUrl = url.parse(req.url);
			var pathname = parsedUrl.pathname;

			if(parsedUrl.search && parsedUrl.search.indexOf('??') === 0){
				var requestPath = parsedUrl.search.substr(2).split(',').map(function (path) {
					return pathname + path;
				});
				var matchedPath = parsedUrl.href.match(reg);
				console.log(parsedUrl.href);
			}
			else{
				var requestPath = pathname.match(/\/$/) ? (pathname + serverConf.defaultFile) : pathname;
				var reg = new RegExp('\\.('+Object.keys(contentType).join('|')+')$');
				var matchedPath = requestPath.match(reg);
				console.log(requestPath);
			}

			var notFoundPage = '<div style="text-align:center"><h1 style="color:red">404 Not found</h1>'
								+ '<p style="color:gray">'+requestPath+'</p>'
								+ '<hr><h2><a style="text-decoration:none;" target="_blank" '
								+ 'href="https://github.com/peichao01/ctrip-vacation-build">'
								+ 'vacation v'+vacation.cli.info.version+'</a></h2></div>';

			if(serverConf.allowOrigin)
				res.setHeader('Access-Control-Allow-Origin',serverConf.allowOrigin);

			//静态资源文件
			if(matchedPath){
				// var i = requestPath.indexOf('??');
				if(Array.isArray(requestPath)){
					var content = {};
					var cbtime = 0;
					requestPath.forEach(function (path) {
						var filePath = pth.resolve(rootDir, path.substr(1));
						getFileContent(filePath, function (data) {
							cbtime++;
							content[path] = data;
							if(cbtime == requestPath.length){
								echoContent(res, contentType[matchedPath[1]], requestPath, content);
							}
						}, function () {
							res.writeHead(404);
							res.end(notFoundPage);
						});
					});
				}
				else{
					var filePath = pth.resolve(rootDir, requestPath.substr(1));
					//console.log(rootDir, requestPath, filePath);
					getFileContent(filePath, function (data) {
						res.writeHead(200, {'Content-Type':contentType[matchedPath[1]]});
						res.end(data);
					}, function () {
						res.writeHead(404);
						res.end(notFoundPage);
					});
				}
			}
			else{
				res.writeHead(404);
				res.end(notFoundPage);
			}
		}
	});
	try{
		var port = serverConf.port;
		app.listen(port);
		console.log('server running on http://127.0.0.1:' + port);
	} catch(e){
		vacation.log.error('port['+port+'] has been used.');
	}
}
function echoContent (res, contentType, arrOrder, contents) {
	var content = '';
	arrOrder.forEach(function (path) {
		if(contents[path]){
			content += contents[path] + '\n';
			delete contents[path];
		}
	});
	res.writeHead(200, {'Content-Type':contentType});
	res.end(content);
}
function getFileContent (filePath, success, err) {
	fs.exists(filePath, function(exists){
		if(exists){
			fs.readFile(filePath, function(err, data){
				if(err) throw err;
				success && success(data);
			});
		}
		else{
			err && err();
		}
	});
}
var http = require('http');
var fs = require('fs');
var url = require('url');
var pth = require('pth');

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
	//'json':'application/json',
	'json':'text/plain'
};

exports.start = function(){
	var config = vacation.cli.config.server;
	var port = config.port;
	var rootDir = config.cmd_cwd + config.root;
	

	var app = http.createServer(function(req, res){
		var parsedUrl = url.parse(req.url);
		var pathname = parsedUrl.pathname;
	
		var requestPath = pathname.match(/\/$/) ? (pathname + 'index.html') : pathname;
		var reg = new RegExp('\\.('+Object.keys(contentType).join('|')+')$');
		var matchedPath = requestPath.match(reg);
		
		//静态资源文件
		if(matchedPath){
			var filePath = pth.resolve(rootDir, requestPath.substr(1));
			console.log(filePath);
	
			fs.exists(filePath, function(exists){
				if(exists){
					fs.readFile(filePath, function(err, data){
						if(err) throw err;
						res.writeHead(200, {'Content-Type':contentType[matchedPath[1]]});
						res.end(data);
					});
				}
				else{
					res.writeHead(404);
					res.end('<h1 style="color:red">404 Not found</h1>');
				}
			});
		}
		else{
			res.writeHead(404);
			res.end('404 ' + pathname + ' not found.');
		}
	});
	try{
		app.listen(8080);
		console.log('server running on http://127.0.0.1:8080');
	} catch(e){
		vacation.log.error('port['+port+'] has been used.');
	}
}

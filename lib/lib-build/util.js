var native_util = require('util');
var EventEmitter = require('events').EventEmitter;
var pth = require('path');
var fs = require('fs');
var crypto = require('crypto');
var uglifyJS = require('uglify-js');
var handlebars = require('handlebars');
var underscore = require('underscore');

var IS_WIN = process.platform.indexOf('win') === 0;

var toString = Object.prototype.toString;
var _isType = function(type){
	return function(source){
		return toString.call(source) === '[object '+type+']';
	}
};
exports.isArray = _isType('Array');
exports.isObject = _isType('Object');
exports.isString = _isType('String');

exports.TPL_TYPE = ['html','tpl','hbs','handlebars','underscore'];
exports.IS_TPL = new RegExp("\\.("+exports.TPL_TYPE.join('|')+")(\\.js)?$");

var REG_REMOTE_URI = /^(https?:)?\/\//;
exports.isRemoteUri = function(uri){
	return uri.match(REG_REMOTE_URI);
};

var _commander_options;
exports.setOptions = function(opt){
	_commander_options = opt;
};

exports.getOptions = function(){
	return _commander_options;
};

// id 是当前文件目录到 base 的相对路径，并不是说module一定要在 base 目录内部
exports.getModuleId = function(moduleFullPath, baseDir) {
	// 把文件夹后面的 / 斜线也去掉
	//return moduleFullPath.substr(baseDir.length + 1);
	var moduleDir = pth.dirname(moduleFullPath);
	return pth.relative(moduleDir, baseDir);
};

exports.md5 = function(data, len){
    var md5sum = crypto.createHash('md5'),
        encoding = typeof data === 'string' ? 'utf8' : 'binary';
    md5sum.update(data, encoding);
    len = len || 10;
    return md5sum.digest('hex').substring(0, len);
};
exports.each = function(o,fn){
	if(exports.isArray(o)){
		for(var i= 0,l= o.length; i<l; i++){
			if(fn.call(o, o[i], i, o) === false) break;
		}
	}
	else if(exports.isObject(o)){
		for(var key in o){
			if(o.hasOwnProperty(key)){
				if(fn.call(o, o[key], key, o) === false) break;
			}
		}
	}
	return o;
};

exports.clone = function(o){
	var dist,
		isArray = exports.isArray(o) && (dist=[]),
		isObject = exports.isObject(o) && (dist = {});
	if(isArray || isObject){
		exports.each(o, function(value, key){
			dist[key] = exports.clone(value);
		});
	}
	else{
		dist = o;
	}
	return dist;
};

exports.difference = function (array, other){
	var r = [];
	array.forEach(function(item){
		if(other.indexOf(item) < 0) r.push(item);
	});
	return r;
};

exports.unique = function(array){
	var arr = [];
	array.forEach(function(item){
		if(arr.indexOf(item) < 0) arr.push(item);
	});
	return arr;
};

exports.extend = function (a,b){
	for(var key in b){
		if(b.hasOwnProperty(key)){
			a[key] = b[key];
		}
	}
	return a;
}

exports.is = function(moduleId, type){
	return moduleId.lastIndexOf('.'+type) === (moduleId.length - type.length - 1);
}

exports.int = function (o) {
	return parseInt(o, 10);
}

exports.delExtname = function(uri){
	return uri.substr(0, uri.lastIndexOf('.'));
};

exports.tfs = {
	checkout: function(filepath, callback){
		if(IS_WIN){
			var exec = require('child_process').exec;
			//var exec = require('exec-sync');

			exec('tf checkout ' + pth.basename(filepath), {cwd: pth.dirname(filepath)}, function(error, stdout, stderr){
				if (error !== null) {
					if(error.toString().indexOf("Command failed: 'tf'" == 0)){
						vacation.log.notice('[CHECKOUT FAILED] please add "TF.exe" directory(in your VS install dir) to you system environment variable.');
					}
					else{
						vacation.log.notice('unknown error when auto checkout.');
					}
				}
				callback(error, stdout, stderr);
			});
		}
		else{
			vacation.log.log('only windows support TFS auto checkout');
		}
	},
	checkin: function(filepath){
		if(IS_WIN){

		}
		else{
			vacation.log.log('only windows support TFS auto checkout');
		}
	}
};

var REG_ID_JS = /(.+)\.js$/;
exports.normalize_dist_id = function(id){
	if(!id) return id;
	var f = id.match(REG_ID_JS);
	if(f) id = f[1];
	return exports.normalize_win_dir(id);
};

exports.add_extname = function(file, ext){
	return file + '.' + ext;
};

exports.readDirChild = function(path, onFile, onDir){
	var stats = fs.statSync(path);
	if(stats.isDirectory()){
		var files = fs.readdirSync(path);
		files.forEach(function(filename){
			var uri = pth.resolve(path, filename)
			stats = fs.statSync(uri);
			if(stats.isFile()){
				onFile && onFile(filename, stats, uri);
			}
			else if(stats.isDirectory()){
				onDir && onDir(filename, stats, uri);
			}
		});
	}
};

exports.readFile = function(path) {
	try{
		var content = fs.readFileSync(path,{encoding:'utf8'});
		//if(!content) vacation.log.error('read file('+path+') failed.');
		return content;
	}
	catch(e){
		vacation.log.error('failed to read ['+path+']'
							+ '\n\t message: ' + e.message);
	}
};

exports.readJSON = function(path){
	var json = exports.readFile(path),
        result = {};
    try {
        result = JSON.parse(json);
    } catch(e){
        vacation.log.error('parse json file[' + path + '] fail, error [' + e.message + ']');
    }
    return result;
};

//
/**
 * @param filePath
 * @param content
 * @param callback(success, filePath)
 * @param _checked 不要手动添加 _checked 参数
 * @returns {boolean}
 */
exports.writeFile = function(filePath, content, callback, _checked) {
	try{
		vacation.util.mkdir_p(pth.dirname(filePath));
		var err = fs.writeFileSync(filePath, content, {encoding:'utf8'});
		vacation.log.debug('[WRITE FILE] ' + filePath);
		callback && callback(true, filePath);
	}
	catch(e){
		var options = exports.getOptions();
		//vacation.log.error('write file['+filePath+'] error.\n\t message: ' + e.message);
		if(options.autocheckout && !_checked){
			exports.tfs.checkout(filePath, function(error, stdout, stderr){
				vacation.log.debug('[CHECKOUT '+(error == null ? 'SUCCESS' : 'FAILED')+'] ' + filePath);
				if(error == null){
					exports.writeFile(filePath, content, callback, true);
				}
				callback && callback(error == null, filePath);
			});
		}
		else{
			callback && callback(false, filePath);
		}
		return false;
	}
	return true;
};

exports.setConfig = function(name, value){
	vacation.cli.config[name] = value;
};

/**
 * @param {Array} arr [{path, content}, ..]
 * @param {Function} callback(failedArray)
 */
exports.writeFiles = function(arr, callback){
	var results = [], count = 0, arrLen = arr.length;
	arr.forEach(function(entity, i){
		exports.writeFile(entity.path, entity.content, function(sucess){
			count++;
			//results[i] = sucess;
			if(!sucess) results.push(entity.path);
			if(count == arrLen) callback(results);
		});
	});
};

exports.values = function (object) {
	var r = [];
	for(var key in object){
		if(object.hasOwnProperty(key))
			r.push(object[key]);
	}
	return r;
};

exports.logWriteFailed = function(writeFailedFiles){
	var options = exports.getOptions();
	if(writeFailedFiles.length){
		if(options.log.write_failed){
			writeFailedFiles.forEach(function(uri){
				vacation.log.notice('[WRITE FAILED] ' + uri);
			});
		}
		else{
			vacation.log.notice('some files write failed.');
		}
	}
};

/*
* @param {Boolean} removeComments
* @param {Boolean} collapseWhitespace
* @param {Boolean} removeHandlebarsComments
*/
exports.htmlMinify = function(content, opts){
	opts = opts || {};
	if(opts.removeComments){
		content = content.replace(/<!--(.|\r|\n)*?-->/g,"");
	}
	if(opts.removeHandlebarsComments){
		// 一定要：
		// 1. 加 "?"，最少匹配
		// 2. 先删除多行注释，再删除单行注释，否则会出错，
		//		如：{{!-- #is}}{{#op a}}{{/op}}{{/is --}}
		content = content.replace(/{{!--(.|\r|\n)*?--}}/g,"").replace(/{{!.*?}}/g,"");
	}
	if(opts.collapseWhitespace){
		content = content.replace(/(\r|\n)+/g," ").replace(/(\s|\t)+/g," ");
	}
	return content;
};

exports.cssMinify = function(content){
	content = content.replace(/(\s|\t)+/g," ")
					.replace(/\r|\n/g,' ');
	return content;
};

exports.content2StandardString = function(content){
	return content.replace(/(\n|\r)+/g, '\\n\\\n').replace(/('|")/g,"\\$1");
};

/**
 * options{pkgIndex, [fromString], [mangle], [compress]}
 */
exports.getUglifiedContent = function (content, moduleId, options) {
	var content, conf = exports.getBuildConfig(options.pkgIndex);
	options = exports.extend({
		fromString: true,
		mangle: conf.uglify && conf.uglify.mangle || true,
		compress: true
	}, options);
	try{
		content = uglifyJS.minify(content, options).code;
	}
	catch(e){
		vacation.log.notice('[UGLIFY FAILED] uglify module['+moduleId+'] failed:\n\t'
				+ e.message
				+ '\n\t[line: ' + e.line + ', col: ' + e.col + ']');
	}
	return content;
};

exports.isHiddenEntity = function(uri){
	return uri.match(/(^|\/)\./g);
};

/**
 * options {pkgIndex}
 * */
exports.isURIAvailable = function (URI, options){
	var conf = exports.getBuildConfig(options && options.pkgIndex);
	// 让正则保持统一的 linux 风格
	// lib\inherit.js --> lib/inherit.js
	//pth.relative(vacation.cli.configFileDir, URI);
	var Linux_Style_Uri = exports.normalize_win_dir(URI);
	var Linux_Style_relativeUri = exports.normalize_win_dir(pth.relative(vacation.cli.configFileDir, URI));

	// Linux、Mac 下，避免遍历 隐藏文件
	//if(exports.isHiddenEntity(URI)) return false;

	// 正则匹配的时候，只需为 configFileDir 后面的路径来匹配
	// 比如：configFileDir => /Users/pc/proj/ , URI => /Users/pc/proj/src/detail/v_detail.js
	// 则 relativeUri 为：src/detail/v_detail.js
	// 正则匹配为：relativeUri.match(/^src\/detail.*/)
	if(conf.available && conf.available.length){
		return conf.available.some(function(reg){
			return exports.isString(reg)
					? Linux_Style_Uri.indexOf(reg) === 0
					: Linux_Style_relativeUri.match(reg);
		});
	}
	else if(conf.ignore && conf.ignore.length){
		return conf.ignore.every(function(reg){
			// 如果是字符串，必须是根路径
			return exports.isString(reg)
					? Linux_Style_Uri.indexOf(reg) !== 0
					: !Linux_Style_relativeUri.match(reg);
		});
	}
	return true;
};

exports.deal_available_ignore = function(conf){
	if(conf.ignore){
		conf.ignore = conf.ignore.map(function(ignore){
			if(exports.isString(ignore)){
				return exports.normalize_win_dir(ignore.replace('$dist', conf.dist));
			}
			return ignore;
		});
	}
};

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

exports.dealBanner = function(banner){
	var match;
	// 1. $$today
	banner = banner.replace(/\$\$today\(\s*[^\)]+\s*\)/g, function(today){
		var t;
		today = today.match(/\((.+)\)/)[1];
		// 字符串，如： "yyyy-mm-dd HH:MM:ss"
		if(t = today.match(/^('|")(.+)\1$/)){
			today = t[2];
			return exports.today(today);
		}
	});
	return banner;
};

exports.date = function(date, format){
	var d = date;
	var pad = vacation.util.pad;
	var result = format.replace(/m+/g,function(match){
		return pad(d.getMonth() + 1 + '', match.length, '0', true);
	})
	.replace(/y+/g, function(match){
		var year = d.getFullYear() + '';
		return year.substr(year.length - match.length);
	})
	.replace(/d+/g, function(match){
		return pad(d.getDate() + '', match.length, '0', true);
	})
	.replace(/H+/g, function(match){
		return pad(d.getHours() + '', match.length, '0', true);
	})
	.replace(/M+/g, function(match){
		return pad(d.getMinutes() + '', match.length, '0', true);
	})
	.replace(/s+/g, function(match){
		return pad(d.getSeconds() + '', match.length, '0', true);
	});
	return result;
}

exports.today = function(format){
	return exports.date(new Date(), format);
}

exports.normalize_win_dir = function (path) {
	if(!path) return path;
	return path.replace(/\\/g, '/');
}

exports.getBuildConfig = function (pkgIndex){
	if(pkgIndex === undefined) return vacation.cli.config.build;
	return vacation.cli.config.build.pkg[pkgIndex];
}

exports.precompileTemplate = function (content, tplType, moduleId){
	try{
		if(tplType == 'Handlebars'){
			return handlebars.precompile(content);
		}
		else if(tplType == 'underscore'){
			return underscore.template(content).source;
		}
		return content;
	}
	catch(e){
		vacation.log.error('precompile template['+moduleId+'] failed.'
			+ '\n\t message: ' + e.message
			//+ '\n\t [line: '+e.line+', col: '+e.col+']'
			+ '\n\t stack: ' + e.stack);
	}
}

// 没有后缀名的都是 js 文件
exports.addExtraNameToFile = function (moduleId){
	var extName = pth.extname(moduleId);
	if(extName == '.js' || extName == '.css') return moduleId;
	return moduleId += '.js';
}


var REG_WORDS = /[a-zA-Z]/;
exports.format_commander = function(msg, txt_len, white_len){
	txt_len = txt_len || 45;
	white_len = white_len || 28;
	// 这是手动换行的
	var manual_lines = msg.split(/\n/);
	var lines = [];
	manual_lines.forEach(function(msg){
		// 然后根据最长字数分行
		while(msg.length > txt_len){
			var line = msg.substr(0, txt_len);
			msg = msg.substr(txt_len);

			if(line[line.length - 1].match(REG_WORDS) && msg[0].match(REG_WORDS)){
//				var match = msg.match(/^([a-zA-Z]+)([,\.\?\!;\s]?)(.*)$/);
//				line += match[1];
//				if(match[2] && match[2] !== ' ') line += match[2];
//				msg = match[3];

				var match = line.match(/^(.*?)([,\.\?\!;\s]?)([a-zA-Z]+)$/);
				line = match[1];
				if(match[2] && match[2] !== ' ') line += match[2];
				msg = match[3] + msg;
			}
			if(msg[0] == ' '){
				msg = msg.match(/^\s+(.*)$/)[1];
			}
			lines.push(line);
		}
		if(msg.length) lines.push(msg);
	});
	return lines.join('\n' + (new Array(white_len).join(' ')) + '-> ');
};

function ReadLine(){
	var readline = require('readline');
	this.question2Queue = [];
	this.rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	this.rl.setPrompt('ANSWER> ');
	this.rl.on('pause', function(){this.status == 'pause'}.bind(this));
	this.rl.on('resume', function(){this.status == 'resume'}.bind(this));

	this.on('question2-done', function(queue){
		if(this.question2Queue.length){
			var queue = this.question2Queue.shift();
			this._question2(queue);
		}
	});
}
native_util.inherits(ReadLine, EventEmitter);

//ReadLine.prototype.question = function(question, callback, isBool){
//	this.rl.question('\n ' + question + (isBool ? ' y(yes).default is yes.' : '') + '\n', function(answer){
//		answer = answer && answer.trim();
//		var boolArg = isBool ? (answer == '' || answer == 'y' || answer == 'yes') : undefined;
//		callback(answer, boolArg);
//	});
//	return this;
//};

ReadLine.prototype.question2 = function(question, callback){
	this.question2Queue.push({question: question, callback: callback});
	return this;
};

ReadLine.prototype.start = function(){
	this.emit('question2-done', 'init');
};

ReadLine.prototype._question2 = function(queue){
	var question = queue.question, callback = queue.callback;
	console.log('\n ' + question + '\n');
	if(this.status == 'pause') this.rl.resume();
	var handler = function(line){
		line = line.trim();
		if(callback.bind(this)(line)){
			this.rl.pause();
			this.rl.removeListener('line', handler);
			this.emit('question2-done', queue);
		}
		else{
			this.rl.prompt();
		}
	}.bind(this);
	this.rl.on('line', handler);
	this.rl.prompt();
	return this;
};

ReadLine.prototype.close = function(){
	this.rl.close();
	return this;
};

exports.readline = function(){
	return new ReadLine();
};


// 把 alias 的路径 基于 paths 来转换
exports.getPathedAlias = function(buildConf){
	var buildUtil = exports;
	var real_alias = {};
	// 一般情况下 paths 是在需要不同域名时才用
	// 但也可以把 paths 作为 alias 之前的 alias
	if(buildConf.paths && Object.keys(buildConf.paths).length > 0){
		for(var pkey in buildConf.paths){
			real_alias[pkey] = buildConf.paths[pkey];
		}
		// alias 的路径部分可能会在paths中有过定义
		if(buildConf.alias && Object.keys(buildConf.alias).length > 0){
			for(var key in buildConf.alias){
				// 不能定义相同的 key
				if(real_alias[key]) vacation.log.error('[420][config file]: the key in alias('+key+') has defined in paths.');
				var pathedAlias = buildUtil.get_real_path_by_alias(buildConf.alias[key], buildConf.paths);
				// paths 是对路径的别名
				// alias 都是对具体文件的别名
				if(!pathedAlias.match(/\w+\.\w+$/)) pathedAlias += '.js';
				real_alias[key] = pathedAlias;
			}
		}
	}
	else if(buildConf.alias && Object.keys(buildConf.alias).length > 0){
		for(var key in buildConf.alias){
			var alias = buildConf.alias[key];
			// paths 是对路径的别名
			// alias 都是对具体文件的别名
			if(!alias.match(/\w+\.\w+$/)) alias += '.js';
			real_alias[key] = alias;
		}
	}

	var real_alias_rootPathed = {};
	var configFileDir = vacation.cli.configFileDir;
	buildUtil.each(real_alias, function(val, name){
		// alias 和 paths 在 seajs.config 中都是相对于 base 路径的
		real_alias_rootPathed[name] = buildUtil.isRemoteUri(val) ? val : pth.resolve(configFileDir, val);
	});
	//return real_alias;
	buildConf.real_alias = real_alias;
	buildConf.real_alias_rootPathed = real_alias_rootPathed;
};
/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

//var last = Date.now();

var vacation = module.exports = {};

vacation.require = function(){
	var name = 'vacation-' + [].slice.call(arguments, 0).join('-');
	try{
		return require(name);
	} catch(e) {
		e.message = 'Unable to load plugin [' + name + '], message : ' + e.messaeg;
	}
}

//system config
vacation.config = require('./kernel-lib/config.js');

//utils
//vacation.util = require('./kernel-lib/util.js');

////resource location
//vacation.uri = require('./kernel-lib/uri.js');

////project
//vacation.project = require('./kernel-lib/project.js');

////file
//vacation.file = require('./kernel-lib/file.js');

////cache
//vacation.cache = require('./kernel-lib/cache.js');

////compile kernel-lib
//vacation.compile = require('./kernel-lib/compile.js');

////release api
//vacation.release = require('./kernel-lib/release.js');

////package info
//vacation.info = fis.util.readJSON(__dirname + '/package.json');

////kernel version
//vacation.version = fis.info.version;

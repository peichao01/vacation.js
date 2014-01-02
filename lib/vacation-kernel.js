/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var vacation = module.exports = {};

// register global variable
Object.defineProperty(global, 'vacation', {
	enumerable: true,
	writable: false,
	value: vacation
});

vacation.require = function(){
	var name = 'vacation-' + [].slice.call(arguments, 0).join('-');
	try{
		return require('../' + name);
	} catch(e) {
		e.message = 'Unable to load plugin [' + name + '], message : ' + e.message;
        vacation.log.error(e);
	}
}

// log
vacation.log = require('./lib-kernel/log.js');

//utils
vacation.util = require('./lib-kernel/util.js');

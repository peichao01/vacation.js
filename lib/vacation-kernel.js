/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

//var last = Date.now();

//oo
Function.prototype.derive = function(constructor, proto){
    if(typeof constructor === 'object'){
        proto = constructor;
        constructor = proto.constructor || function(){};
        delete proto.constructor;
    }
    var parent = this;
    var fn = function(){
        parent.apply(this, arguments);
        constructor.apply(this, arguments);
    };
    var tmp = function(){};
    tmp.prototype = parent.prototype;
    var fp = new tmp(),
        cp = constructor.prototype,
        key;
    for(key in cp){
        if(cp.hasOwnProperty(key)){
            fp[key] = cp[key];
        }
    }
    proto = proto || {};
    for(key in proto){
        if(proto.hasOwnProperty(key)){
            fp[key] = proto[key];
        }
    }
    fp.constructor = constructor.prototype.constructor;
    fn.prototype = fp;
    return fn;
};

//factory
Function.prototype.factory = function(){
    var clazz = this;
    function F(args){
        clazz.apply(this, args);
    }
    F.prototype = clazz.prototype;
    return function(){
        return new F(arguments);
    };
};

var vacation = module.exports = {};

// register global variable
Object.defineProperty(global, 'vacation', {
	enumerable: true,
	writable: false,
	value: vacation
});

// log
vacation.log = require('./lib-kernel/log.js');

vacation.require = function(){
	var name = 'vacation-' + [].slice.call(arguments, 0).join('-');
	try{
		return require('../' + name);
	} catch(e) {
		e.message = 'Unable to load plugin [' + name + '], message : ' + e.messaeg;
        vacation.log.error(e);
	}
}

//system config
vacation.config = require('./lib-kernel/config.js');

//utils
vacation.util = require('./lib-kernel/util.js');

//resource location
vacation.uri = require('./lib-kernel/uri.js');

//project
vacation.project = require('./lib-kernel/project.js');

//file
vacation.file = require('./lib-kernel/file.js');

//cache
vacation.cache = require('./lib-kernel/cache.js');

//compile lib-kernel
vacation.compile = require('./lib-kernel/compile.js');

//release api
//vacation.release = require('./lib-kernel/release.js');

//package info
//vacation.info = fis.util.readJSON(__dirname + '/package.json');

//kernel version
//vacation.version = fis.info.version;

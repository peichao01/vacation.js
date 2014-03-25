/*
 * vacation
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var buildUtil = require('./lib/lib-build/util.js');
var Module = require('./lib/lib-build/Module');
var fns = require('./lib/functions');

exports.name = 'search';
exports.usage = '<command> [options]';
exports.desc = 'search modules';
exports.register = function (commander) {

	commander
		// 实质是在 配置文件中快速添加了一个 pkg 配置，并且默认会先删除 配置文件中所有的 pkg
		.option('-f, --file <RegExp>', buildUtil.format_commander('one module that need to find which module dependency on it.'))
		.option('-o, --output [filename]', buildUtil.format_commander('file to output the result.'), 'search_result.txt')
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var cli = vacation.cli,
				conf = cli.config.build;

			fns.dealConfig(conf);
			fns.dealOptions(options, conf);
			fns.dealPkg(options, conf);
			fns.dealEmitter(conf);
		});
};
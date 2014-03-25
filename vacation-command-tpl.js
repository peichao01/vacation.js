/*
 * vacation
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var buildKernel = require('./lib/lib-build/kernel2.js');
var tplKernel = require('./lib/lib-tpl/kernel.js');
var buildUtil = require('./lib/lib-build/util.js');
var Module = require('./lib/lib-build/Module');
var fns = require('./lib/functions');

exports.name = 'tpl';
exports.usage = '<command> [options]';
exports.desc = 'deal the templates';
exports.register = function (commander) {

	commander
		.option('-o, --optimize', buildUtil.format_commander('optimize/uglify the modules that transported '
				+ 'or/and concated results.'))
		// 实质是在 配置文件中快速添加了一个 pkg 配置，并且默认会先删除 配置文件中所有的 pkg
		.option('-f, --file <RegExp>', buildUtil.format_commander('one or more files that need to deal.'))
		.option('-s, --autocheckout', buildUtil.format_commander('auto checkout TFS files if need.'))
		.option('-w, --watch', buildUtil.format_commander('watch and build templates'))
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();
			var cli = vacation.cli;
			var conf = cli.config.build;

			fns.dealConfig(conf);
			fns.dealOptions(options, conf);
			fns.dealPkg(options, conf);
			fns.dealEmitter(conf);

			buildUtil.setOptions(options);

			tplKernel.TPLBuild();
		});
};

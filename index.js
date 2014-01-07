/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var vacation = module.exports = require('./lib/vacation-kernel');
var buildUtil = require('./lib/lib-build/util');

var tools = ['build', 'server', 'init'];

var cli = vacation.cli = {};

cli.name = 'vacation';

cli.info = buildUtil.readJSON(pth.join(__dirname, 'package.json'));

cli.commander = null;

cli.cmd_cwd = process.cwd();

cli.tips = {
	initConfig: "\n\n or you can use [\"vacation init -c\"] to generate a template config file."
};

cli.configFileName = 'vacation.config.js';

cli.configFilePath = vacation.util.getConfigPath();

cli.configFileDir = cli.configFilePath && pth.dirname(cli.configFilePath);

cli.templateConfigFilePath = pth.join(__dirname, cli.configFileName);

cli.config = vacation.util.merge({
	build: {},
	server:{
		port: 8181,
		root: './',
		defaultFile:"index.html",
		rootRelative:"cwd"
	},
	contentType: {}
}, vacation.util.getConfig());

cli.help = function(){
	var content = [
			'',
			'  Usage:  ' + cli.name + ' <command>',
			'',
			'  Command:',
			''
		];

	tools.forEach(function(tool){
		var cmd = require('./vacation-command-' + tool);
		var name = vacation.util.pad(cmd.name || tool, 12);
		content.push('    ' + name + (cmd.desc || ''));
	});
	content = content.concat([
		'',
		'  Options:',
		'',
		'    -h, --help        output usage information',
		'    -v, --version     output the version number',
		''
	]);
	console.log(content.join('\n'));
};

cli.version = function(){
	var content = [
			'',
			'  v' + cli.info.version
		].join('\n');
	console.log(content);
};

cli.run = function(argv){
	
	var first = argv[2];
	if(argv.length < 3 || first === '-h' || first === '--help'){
		cli.help();
	} else if(first === '-v' || first === '--version'){
		cli.version();
	} else if(tools.indexOf(first) < 0){
		cli.help();
	} else {
		// register command
		var commander = cli.commander = require('commander');
		var cmd = vacation.require('command', argv[2]);
		//console.log(cmd);
		cmd.register(
			commander
				.command(cmd.name || first)
				.usage(cmd.usage)
				.description(cmd.desc)
		);
		commander.parse(argv);
	}
};

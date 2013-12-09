/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var vacation = module.exports = require('./lib/vacation-kernel');

var tools = ['build', 'server'];

// exports cli object
vacation.cli = {};

vacation.cli.name = 'vacation';

// commander object
vacation.cli.commander = null;

// package.json
vacation.cli.info = vacation.util.readJSON(__dirname + '/package.json');
var confPath = vacation.cli.configFilePath = vacation.util.getConfigFilePath();
vacation.cli.configFileDir = pth.dirname(confPath);
if(!confPath) {
	vacation.log.error('no config file (vacation.json) founded.');
}
var config = vacation.cli.config = vacation.util.merge({
	server:{
		port: 8181,
		root: './',
		defaultFile:"index.html",
		rootRelative:"cwd"
	}
}, vacation.util.getConfig(confPath));

if(config.build.ignore) config.build.ignore = config.build.ignore.map(function(ignoreRegArr){
	return RegExp.apply(null, ignoreRegArr);
});
if(config.build.avaliable) config.build.avaliable = config.build.avaliable.map(function(avaliableRegArr){
	return RegExp.apply(null, avaliableRegArr);
});
config.cmd_cwd = process.cwd();

// output help info
vacation.cli.help = function(){
	var content = [
			'',
			'  Usage:  ' + vacation.cli.name + ' <command>',
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
		'    -V, --version     output the version number',
		''
	]);
	console.log(content.join('\n'));
};

vacation.cli.version = function(){
	var content = [
		'',
		'  v' + vacation.cli.info.version
	].join('\n');
	console.log(content);
}; 

function hasArgv(argv, search){
    var pos = argv.indexOf(search);
    var ret = false;
    while(pos > -1){
        argv.splice(pos, 1);
        pos = argv.indexOf(search);
        ret = true;
    }
    return ret;
}

// run cli tools
vacation.cli.run = function(argv){
	
	var first = argv[2];
	if(argv.length < 3 || first === '-h' || first === '--help'){
		vacation.cli.help();
	} else if(first === '-V' || first === '--version'){
		vacation.cli.version();
	} else if(tools.indexOf(first) < 0){
		vacation.cli.help();
	} else {
		// register command
		var commander = vacation.cli.commander = require('commander');
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
}

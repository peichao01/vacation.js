/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var vacation = module.exports = require('./lib/vacation-kernel');

var tools = ['build', 'server', 'init'];

var configFilePath = vacation.util.getConfigFilePath();
var info = vacation.util.readJSON(pth.join(__dirname, 'package.json'));
//console.log(configFilePath);process.exit(0);
vacation.cli = {
	name: 'vacation',
	commander: null,
	cmd_cwd: process.cwd(),
	info: info,
	tips: {
		initConfig: "\n\n or you can use [\"vacation init config\"] to generate a template config file."
	},
	templateConfigFilePath: pth.join(__dirname, 'vacation.json'),
	configFilePath: configFilePath,
	configFileDir: configFilePath && pth.dirname(configFilePath),
	config: vacation.util.merge({
		build: {},
		server:{
			port: 8181,
			root: './',
			defaultFile:"index.html",
			rootRelative:"cwd"
		},
		contentType: {}
	}, vacation.util.getConfig(configFilePath))
};

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
		'    -v, --version     output the version number',
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
// if(!configFilePath) {
// 	vacation.log.error('[410] no config file (vacation.json) founded.');
// }
var config = vacation.cli.config;

if(config.build.ignore) config.build.ignore = config.build.ignore.map(function(ignoreRegArr){
	return RegExp.apply(null, ignoreRegArr);
});
if(config.build.avaliable) config.build.avaliable = config.build.avaliable.map(function(avaliableRegArr){
	return RegExp.apply(null, avaliableRegArr);
});

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
	} else if(first === '-v' || first === '--version'){
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

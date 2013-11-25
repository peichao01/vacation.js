/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var vacation = module.exports = require('lib/vacation-kernel');

var tools = ['build', 'server'];

vacation.config.merge({
	
});

// exports cli object
vacation.cli = {};

vacation.cli.name = 'vacation';

// commander object
vacation.cli.commander = null;

// package.json
vacation.cli.info = vacation.util.readJSON(__dirname + '/package.json');

// output help info
vacation.cli.help = function(){
	var content = [],
		prefix = 'vacation-command-',
		prefixLen = prefix.length;

	// build-in commands
	var deps = {};
	//'vacation-command-build': true,
	//'vacation-command-server': true
	tools.forEach(function(tool){
		deps['vacation-command-' + tool] = true;
	});

	vacation.util.merge(deps, vacation.cli.info.dependencies);
	// traverse
	vacation.util.map(deps, function(name){
		if(name.indexOf(prefix) === 0){
			name = name.substring(prefixLen);
			var cmd = vacation.require('command', name);
			name = fis.util.pad(cmd.name || name, 12);
			content.push('    ' + name + (cmd.desc || ''));
		}
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
		'  v' + fis.cli.info.version,
		'',
		'  vvv       vvv  aaaaaa      cccccccc    aaaaaa      ttt       iii    oooooo    nnnnnnnnnn ',
        '   vvv     vvv       aaa    ccccccccc        aaa tttttttttttt        ooo  ooo   nnnnnnnnnn ',
        '    vvv   vvv  aaaaaaaaa   ccc         aaaaaaaaa tttttttttttt  iii  ooo    ooo  nnn    nnn ',
        '     vvv vvv  aaa    aaa   ccc        aaa    aaa     ttt       iii  ooo    ooo  nnn    nnn ',
        '      vvvvv   aaa    aaaaa cccccccccc aaa    aaaaa   tttttttt  iii   ooo  ooo   nnn    nnnn',
        '       vvv     aaaaaaaaaaa  ccccccccc  aaaaaaaaaaa   tttttttt  iii    oooooo    nnn    nnnn'
	].join('\n');
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
		cmd.register(
			commander
				.command(cmd.name || first)
				.usage(cmd.usage)
				.description(cmd.desc)
		);
		commander.parse(argv);
	}
}

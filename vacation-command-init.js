/*
 * vacation 
 * http://vacation.peichao01.com/
 */

'use strict';

var pth = require('path');
var fs = require('fs');

var buildUtil = require('./lib/lib-build/util');

exports.name = 'init';
exports.usage = '<command> [options]';
exports.desc = 'init your project';
exports.register = function (commander) {

	commander
		.option('-s, --structure', 'init a dir structure for a new project.')
		.option('-c, --config', 'create a template config file in the current dir.')
		.option('-d, --directory <dir>', 'where to initialize a project.')
		.option('-f, --force', 'force to overwrite the file or directory.')
		.action(function(){
			var args = [].slice.call(arguments);
			var options = args.pop();
			var cmd = args.shift();

			var targetDir;
			if(options.directory){
				targetDir = pth.resolve(vacation.cli.cmd_cwd, options.directory);
			}
			else{
				targetDir = vacation.cli.configFileDir || vacation.cli.cmd_cwd;
			}

			var readline =require('readline');
			var rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			if(!options.config && !options.structure){
				commander.help();
				return;
			}

			question_yn(rl, "do you want to initialize a project at ["+targetDir+"]", function(yes){
				if(!yes){
					console.log('[TIP] use the -d option to change the project directory.');
				}
				else{
					if(options.config){
						var dir = targetDir;
						var targetConfigFilePath = pth.resolve(dir, vacation.cli.configFileName);
						if(fs.existsSync(targetConfigFilePath) && !options.force){
							vacation.log.error('config file has already exists('+targetConfigFilePath+'). if you want to overwrite it, use the -f option.');
						}
						else{
							try{
								var tplConfigContent = buildUtil.readFile(vacation.cli.templateConfigFilePath);
								buildUtil.writeFile(targetConfigFilePath, tplConfigContent);
								console.log('[CREATE]: ' + targetConfigFilePath);
							}
							catch(e){
								vacation.log.error('init config file failed. error: ' + e.message);
							}
						}

					}

					/**
					 * 结构：
					 * __resource
					 *  |__dest
					 *  | |__script
					 *  |__src
					 *    |__image
					 *    |__tpl
					 *    | |__lib
					 *    | |__module
					 *    | |__page
					 *    |__style
					 *    | |__common
					 *    | |__module
					 *    | |__page
					 *    |__script
					 *      |__lib
					 *      |__module
					 *      |__page
					 */
					if(options.structure){

						var s = {resource:{dist:{script:''},src:{image:'',tpl:{lib:'',module:'',page:''},style:{common:'',module:'',page:''},script:{lib:'',module:'',page:''}}}};
						iterateDir(targetDir, s, []).forEach(function(dir){
							vacation.util.mkdir_p(dir);
						});
					}
				}
				rl.close();
			});
		});
}

function question_yn(readline, question, callback){
	readline.question('\n '+question+'? y(yes) or n(no). ', function(answer){
		callback(answer == 'y' || answer == 'yes');
	});
}

function iterateDir(dir, o, dirsArr){
	buildUtil.each(o, function(val, name){
		if(val == ''){
			dirsArr.push(pth.resolve(dir, name));
		}
		else{
			iterateDir(pth.resolve(dir, name), val, dirsArr);
		}
	});
	return dirsArr;
}

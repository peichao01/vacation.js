module.exports = {
	build:{
		dest:"./dest",
		// src 的作用： 根据文件到 src 的相对路径生成 发布到 dest 目录时的路径
		src:"./src",
		base:"./src",
		www:"./",
		pkg:[
			{
				main:/main\.js$/,
				// $file 文件名，$pkg 包名
				dest_rule:"$file.js",
				sub:[
					{
						// $pkg 包名，$all 所有被打包文件的名字，用下划线分割
						dest_rule:"$pkg.js",
						contain:[
							/module_a\.js/,
							/module_b\.js/
						]
					}
				],
				except:[
					/\bjquery/,
					/\bunderscore/
				]
			}
		],
		paths:{},
		alias:{},
		//availableType:["js","css","html"],
		uglify:{
			banner:"/*! lastmodify: $$today('yyyy-mm-dd HH:MM:ss') */\n",
			mangle:{
				except:["require","exports","module"]
			}
		}
	},
	server:{
		port:8181,
		defaultFile:"index.html",
		root:"./",
		rootRelative:"cwd",
		allowOrigin:""
	},
	contentType:{
		json:"application/json"
	}
};

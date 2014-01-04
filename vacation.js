module.exports = {
	build:{
		dist:"./dist",
		/**
		 * [可选参数]
		 * 部署后 base 的位置，生成 package 的 id
		 * 默认值是将 base 到 src 的相对路径映射到 dist 目录
		 */
		//distBase: './dist',

		/**
		 *  src 的作用： 根据文件到 src 的相对路径生成 发布到 dist 目录时的路径
		 */
		src:"./src",
		/**
		 *  [可选参数]
		 *  默认值是 src 的路径
		 */
		//base:"./src",

		/**
		 * [可选参数]
		 * 如果把路径设置为根路径，则需要这个配置
		 * 但不推荐使用根路径的方式，因为部署后的路径映射关系很可能是不能掌控的
		 */
		//www:"./",

		pkg:[
			{
				main:/main\.js$/,
				/**
				 * 主包（入口模块所在的包）必须发布到 dist 目录内
				 *
				 * $pkg 包名，
				 * $file 文件名，
				 * $all 所有被打包文件的名字，用下划线分割
				 * $dir 入口模块到 src 目录的相对路径
				 */
				dist_rule:"$dir/$file.js",
				/**
				 * [可选参数]
				 */
				sub:[
					{
						/**
						 * 子包可以发布到任意目录
						 *
						 * $pkg 包名，
						 * $dir 使用上面变量的值，如果不想放到上面目录，可以继续使用相对路径或不使用变量，
						 * $all 同上
						 * e.g. "$dir/../$pkg.js"
						 * e.g. "some/dir/$pkg.js"
						 */
						dist_rule:"$pkg.js",
						contain:[
							/module_a\.js/,
							/module_b\.js/
						]
					}
				],
				/**
				 * [可选参数]
				 */
				except:[
					/\bjquery/,
					/\bunderscore/
				]
			}
		],
		/**
		 * 此处 paths 和 alias 的相对路径都是相对于此文件所在目录
		 * 线上环境，如果 paths 和 alias 有相对路径，是在哪个模块被引用就根据那个模块的规则来解析，所以不推荐在线上使用相对路径
		 */
		paths:{},
		alias:{},
		available:[],
		ignore:[
			// 部署目录
			"$dist",
			/^vacation\.js/,
			/^map\.json/,
			/\.md$/,
			// linux 隐藏文件
			/(^|\/)\./
		],
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

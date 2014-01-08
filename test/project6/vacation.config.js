module.exports = {
	build:{
		dist:"./resource/dist",
		/**
		 * [可选参数]
		 * 部署后 base 的位置，生成 package 的 id
		 * 默认值是将 base 到 src 的相对路径映射到 dist 目录
		 */
		//distBase: './resource/dist',

		/**
		 *  src 的作用： 根据文件到 src 的相对路径生成 发布到 dist 目录时的路径
		 */
		src:"./resource/src",
		/**
		 *  [可选参数]
		 *  默认值是 src 的路径
		 */
		base:"./resource/src/script",

		/**
		 * [可选参数]
		 * 如果把路径设置为根路径，则需要这个配置
		 * 但不推荐使用根路径的方式，因为部署后的路径映射关系很可能是不能掌控的
		 */
		//www:"./",

		pkg:[
			{
				/**
				 * [可选参数]
				 * 临时不使用这个配置，也不必删除，只需设置 hidden
 				 */
				//hidden: true,

				/**
				 * [可选参数]
				 * 入口文件夹 模式
				 * 默认值为 false -- 即入口文件模式
				 *
				 * 文件夹模式，只合并匹配到的文件夹的子级文件，推荐文件结构：
				 * 	main-modules
				 * 	  |__main.js -- 页面入口模块
				 * 	  |__main-widgets -- 入口模块相关的模块
				 * 	  | |__main-a.js
				 * 	  | |__ ...
				 * 	  |__detail.js
				 * 	  |__detail-widgets
				 * 	    |__detail-a.js
				 * 	    |__ ...
				 */
				isDir: true,

				/**
				 * default: SeaJS -- 不区分大小写
				 */
				//type: 'RequireJS',

				main:/script\/page$/,
				/**
				 * 主包（入口模块所在的包）必须发布到 dist 目录内
				 *
				 * $pkg 包名，
				 * $file 文件名 -- 文件夹模式的话，为匹配到的文件夹的名字
				 * $all 所有被打包文件的名字，用下划线分割 -- 文件夹模式的话，为所有入口文件的名字
				 * $dir 入口模块到 src 目录的相对路径
				 */
				dist_rule:"$dir/$file.js"
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
			/^index\.html/,
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

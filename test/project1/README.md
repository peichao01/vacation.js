在测试本例子之前，可以先  
1. 将 `project1/app/src/data` 文件夹删掉，  
2. 将 `project1/app/tpl/.*.html.js$` 中的 所有 transported 的 templates(.html.js) 删掉
3. 将 `project1/app/transport` 目录删掉


1. 尝试运行：`vacation build start`  
会提示：` [ERROR] [425-1] module(public/address.js) deps on ($project1\app\src\data\addr_data.js), but this file is not exists.`  
被依赖的 模块/文件 没有找到，此时可以根据提示建立一个对应路径的文件  
（随便什么内容，本来这个文件也不是标准的 CMD 模块）  

2. 再次运行上面的命令  
会提示：` [ERROR] [425-1] module(Modules/HotelSelect.js) deps on (E:\vacation\test\project1\app\src\tpl\detail\hotel_room_list.html.js), but this file is not exists.`  
还是被依赖的模块没有找到，但是根据后缀名可以发现这是一个 transport之后的模板文件。  

3. 运行：`vacation build tpl`  
此命令有两个可用参数：
```html
-o, --optimize           optimize/uglify the modules that transported
      or/and concated results.
-w, --watch              [tpl only] watch and build templates
```
此时，可以什么参数都不用，直接运行。
然后，命令行会有如下输出：
```
[TRANSPORT] template(tpl/Modules/ProductPreviewManager.html) transported.
[TRANSPORT] template(tpl/detail/big_order.html) transported.
...
```
然后在提示的目录中就可以看到与模板文件并列的 `.html.js`(transported-template) 文件了。

4. 再次运行：`vacation build start`  
如果不出意外，会安全的执行完毕。如果有错误，如语法错误等，会有详尽的提示。  

5. 尝试加一个选项：`vacation build start -m`  
遍历整个开发目录，并对所有模块的情况做一个汇总信息，  
写入到 配置文件所在目录：`$configFileDir/map.json`  
可以看到模块的概况，如：
```json
"Modules/HotelSelect.js": {
    "uri": "E:\\vacation\\test\\project1\\app\\src\\Modules\\HotelSelect.js",
    "id": "Modules/HotelSelect.js",
    "type": "js",
    "idType": "top",
    "inBase": true,
    "inSrc": true,
    "cmd": 0,
    "deps": [
        "jquery",
        "underscore",
        "lib/inherit.js",
        "public/EventEmitter.js",
        "detail/mod_util.js",
        "Modules/SelectBase.js",
        "Interface/IDetailPageOrderComponent.js",
        "tpl/detail/hotel_room_list.html.js"
    ]
}
```

6. 再次增加一个选项：`vacation build start -mt ../transport`  
此时，会提示 `the dir that provided[...] by option `transport` does not exists.`  
新建一个 `transport` 目录即可，注意路径。  
之后，可以查看 transport 之后的模块文件。  

7. 测试合并文件：`vacation build start -mc`
如果不出意外，打包合并后的文件会写入到 配置文件中 dest 目录所对应的目录结构中  

8. 打包合并，并压缩文件：`vacation build start -mco`

9. `vacation build start -cmoT`  
tempalte-only，即，即便 `.html.js` 文件存在，并且依赖此模块，  
也使用模板源文件 `.html` 如果存在的话。  

10. `vacation build start -cmoTC`  
之前，可能一直都会看到一条提示：  
`[CSS NOT CONCAT]: E:\vacation\test\project1\app\src\style\v_detail.css`  
因为 CSS 文件默认不会被打包，如果指定 `-C` 选项，则会将 CSS 内容打包进来。  
因为是使用 `seajs-style` 的插件，所以会先将 `seajs-style` 打包进来。  

11. `vacation build start -cmoTCH 2`  
预编译 Handlebars 模板

12. `vacation build start -cmoTCH 3`  
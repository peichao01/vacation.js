/*
* @Author xhjin
* @CreateDate  2013/10/17
* @Desc  地址联动
<div id="test1" data-address-value='上海市,上海市,黄浦区'>
</div>
seajs.use('..../address.js', function(main) {
main.init({id:"#test1",type:"panel"});
});

1,赋值
data-address-value 有值的时候 会进行初始化
main.set("#test1","上海市,上海市,黄浦区",","); 

2,取值
main.get("#test1",","); //默认返回 组合 上海,上海市,黄浦区
获取data-address-value 直接返回中间带逗号

*/

define("public/address.js", ["data/addr_data.js"], function (require, exports, module) {
    var my_addr_data = require("../data/addr_data");
    function address(options, interfaces, parent) {
        //预先处理
        if (typeof options == "string") options = { target: options }
        if (typeof options.target == "string") options.target = document.getElementById(options.target);
        var defaults = { placeholder: "" }, opt = this.options = options, self = this;
        this.parent = opt.parent = parent || opt.parent;
        this.target = opt.target;
        if (this.parent) this.parent.list.push(this);
        this.list = [];
        this.interfaces = this._interfaces(interfaces);
        for (var i in defaults) opt[i] = opt[i] || opt[i];
        address.list.push(this);
    }
    address.prototype = {
        constructor: address,
        init: function () {
            this.change(true); //默认值清空
            this.trigger("init");
            this.fire("init");
        },
        change: function (change) {//默认值
            change = change || (this.data ? false : true), dv = this.options.value;
            if (change) {
                this.data = this.get(); this.value = "";
                this.filter = this.data[1];
                this.data = this.data[0];
            }
            if (this.data.length < 1) this.value = "";
            else if (this.data.length == 1) {
                this.value = this.data[0].value;
            }
            else if (dv) {
                for (var i = 0, len = this.data.length; i < len; i++) {
                    if (this.data[i].value == dv) { this.value = dv; break; }
                };
            }
            this.trigger("draw", [this.data, this.filter, change]);
            if (this.value) this.fire("change", [true]); //如果有选中的值 继续往下走
        },
        clear: function () {
            this.value = ""; this.data = null, this.filter = [];
            this.trigger("draw", [[], [], true]);
            this.fire("clear");
        },
        show: function (only) {
            if (only !== false) address.hide(); if (!this.data) return;
            if (this.data.length < 2) return this.fire("show");
            this.trigger("show");
        },
        hide: function () {
            this.trigger("hide");
        },
        "set": function (value, show) {
            value = value || "";
            this.hide();
            if (value != this.value) {
                this.value = value;
                this.fire("clear");
                this.change();
                if (show) this.fire("show");
            }
            this.trigger("set", [value]);
            return this;
        },
        fire: function (type, p) {
            for (var i = 0, len = this.list.length; i < len; i++) {
                this.list[i][type].call(this.list[i], p);
            };
        },
        trigger: function (type, p) {
            return this.interfaces[type] && this.interfaces[type].apply(this, p || []);
        },
        _interfaces: function (interfaces) {//定义必须要实现的接口
            var f = {
                init: function () { throw new Error('init:方法未定义'); },
                draw: function () { throw new Error('draw:方法未定义'); },
                show: function () { throw new Error('show:方法未定义'); },
                hide: function () { throw new Error('hide:方法未定义'); },
                "set": function () { throw new Error('set:方法未定义'); }
            };
            for (var i in interfaces) f[i] = interfaces[i];
            return f;
        },
        "get": function () {
            var list = [], p = this.parent;
            while (p) {
                list.unshift(p.value || "");
                p = p.parent;
            };
            return address.get.apply(address, list || []);
        }
    }
    address.add = function (options, interfaces, parent) {
        return new address(options, interfaces, parent);
    }
    address.init = function () {
        for (var i = 0, len = this.list.length; i < len; i++) {
            var o = this.list[i];
            if (o._is_init) continue; o._is_init = true;
            if (!o.parent) o.init();
            o.options.value = ""; //默认值清空
        };
    }
    address.list = [];
    address.hide = function () {
        this.trigger("hide");
    }
    address.trigger = function (type, p) {
        for (var i = 0, len = this.list.length; i < len; i++) {
            var o = this.list[i]; o && o[type] && o[type].apply(o, p || []);
        };
    }
    address.get = function () {//返回标准的list[{text:value}]
        var data = this.data(), result = [[], []];
        for (var i = 0, len = arguments.length; i < len; i++) {
            result[1].unshift({ text: arguments[i], value: arguments[i] });
            if ((!data) || data instanceof Array) {
                data = null;
                break;
            }
            if (!data[arguments[i]]) {
                data = null;
                break;
            }
            data = data[arguments[i]];
        }
        data = data || {};
        if (data instanceof Array) {
            for (var i = 0, len = data.length; i < len; i++) result[0].push({ text: data[i], value: data[i] });
        }
        else {
            for (var k in data) {
                if (!data.hasOwnProperty(k)) continue;
                result[0].push({ text: k, value: k });
            }
        }
        return result;
    }
    address.data = function () { return my_addr_data.addr_data || []; }
    address.writeCSS = function (id, css) {
        css += " ";
        var styleE = document.getElementById(id), styleSheet;
        var styleSheets = document.styleSheets;
        for (var i = styleSheets.length - 1; i > -1; i--) {
            var st = styleSheets[i];
            if ((st.ownerNode && st.ownerNode.id == id) || st.id == id) styleSheet = styleSheets[i];
        }
        if (!(styleE || styleSheet)) {
            var head = document.getElementsByTagName("head")[0];
            styleE = document.createElement("style");
            styleE.setAttribute("type", "text/css");
            styleE.setAttribute("id", id);
            styleE.setAttribute("media", "screen");
            head.appendChild(styleE);
            styleSheet = document.styleSheets[document.styleSheets.length - 1];
        }
        if (styleSheet && document.createStyleSheet) styleSheet.cssText = css;
        else if (styleE && document.getBoxObjectFor) styleE.innerHTML = css;
        else {
            var cns = styleE.childNodes;
            for (var i = cns.length - 1; i > -1; i--) {
                cns[i].parentNode.removeChild(cns[i]);
            }
            styleE.appendChild(document.createTextNode(css));
        }
    };

    var $c = $;
    var $ = jQuery;
    var handler = {
        init: function (options) {
            var $content = $(options.id), oc = (options.type == "select") ? this.select : this.panel;
            $content.html(oc.templete).addClass("v_address"); ;
            var $cs = $content.children();
            var $o1 = address.add({ target: $cs.eq(0), placeholder: "选择省" }, oc.interfaces);
            var $o2 = address.add({ target: $cs.eq(1), placeholder: "选择市" }, oc.interfaces, $o1);
            var $o3 = address.add({ target: $cs.eq(2), placeholder: "选择区" }, oc.interfaces, $o2);
            address.init();
            $content.data("address", [$o1, $o2, $o3]);

            $(document).off(".address").on("click.address", function () {
                address.hide();
            });
            if (options.type == "panel") {
                address.writeCSS("addressStyle", [
					".v_address{font-size: 12px;}",
					".v_address a{color: #0066cc;text-decoration: none;}",
					".v_address .m_item{float: left;padding-right: 5px;}",
					".v_address .ico_drop{padding-right: 15px;background-position: right -736px;cursor: pointer;display: inline-block;background-position: 0 -9999em;background-repeat: no-repeat;}",
					".v_address .m_input {height: 18px;padding-left: 3px;margin-right: 5px;line-height: 18px;border: 1px solid #b4b4b4;box-shadow: 1px 1px 3px #ddd inset;vertical-align: middle;font-family: Arial;}",
					".v_address .m_input:focus{background-color:#F1F9FF;border-color:#5D9DE5 #67A1E2 #67A1E2 #5D9DE5;box-shadow:1px 1px 3px #D0DEE6 inset;}",
					".v_address .w02{width: 110px;}",
					".v_address .m_address_box {border: 1px solid #999;padding: 10px;background-color: #fff;width: 400px; position: absolute; font-size: 9pt; z-index: 9999;}",
					".v_address .m_address_bd{max-height:300px;min-height:1px;overflow-y:auto;*zoom:1;}",
					".v_address .m_address_bd a{float:left;width:27%;*width:26.5%;margin-right:3%;padding:0 1.4%;border:1px solid #fff;line-height:22px;*zoom:1;overflow:hidden;height:25px}",
					".v_address .m_address_bd a:hover{background-color:#E8F4FF;border-color:#acccef;text-decoration:none;}",
					".clearfix:{zoom: 1;}",
					'.clearfix:after {display: block;clear: both;visibility: hidden;height: 0;content: ".";overflow: hidden;}'
				].join("\r\n"));
            }

            if ($content.attr("data-address-value")) handler.set($content, $content.attr("data-address-value"), ",");

            return this;
        },
        get: function ($content, placeholder) {
            return $.map(($($content).data("address") || []), function (o) {
                return o.value;
            }).join(placeholder || "");
        },
        set: function ($content, value, placeholder) {
            if (placeholder && typeof value == "string") value = value.split(placeholder);
            if (!(value instanceof Array)) return;
            var cs = $($content).data("address") || []; if (cs.length < 1) return;
            $.map(cs, function (o, index) {
                o.set((value[index] || ""));
            });
        },
        panel: {
            templete: '<div class="m_item"><input readonly="readonly" type="text" class="m_input w02 ico_drop" ><span>省</span></div><div class="m_item"><input readonly="readonly" type="text" class="m_input w02 ico_drop" ><span>市</span></div><div class="m_item"><input  type="text" class="m_input w02 ico_drop" ><span>区</span></div>',
            interfaces: {
                "set": function (value) {
                    var $p = $(this.target.parent());
                    $p.attr("data-address-value", handler.get($p, ","));
                },
                hide: function () {
                    this.selection && this.selection.hide();
                },
                show: function () {
                    this.selection && this.selection.show();
                }, //data 当前需要渲染的数据 filter 父级筛选条件
                draw: function (data, filter, change) {//change 表示内容是否发生改变
                    var self = this, data = data || [];
                    if (!self.target) return;
                    if (!self.selection) {
                        self.selection = $("<div class='m_address_box clearfix'></div>").appendTo($(self.target)).hide().click(function (event) {
                            var a = $(event.target);
                            if (a.is("a")) {
                                self.set(a.text(), true); //被赋值的时候 可能会触发子级的draw  寻找到下一个并且给与立即展示
                                return false;
                            }
                        });
                    }

                    var result = ["<div class='m_address_bd'>"];
                    for (var i = 0, len = data.length; i < len; i++) {
                        result.push('<a href="javascript:void(0);" title="' + data[i].text + '" style="color:' + ((data[i].value == this.value) ? "red" : "black") + ';">' + data[i].text + '</a>');
                    };
                    result.push("</div>");
                    self.selection.html(result.join(""));
                    this.target && $(this.target).children("input").val(this.value);


                    if (self.options.placeholder == "选择区") {//对选择区 做下特殊处理
                        $(self.target).show();
                        if (data.length < 1) $(self.target).hide();
                    }
                    var offset = $(self.target).offset();
                    self.selection.css({ left: offset.left, top: offset.top + 25 });
                },
                init: function () {//对象被初始化之后 调用
                    var self = this, opt = this.options;
                    if (this.target) {
                        $(this.target).click(function () {
                            self.show();
                            return false; //阻止冒泡
                        }).children("input").attr("placeholder", opt.placeholder);
                    }
                    self.hide();
                }
            }
        },
        select: {
            templete: '<select id="provice"></select><select id="city"></select><select id="area"></select>',
            interfaces: {
                "set": function (value) {//将值保存到属性内
                    var $p = $(this.target.parent());
                    $p.attr("data-address-value", handler.get($p, ","));
                },
                hide: function () { },
                show: function () { },
                draw: function (data, filter, change) {//change 表示内容是否发生改变
                    var self = this, data = data || [];
                    if (!self.target) return;
                    var result = [];
                    for (var i = 0, len = data.length; i < len; i++) {
                        result.push('<option value="' + data[i].value + '">' + data[i].text + '</option>');
                    };
                    if (self.options.placeholder) result.unshift('<option value="">' + self.options.placeholder + '</option>');
                    $(self.target).html(result.join("")).val(this.value || "");

                    if (self.options.placeholder == "选择区") {//对选择区 做下特殊处理
                        $(self.target).show();
                        if (data.length < 1) $(self.target).hide();
                    }
                },
                init: function () {
                    var self = this, opt = this.options;
                    if (this.target) {
                        $(this.target).change(function () {
                            self.set($(this).val(), true);
                        });
                    }
                }
            }
        }
    };
    module.exports = handler;
});
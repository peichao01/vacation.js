;
(function() {
    var app = {
        common: {
            /**
             * $(document).ready()
             */
            domReady: (function() {
                var ie = !! (window.attachEvent && !window.opera);
                var wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);
                var fn = [];
                var run = function() {
                    for (var i = 0; i < fn.length; i++) fn[i]();
                };
                return function(f) {
                    if (!ie && !wk && document.addEventListener)
                        return document.addEventListener('DOMContentLoaded', f, false);
                    if (fn.push(f) > 1) return;
                    if (ie) {
                        (function() {
                            try {
                                document.documentElement.doScroll('left');
                                run();
                            } catch (err) {
                                setTimeout(arguments.callee, 0);
                            }
                        })();
                    } else if (wk) {
                        var t = setInterval(function() {
                            if (/^(loaded|complete)$/.test(document.readyState))
                                clearInterval(t), run();
                        }, 0);
                    }
                };
            })(),
            /**
             * 添加CSS Style 方法
             */
            addSheet: function() {
                var doc, cssCode;
                if (arguments.length == 1) {
                    doc = document;
                    cssCode = arguments[0]
                } else if (arguments.length == 2) {
                    doc = arguments[0];
                    cssCode = arguments[1];
                } else {
                    return false;
                }
                if (!+"\v1") { //增加自动转换透明度功能，用户只需输入W3C的透明样式，它会自动转换成IE的透明滤镜
                    var t = cssCode.match(/opacity:(\d?\.\d+);/);
                    if (t != null) {
                        cssCode = cssCode.replace(t[0], "filter:alpha(opacity=" + parseFloat(t[1]) * 100 + ")")
                    }
                }
                cssCode = cssCode + "\n"; //增加末尾的换行符，方便在firebug下的查看。
                var headElement = doc.getElementsByTagName("head")[0];
                var styleElements = headElement.getElementsByTagName("style");
                if (styleElements.length == 0) { //如果不存在style元素则创建
                    if (doc.createStyleSheet) { //ie
                        doc.createStyleSheet();
                    } else {
                        var tempStyleElement = doc.createElement('style'); //w3c
                        tempStyleElement.setAttribute("type", "text/css");
                        headElement.appendChild(tempStyleElement);
                    }
                }
                var styleElement = styleElements[0];
                var media = styleElement.getAttribute("media");
                if (media != null && !/screen/.test(media.toLowerCase())) {
                    styleElement.setAttribute("media", "screen");
                }
                if (styleElement.styleSheet) { //ie
                    styleElement.styleSheet.cssText += cssCode;
                } else if (doc.getBoxObjectFor) {
                    styleElement.innerHTML += cssCode; //火狐支持直接innerHTML添加样式表字串
                } else {
                    styleElement.appendChild(doc.createTextNode(cssCode))
                }
            },
            /**
             * 选择下个元素
             * @param  {html obj} node 相对元素
             * @return {html obj / null}      元素
             */
            nextElem: function(node) {
                node = node.nextSibling;
                if (node.nodeType == 1) return node;
                if (node.nextSibling) return this.nextElem(node);
                return null;
            },
            getElementsByClassName: function(searchClass, node, tag) {
                if (document.getElementsByClassName) {
                    return document.getElementsByClassName(searchClass)
                } else {
                    node = node || document;
                    tag = tag || "*";
                    var classes = searchClass.split(" "),
                        elements = (tag === "*" && node.all) ? node.all : node.getElementsByTagName(tag),
                        patterns = [],
                        returnElements = [],
                        current,
                        match;
                    var i = classes.length;
                    while (--i >= 0) {
                        patterns.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
                    }
                    var j = elements.length;
                    while (--j >= 0) {
                        current = elements[j];
                        match = false;
                        for (var k = 0, kl = patterns.length; k < kl; k++) {
                            match = patterns[k].test(current.className);
                            if (!match) break;
                        }
                        if (match) returnElements.push(current);
                    }
                    return returnElements;
                }
            },
            addEvent: function(obj, type, fn) {
                if (obj.addEventListener) {
                    obj.addEventListener(type, fn, false);
                } else if (obj.attachEvent) {
                    obj["e" + type + fn] = fn;
                    obj.attachEvent("on" + type, function() {
                        obj["e" + type + fn].call(obj, window.event);
                    });
                }
            },
            removeEvent: function(obj, type, fn) {
                if (obj.removeEventListener) {
                    obj.removeEventListener(type, fn, false);
                } else if (obj.detachEvent) {
                    obj.detachEvent("on" + type, obj["e" + type + fn]);
                    obj["e" + type + fn] = null;
                }
            },
            /**
             * 为了getCookie写的
             * @param  {string} str string
             */
            toReString: function(str) {
                var a = {
                    "\r": "\\r",
                    "\n": "\\n",
                    "\t": "\\t"
                };
                return str.replace(/([\.\\\/\+\*\?\[\]\{\}\(\)\^\$\|])/g, "\\$1").replace(/[\r\t\n]/g, function(b) {
                    return a[b]
                });
            },
            /**
             * 获取Cookie，可以获取二级的cokkie
             * @param  {string} a 一级cookie
             * @param  {string} b 二级cookie
             * @return {string}   cookie的value
             * @requires this.toReString();
             */
            getCookie: function(a, b) {
                var c = document.cookie.match(RegExp("(?:^|;)\\s*" + this.toReString(encodeURIComponent(a)) + "=([^;]+)"));
                if (!1 === b) return (c ? c[1] : null);
                c && b && (c = c[1].match(RegExp("(?:^|&)\\s*" + this.toReString(encodeURIComponent(b)) + "=([^&]+)")));
                return (c ? decodeURIComponent(c[1]) : null)
            },
            setCookie: function(c_name, value, exdays) {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + exdays);
                var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
                document.cookie = c_name + "=" + c_value;
            },
            delCookie: function(c_name) {
                var date = new Date();
                date.setTime(date.getTime() - 10000);
                document.cookie = c_name + "=v; expire=" + date.toGMTString();
            }
        },
        /**
         * popup初始化，判断是否百度的PPC和SEO渠道弹出这个浮层 -->
         * 添加HTML --> CSS --> JS --> 立即执行initFloat() --> 设置自动隐藏
         */
        popup: function() {
            var self = this;
            var domPopup;
            var domCloseBtn;

            return {
                init: function() {
                    var me = this;
                    self.common.domReady(function() {
                        if (me.isShowAppFloat()) {
                            // if (true) {
                            me.appendFloatHtml();
                            me.appendFloatCss();
                            me.appendFloatJs();
                            me.autoHide();
                        }
                    });
                },
                /**
                 * 验证是否需要显示app float
                 * 按照需求是百度的PPC和SEO渠道弹出这个浮层所有渠道过来，
                 * 共弹出5次浮层，cookie记录60天
                 * @return {Boolean}  是否显示float
                 */
                isShowAppFloat: function() {
                    var allianceID = self.common.getCookie('Union', 'AllianceID');
                    var httpRefer = document.referrer;

                    var strAppFloatCnt = self.common.getCookie('appFloatCnt');
                    var appFloatCnt;

                    if (strAppFloatCnt) {
                        appFloatCnt = parseInt(strAppFloatCnt, 10);
                    } else {
                        appFloatCnt = 0;
                    }
                    appFloatCnt += 1;

                    if (allianceID && allianceID.indexOf('4897') != -1 &&
                        httpRefer.indexOf('baidu.com') != -1 &&
                        appFloatCnt <= 5) {
                        self.common.delCookie('appFloatCnt');
                        self.common.setCookie('appFloatCnt', appFloatCnt, 60);
                        return true;
                    } else {
                        return false;
                    }
                },
                /**
                 * 添加HTMl到页面中
                 */
                appendFloatHtml: function() {
                    var NewLine = '\n';
                    var temp = '';
                    temp += '<input type="hidden" id="siteDomain" value="ctrip"/>' + NewLine;
                    temp += '<div id="float_level" class="app_wrap">' + NewLine;
                    temp += '    <div class="app_box">' + NewLine;
                    temp += '        <a href="javascript:;" class="app_close" title="关闭" onclick="this.parentNode.parentNode.style.display=\'none\';">&times;</a>' + NewLine;
                    temp += '        <div class="pic_phone"></div>' + NewLine;
                    temp += '        <div class="app_text">' + NewLine;
                    temp += '            <p class="t">' + NewLine;
                    temp += '                手机预订 <strong>更便宜</strong>' + NewLine;
                    temp += '            </p>' + NewLine;
                    temp += '            <p class="c">' + NewLine;
                    temp += '                订门票' + NewLine;
                    temp += '                <span>' + NewLine;
                    temp += '                    多返 <strong>¥ <dfn>5</dfn></strong>' + NewLine;
                    temp += '                </span>' + NewLine;
                    temp += '            </p>' + NewLine;
                    temp += '            <p class="c">' + NewLine;
                    temp += '                自由行套餐' + NewLine;
                    temp += '                <span>' + NewLine;
                    temp += '                    低至' + NewLine;
                    temp += '                    <strong><dfn class="emphasis">5</dfn></strong>' + NewLine;
                    temp += '                    折' + NewLine;
                    temp += '                </span>' + NewLine;
                    temp += '            </p>' + NewLine;
                    temp += '        </div>' + NewLine;
                    temp += '        <div class="app_cont">' + NewLine;
                    temp += '            <div class="app_form">' + NewLine;
                    temp += '                <div class="t">' + NewLine;
                    temp += '                    下载携程旅行手机版' + NewLine;
                    temp += '                    <a href="http://app.ctrip.com" target="_blank">' + NewLine;
                    temp += '                        <span>Pad</span>及手机网络版 &gt;' + NewLine;
                    temp += '                    </a>' + NewLine;
                    temp += '                </div>' + NewLine;
                    temp += '                <p>发送下载地址至手机</p>' + NewLine;
                    temp += '                <p class="s_item">' + NewLine;
                    temp += '                    <input id="phone_num" type="text" placeholder="请输入11位手机号" pl="请输入11位手机号"/>' + NewLine;
                    temp += '                    <a href="javascript:;" id="send_msg" class="btn01" title="" >免费获取</a>' + NewLine;
                    temp += '                </p>' + NewLine;
                    temp += '                <p id="show_msg" class="app_tip" style="display:none">' + NewLine;
                    temp += '                    <span class="ico_success"></span>' + NewLine;
                    temp += '                    发送成功，请注意查收短信' + NewLine;
                    temp += '                </p>' + NewLine;
                    temp += '                <p>直接下载</p>' + NewLine;
                    temp += '                <div class="app_download">' + NewLine;
                    temp += '                    <a target="_blank" href="http://itunes.apple.com/cn/app/xie-cheng-wu-xian-jiu-dian/id379395415?mt=8" class="btn_d">iPhone</a>' + NewLine;
                    temp += '                    <a href="http://download.ctrip.com/client/app/ctrip_510_9120.apk" class="btn_d" id="android_popup">Android</a>' + NewLine;
                    temp += '                </div>' + NewLine;
                    temp += '            </div>' + NewLine;
                    temp += '            <div class="app_code">' + NewLine;
                    temp += '                <p>扫描二维码下载</p>' + NewLine;
                    temp += '                <img src="http://pic.c-ctrip.com/index/qr_vacation.png" />' + NewLine;
                    temp += '            </div>' + NewLine;
                    temp += '        </div>' + NewLine;
                    temp += '    </div>' + NewLine;
                    temp += '    <div class="app_collect">' + NewLine;
                    temp += '        收藏Ctrip.com，以便下次快速访问' + NewLine;
                    temp += '        <a href="javascript:popUp.addfavor(&#39;http://www.ctrip.com/?s3&#39;,&#39;携程旅行网&#39;)" class="s_btn">点击收藏</a>' + NewLine;
                    temp += '    </div>' + NewLine;
                    temp += '</div>' + NewLine;


                    var wrap = document.createElement('div');
                    wrap.innerHTML = temp;
                    var input = wrap.childNodes[0];
                    var popup = self.common.nextElem(input);
                    document.body.appendChild(input);
                    document.body.appendChild(popup);
                },
                /**
                 * 添加Class
                 */
                appendFloatCss: function() {
                    var me = this;
                    self.common.addSheet("\
                            #float_level.app_wrap input, #float_level.app_wrap p{margin:0;padding:0;}
                            #float_level a{color:#06c;text-decoration:none;}\
                            #float_level a:hover{text-decoration:underline;}\
                            #float_level .s_btn, #float_level .s_btn_disabled{width:145px; height:33px;  color:#fff; font-size:16px; font-family: 'Microsoft YaHei', SimSun, Tahoma, Verdana, Arial, sans-serif; font-weight:bold; cursor:pointer;  text-align: center; letter-spacing: 0.4em;text-indent:0.4em;box-shadow:0 1px 0 rgba(95,50,0,0.7); border-radius:3px; *filter:chroma(color=#000000);}\
                            #float_level .s_btn{text-shadow:1px 1px 0 #cf7000;background-color:#ffb000;border:solid 1px #e77c00;}\
                            #float_level .s_btn_disabled{color:#999;background-color:#efefef;border:solid 1px #ccc;cursor:default;}\
                            #float_level .s_item input, #float_level .s_item2 input, #float_level .s_item3 input{width:140px; padding-left:3px;margin-left:10px; border-color:#bbb #ddd #ddd #bbb; border-style:solid; border-width:1px; height:28px; font:14px/28px 'Microsoft YaHei', SimSun, Tahoma, Verdana, Arial, sans-serif;*vertical-align:middle;outline:none;color:#333;box-shadow:1px 1px 1px #ddd inset;}\
                            #float_level.app_wrap{position:fixed;z-index:999;top:auto;bottom:0;width:100%;height:222px;background:url(http://pic.c-ctrip.com/index/bg_mask20131029.png) repeat-x 0 -225px;_position:absolute;_background:#1E2939;}\
                            #float_level .app_box{position:relative;z-index:1;width:980px;height:185px;margin:0 auto;}\
                            #float_level .pic_phone, #float_level .ico_success, #float_level .ico_alert{background:url(http://pic.c-ctrip.com/index/un_app.png) no-repeat;}\
                            #float_level .ico_success,#float_level .ico_alert{display:inline-block;width:16px;height:16px; margin:0 3px 0 0; vertical-align:middle;}\
                            #float_level .ico_success{background-position:-25px -210px;}\
                            #float_level .ico_alert{background-position:-45px -210px;}\
                            #float_level .pic_phone{position:absolute;top:-20px;left:0;width:145px;height:198px;background-position:0 0;}\
                            #float_level .app_close{position:absolute;top:10px;right:0;font:normal 38px Simsun;color:#9AA1A8;outline:0 none;}\
                            #float_level .app_close:hover{text-decoration:none;}\
                            #float_level .app_text{position:absolute;top:23px;left:155px;width:340px;font-family:'microsoft yahei';color:#FFF;}\
                            #float_level .app_text .t{font-size:38px;}\
                            #float_level .app_text .t strong{margin-left:10px;}\
                            #float_level .app_text .t2{font-size:30px;}\
                            #float_level .app_text .t2 strong{margin-left:15px;}\
                            #float_level .app_text .c{line-height:1.2;font-size:26px;}\
                            #float_level .app_text .c span{margin-left:10px;color:#FF8300;}\
                            #float_level .app_text .c dfn{font-style:normal;font-size:28px;font-family:Tahoma;}\
                            #float_level .app_text .c .emphasis{vertical-align:-2px;font-size:32px;}\
                            #float_level .app_text .c2{margin:-65px 0 -20px;font-size:36px;color:#FF8300;}\
                            #float_level .app_text .c2 span{font-weight:bold;font-size:90px;font-style:italic;font-family:Tahoma;}\
                            #float_level .app_text .c3{font:18px 'Microsoft Yahei';color:#899cb8;}\
                            #float_level .app_cont{position:absolute;top:0;left:495px;width:385px;height:170px;padding:15px 25px 0 30px;color:#FFF;background:url(http://pic.c-ctrip.com/index/bg_mask20131029.png) repeat-x 0 -35px;_background:#49535F;}\
                            #float_level .app_form{float:left;width:270px;}\
                            #float_level .app_form .t{margin-bottom:8px;font:normal 16px 'Microsoft Yahei';}\
                            #float_level .app_form .t a{margin-left:10px;font-size:12px;font-family:Tahoma;color:#FFF;}\
                            #float_level .app_form .t a span{font-size:14px;}\
                            #float_level .app_form .s_item{width:auto;margin:3px 0;}\
                            #float_level .app_form .s_item input{margin:0 10px 0 0;vertical-align:middle;}\
                            #float_level .btn01, #float_level .btn01_disabled{display:inline-block;padding:0 15px;height:26px;line-height:26px;vertical-align:middle;background:#2277cc;border-radius:3px;box-shadow:0 1px 0 #0D2E6F;font-family:'simsun';color:#fff;font-size:12px;cursor:pointer;}\
                            #float_level .btn01:hover{background:#2299FF;text-decoration:none;}\
                            #float_level .btn01_disabled,#float_level .btn01_disabled:hover{text-decoration:none;cursor:default;background-color:#D1D1D1;box-shadow:0 1px 0 #333;}\
                            #float_level .app_download{position:relative;margin-top:3px;_zoom:1;}\
                            #float_level .app_download .btn_d{display:inline-block;padding:3px 15px;margin-right:8px;vertical-align:middle;font:normal 16px Tahoma;color:#FFF;border:1px solid #FFF;border-radius:3px;box-shadow:0 1px 0 #09214A;}\
                            #float_level .app_download .btn_d:hover{text-decoration:none;color:#555E6B;background-color:#FFF;}\
                            #float_level .app_tip{margin-bottom:3px;color:#B1B1B1;}\
                            #float_level .app_android{position:absolute;left:82px;bottom:-7px;*left:84px;width:80px;padding:0 10px 10px;text-align:center;font:normal 16px Tahoma;color:#555E6B;border:1px solid #D6D6D6;background-color:#FFF;}\
                            #float_level .app_android a{display:block;height:26px;margin-top:10px;line-height:26px;border:1px solid #d1d1d1;border-radius:3px;background-color:#fcfcfc;color:#2577E3;text-align:center;box-shadow:0 1px 1px rgb(209,209,209);font-size:12px;font-family:SimSun;cursor:pointer;*filter:chroma(color=#000000);}\
                            #float_level .app_android a:hover{text-decoration:none;background-color:#06c;color:#fff;border-color:#06c;}\
                            #float_level .app_android span{display:block;margin-top:10px;}\
                            #float_level .app_code{float:right;padding-top:20px;}\
                            #float_level .app_code p{margin-bottom:3px;}\
                            #float_level .app_collect{height:38px;text-align:center;font:normal 16px/38px 'Microsoft Yahei',Tahoma;color:#FFF;background-color:#000;}\
                            #float_level .app_collect .s_btn{height:26px;margin-left:15px;padding:0 10px;line-height:26px;letter-spacing:0;font-weight:normal;font-size:15px;text-shadow:none;}\
                            #float_level .app_collect .s_btn:hover{text-decoration:none;}\
                    ");
                },
                /**
                 * 添加javascript，然后运行它
                 * 因为需要有个回调函数，下载好JS，立即执行，这里使用setTimeout
                 */
                appendFloatJs: function() {
                    var x = document.createElement("SCRIPT");
                    x.src = "http://webresource.c-ctrip.com/ResCRMOnline/r10/js/float/float.min.js?ws_testp20131107.js";
                    x.defer = true;
                    document.getElementsByTagName("HEAD")[0].appendChild(x);

                    setTimeout(function() {
                        initFloat('vacation');
                    }, 2000);
                },
                /**
                 * 默认时间30秒，如果用户30秒内鼠标没有移动到浮层内，浮层自动关闭。如果30秒内鼠标移动到浮层，则不再自动关闭。
                 * 使用一个setTimeout，然后30秒后就隐藏，划入后则清掉这个影藏function
                 */
                autoHide: function() {
                    domPopup = document.getElementById('float_level');
                    domCloseBtn = self.common.getElementsByClassName('app_close', domPopup, 'a')[0];

                    var timeId = setTimeout(function() {
                        domCloseBtn.click();
                    }, 30000);

                    self.common.addEvent(domPopup, 'mouseover', function(e) {
                        clearTimeout(timeId);
                        self.common.removeEvent(domPopup, 'mouseover', arguments.callee);
                    });
                }
            }
        },
        init: function() {
            var self = this;
            self.popup().init();
        }
    }

    app.init();

})();
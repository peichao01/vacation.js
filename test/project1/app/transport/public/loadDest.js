/**
 * loadDest
 * @author hybu@ctrip.com
 * @CreateDate  2013/11/14
 */
define("public/loadDest.js", ["jquery"], function(require, exports, module) {
    var $ = require('../../../lib/jquery');

    var HotDest = {
        common: { //公用的函数
            render: function(tpl, data, handle, cb) {
                var Template = Handlebars.compile(tpl);
                var html = Template(data);
                typeof handle === 'function' && handle.call(this, html);
                typeof cb === 'function' && cb.call(this, html);
                return html;
            },
            fetchData: function(opts, cb) { //ajax
                var self = this;
                $.ajax({
                    type: opts.method || 'GET',
                    url: opts.url || self.config.fetchUrl,
                    data: opts.data,
                    dataType: opts.type || 'json',
                    // timeout : 5000,
                    success: function(data) {
                        cb.call(self, data);
                    },
                    error: function(msg) {
                        // alert(msg)
                    }
                });
            }
        },
        tpl: {
            channelHotJmp: '<div {{#if Right.PicUrl}}class="channel_hot_jmp"{{else}}class="channel_hot_jmp hot_no_pic"{{/if}} style="display:none; top:0;">\
                        <ul class="channel_hot_jmp_dest">\
                            {{#each Left}}\
                            <li>\
                                {{#if Url}}\
                                <h4><a href="{{trimUrl Url}}" target="_blank">{{Name}}</a></h4>\
                                {{else}}\
                                <h4>{{Name}}</h4>\
                                {{/if}}\
                                {{#if Children}}\
                                <div class="channel_link_wrap">\
                                    {{#each Children}}\
                                    <a href="{{trimUrl Url}}" target="_blank" {{#isHighLight IsHighLight}}class="orange"{{/isHighLight}}>{{Name}}</a>\
                                    {{/each}}\
                                </div>\
                                {{/if}}\
                            </li>\
                            {{/each}}\
                        </ul>\
                        {{#with Right}}\
                        {{#if PicUrl}}\
                        <div class="channel_jmp_img_wrap">\
                            {{#if SubjectUrl}}\
                            <a href="{{trimUrl SubjectUrl}}" target="_blank">\
                                <img src="{{trimUrl PicUrl}}" class="channel_jmp_img" alt="" />\
                            </a>\
                            {{else}}\
                            <img src="{{trimUrl PicUrl}}" class="channel_jmp_img" alt="" />\
                            {{/if}}\
                        </div>\
                        {{/if}}\
                        {{/with}}\
                    </div>'
        },
        /**
         * 首发城市
         * 点击首发城市按钮，显示影藏详情首发城市
         * @author hybu@ctrip.com
         * @CreateDate  2013/11/08
         * @see 同旅游度假首页代码v_index.js函数一致
         */
        startStation: function() {
            var self = this;
            var jStartStationBtn = $('#CitySelect');
            var jStationDetail;

            // 子页面隐藏input，每个子页面不同的domain value获取
            var domainValue = $('#ChannelDomain').val();
            // 每个子页面的page_id
            var pageId = $('#page_id').val();
            return {
                /**
                 * 一旦进入页面，就要获取加载浮动数据和层
                 * 获取后台拼出的HTML代码，并插入到相应位置
                 * 因为是动态生成的DOM，所以需要动态赋值jStationDetail
                 */
                init: function() {
                    var me = this;
                    var optData = {
                        startCity: $$.StartCity
                    };
                    if (domainValue) {
                        optData.domain = domainValue;
                    }
                    // 如果是search结果页和dest目的地页添加一个新的参数
                    // 103018 search结果页有结果
                    // 10300700 search结果页无结果
                    // 103083 dest目的地页有结果
                    // 103084 dest目的地页有结果
                    if (pageId == '103018' || pageId == '10300700' ||
                        pageId == '103083' || pageId == '103084') {
                        optData.ishref = 0;
                    }

                    // 获取后台拼出的HTML代码
                    self.common.fetchData({
                        url: '/Package-Booking-VacationsOnlineSiteUI/Handler/IndexHotStartCityNew.ashx',
                        // 有的页面没有domainValue，则不传domainValue
                        data: optData
                    }, function(response) {
                        jStartStationBtn.append(response);
                        // 动态生成HTML后动态赋值
                        jStationDetail = jStartStationBtn.find('>dd');
                        me.bind();
                    });
                },
                /**
                 * 绑定Button和Detail的Click事件
                 */
                bind: function() {
                    var me = this;
                    // 点击出发城市button，必须取消冒泡，阻止触发document一次性点击事件
                    jStartStationBtn.bind('click', function(event) {
                        event.stopPropagation();
                        event.preventDefault();
                        me.collapseChange();
                        // Channel页面添加功能，不能和热门目的地的浮出层重叠
                        self.channelHotDest().collapseHide();
                    });
                    // 点击出发城市详情浮出层，必须取消冒泡，阻止触发document一次性点击事件
                    jStationDetail.bind('click', function(event) {
                        event.stopPropagation();
                    });

                    // 如果是search结果页和dest目的地页，需要绑定link的运行方式
                    //  search结果页和dest目的地页分俩步走：
                    //  先使用resetCookie修改cokkie，然后用reloadUrl跳转页面
                    if (pageId == '103018' || pageId == '10300700' ||
                        pageId == '103083' || pageId == '103084') {
                        jStationDetail.delegate('a', 'click', function(event) {
                            me.resetCookie(this);
                            me.reloadUrl(this);
                        });
                    }
                },
                /**
                 * 添加删除jStartStationBtn上的city_spread达到隐藏显示详情浮出层
                 * .city_spread 用css方式控制浮动层display
                 * @return {void}
                 */
                collapseChange: function() {
                    if (jStartStationBtn.hasClass('city_spread')) {
                        jStartStationBtn.toggleClass('city_spread');
                    } else {
                        jStartStationBtn.toggleClass('city_spread');
                        // document一次性事件，隐藏出发城市详情浮出层
                        $(document).one('click', function(event) {
                            jStartStationBtn.removeClass('city_spread');
                        });
                    }
                },
                /**
                 * 隐藏浮出层，不能和热门目的地的浮出层重叠
                 * 此为对外接口，内部不用
                 */
                collapseHide: function() {
                    jStartStationBtn.removeClass('city_spread');
                },
                /**
                 * 重写cookie，找到链接的data-city的值，
                 * 修改cooke的StartCity_Pkg下的StartCity_Pkg值
                 * @param  {dom obj} elem 对应的链接<a>
                 */
                resetCookie: function(elem) {
                    var cityValue = elem.getAttribute('data-city');
                    if (cityValue) {
                        //保存cookie
                        //保证domain一致，server端才能获取到cookie的值
                        //add by xbfeng
                        var host = document.domain.toLowerCase();
                        var index = host.indexOf("vacations");
                        if (index >= 0) {
                            host = host.substring(index + 9);
                        }
                        cQuery.cookie.set("StartCity_Pkg", "PkgStartCity", cityValue, {
                            path: "/",
                            domain: host,
                            secure: ""
                        });
                    }
                },
                /**
                 * 刷新或者重定向url
                 * 如果是search结果页pageId == '103018' || pageId == '10300700'
                 * 这里埋个坑
                 * search结果页俩步走：先使用resetCookie修改cokkie，然后使用window.location.href修改跳转
                 * 硬地址中必定包含 /whole-\d+B/ 正则匹配 eg:whole-2B
                 * 修改B前数字为data-city值上面就是-2B的2(代表上海)，然后window.location.href跳转
                 * dest目的地页pageId == '103083' || pageId == '103084'
                 * dest目的地页俩步走：先使用resetCookie修改cokkie，然后使用window.location.reload()刷新
                 * @param  {dom obj} elem 对应的链接<a>
                 */
                reloadUrl: function(elem) {
                    var cityValue = elem.getAttribute('data-city');
                    var targetBlank = elem.getAttribute('target');
                    //dest目的地页
                    if (pageId == '103083' || pageId == '103084') {
                        if (targetBlank == "_blank") {
                            window.open(window.location.href);
                        } else {
                            window.location.reload();
                        }
                    } else if (pageId == '103018' || pageId == '10300700') {
                        //search结果页
                        if (cityValue) {
                            var href = window.location.href;
                            var reg = /whole-\d+B/;
                            if (reg.test(href)) {
                                href = href.replace(reg, 'whole-' + cityValue + 'B');
                                window.location.href = href;
                            } else {
                                href = 'http://' + window.location.host;
                                window.location.href = href;
                            }
                        } else {
                            if (targetBlank == "_blank") {
                                return;
                            } else {
                                window.location.reload();
                            }
                        }
                    }
                }
            }
        },
        /**
         * 子频道热门destination
         * 点击jDHotDest热门目的地按钮显示隐藏弹出层
         * 子频道这里的难点在于需要连续俩个Ajax请求，一环套一环
         * Hover显示隐藏详情热门destination
         * @author hybu@ctrip.com
         * @CreateDate  2013/11/08
         * @see 参照首页hotDest() v_index.js
         */
        channelHotDest: function() {
            var self = this;

            // 初始只有按钮存在，(作为按钮功能，但是为Wrap)，
            // 剩下的变量需要ajax返回值动态赋值
            var jDHotDest = $('#DHotDest');
            var jDetailPanel;
            var jContainer;
            var jPoints;
            var jSubitems;
            var jHotSearch;

            // 存放当前point对应键值表
            var oPoint = {};
            // 存放当前浮出层对应键值表
            var oSubitem = {};

            // 临时变量，前置声明
            var curKey = null;
            // 浮出层美化上移偏移量
            var spanHeight = 24;

            return {
                init: function() {
                    var me = this;
                    me.customHandlebars();
                    // 获取第一层浮出层的HTML代码然后嵌入到页面中
                    self.common.fetchData({
                        url: $$.Handler.HotDestFloatNew,
                        data: {
                            startCity: $$.StartCity,
                            module: "hotdest"
                        },
                        type: 'html'
                    }, function(response) {
                        jDHotDest.append(response);
                        // 此时动态赋值，所有第一层浮出层DOM元素已经存在
                        jDetailPanel = jDHotDest.find('>dd');
                        jContainer = jDetailPanel.find('.channel_destination_detail');
                        jPoints = jContainer.find('li[data-key]');
                        jHotSearch = jDetailPanel.find('.channel_hot_search');
                        // 获取二级浮动层subitems所有JSON数据
                        self.common.fetchData({
                            url: $$.Handler.HotDestFloatNew,
                            data: {
                                startCity: $$.StartCity
                            }
                        }, function(data) {
                            me.setDefault(data);
                            me.bind();
                            // 统计代码功能使用，辅助代码
                            me.anchorAttach();
                            me.overwriteCtmUrl();
                        });
                    });
                },
                /**
                 * 初始化各个公共数据，在获取JSON data后第一时间运行
                 * 核心在于：
                 * 1.第一时间输出模板数据到DOM树树
                 * 2.使用俩个字典object。point各个jquery包装li的指向，subitem各个jquery包装浮出层指向
                 * 3. 为每个模板创建出来的DOM添加一个Jquery data存放数据——data-key，
                 *    这个data-key就是同步的point的data-key，也是得到的JSON数据的每个Key。
                 *    这一步其实不需要，是为了后面的anchorAttach方法，
                 *    为每个link添加唯一的行列标示统计代码添加而写的。
                 * @param {JSON} oData 后台的subitem的数据
                 */
                setDefault: function(oData) {
                    var jCurDom;
                    var jTempWrap = $('<div></div>');
                    var dataKey;
                    $.each(oData, function(key, value) {
                        // Handlebar 输出模板数据
                        self.common.render(self.tpl.channelHotJmp, value, function(dom) {
                            jCurDom = $(dom);
                            // 为每个模板创建出来的DOM添加一个Jquery data存放数据——data-key
                            // 仅在anchorAttach站点统计代码使用到
                            jCurDom.data('data-key', key);
                            // oSubitem存放浮出层对应键值表
                            oSubitem[key] = jCurDom;
                            // 优化DOM操作，先存放在临时wrap dom中
                            jTempWrap.append(jCurDom);
                        });
                    });
                    jSubitems = jTempWrap = jTempWrap.children();
                    jDetailPanel.append(jTempWrap);
                    // oPoint存放point对应键值表
                    jPoints.each(function() {
                        dataKey = $(this).attr('data-key');
                        oPoint[dataKey] = $(this);
                    });
                },
                /**
                 * 绑定各个触发事件
                 */
                bind: function() {
                    var me = this;
                    var hoverKey;
                    var preEvent;
                    // 每个li Hover，获得hoverKey，显示高亮和显示对应的浮动层
                    // 使用mousemove动态检测鼠标位置，判断用户是否是仅仅为了移动位置
                    // 好处是用户如果如果快速拂过某个li，不让他触发hover功能
                    // 第一次划入，因为没有preEvent，立即hover
                    jContainer.delegate('li[data-key]', 'mousemove', function(e) {
                        if (!preEvent || me._isNotMoveAway(preEvent, e)) {
                            hoverKey = $(this).attr('data-key');
                            me._hide();
                            me._show(hoverKey);
                        }
                        preEvent = e;
                    });
                    // 对Container绑定，移除后对Panel绑定
                    // 移出container不代表什么，会移到subitem之内，不能隐藏subitem
                    // 移出Panel才是真正脱离Hover hotDest功能
                    jContainer.bind('mouseleave', function(e) {
                        jDHotDest.one('mouseleave', function(e) {
                            me._hide();
                        });
                        // 移出就算重新开始计算
                        preEvent == null;
                    });
                    // Panel中另一块区域，移入后也请隐藏subitem
                    jHotSearch.bind('mouseenter', function() {
                        me._hide();
                    });

                    // 与首页不同，此为浮出层，需要添加浮出隐藏功能
                    jDHotDest.bind('click', function(event) {
                        // IE6/7移出后在移入会保留先前状态的subitem浮出层
                        // 所以移出先清掉所有subitem浮出层，在隐藏热门目的地浮出层
                        me._hide();
                        me.collapseChange();
                        // Channel页面添加功能，不能和出发城市的浮出层重叠
                        self.startStation().collapseHide();
                    });
                    // 与首页不同，此为浮出层，需要添加浮出隐藏功能
                    // 鼠标移出会自动隐藏
                    jDHotDest.bind('mouseleave', function(event) {
                        // IE6/7移出后在移入会保留先前状态的subitem浮出层
                        // 所以移出先清掉所有subitem浮出层，在隐藏热门目的地浮出层
                        me._hide();
                        me.collapseHide();
                    });
                    // 点击出发城市详情浮出层，必须取消冒泡，阻止触发jDHotDest点击事件
                    jDetailPanel.bind('click', function(event) {
                        event.stopPropagation();
                    });
                },
                /**
                 * 添加删除jDHotDest上的city_spread达到隐藏显示详情浮出层
                 * .city_spread 用css方式控制浮动层display
                 * @return {void}
                 */
                collapseChange: function() {
                    jDHotDest.toggleClass('city_spread');
                },
                /**
                 * 隐藏浮出层，不能和出发城市的浮出层重叠
                 */
                collapseHide: function() {
                    jDHotDest.removeClass('city_spread');
                },
                /**
                 * 获取鼠标的位置，判断用户是否因为想要移动到subitem而移动
                 * 如果是向右移动，那么认为仅仅是移动
                 * @param  {object}  preEvent 上一个移动的位置
                 * @param  {[object}  curEvent 现在移动位置
                 * @return {Boolean}
                 */
                _isNotMoveAway: function(preEvent, curEvent) {
                    var bRtn = true;
                    // 向右移动
                    if (preEvent.clientX < curEvent.clientX) {
                        bRtn = false;
                    }
                    return bRtn;
                },
                /**
                 * 显示当前hoverKey指向的point指向的subitem，且高亮point
                 * 更新curKey变为当前hoverKey
                 * @param  {string} hoverKey 当前hover上的key
                 */
                _show: function(hoverKey) {
                    var me = this;
                    curKey = hoverKey;
                    oPoint[curKey].addClass('current');
                    // 获得的数据会出现data=key没有对应的subitem，那么就不显示subitem
                    if (oSubitem[curKey]) {
                        oSubitem[curKey].show();
                        me._setTop(curKey);
                    } else {
                        return false;
                    }
                },
                /**
                 * 隐藏当前浮出层subitem和当前point的，且去除高亮
                 * 更新curKey使之为空
                 */
                _hide: function() {
                    if (curKey !== null) {
                        oPoint[curKey].removeClass('current');
                        // 获得的数据会出现data=key没有对应的subitem，那么就不显示subitem
                        oSubitem[curKey] ? oSubitem[curKey].hide() : false;
                        curKey = null;
                    }
                },
                /**
                 * 计算浮出层的位置
                 * 浮出层的top是相对于容器的位置，所以是一个相对位置
                 * @param {num} curKey 当前的Key，可以得到当前point和subitem
                 */
                _setTop: function(curKey) {
                    var jPoint = oPoint[curKey];
                    var jSubitem = oSubitem[curKey];
                    var top, calcuTop;

                    // 滚动条滚动距离
                    var scrollTop = $(document).scrollTop();
                    // 浏览器视口高度
                    var clientHeight = $(window).height();
                    // 容器Container的绝对Y位置
                    var containerTop = jContainer.offset().top;
                    // 当前点point的绝对位置
                    var pointTop = jPoint.offset().top;
                    // 浮动层subitem的高度
                    var subitemHeight = jSubitem.height();
                    // 下底线位置，subitem的top不得大于这个底线
                    // 否则无法显示完成的subitem
                    // scrollTop + clientHeight = 现在视口Y绝对位置
                    // subitemHeight + containerTop = 浮动层高度+容器绝对Y位置 = 显示完整浮窗 +
                    //     容器的绝对位置Y偏移量得去除 
                    // 尽可能显示完整浮动层，也许浮动层太大，无法完整显示，那么就会把他放上底线0位置
                    var bottomPos = (scrollTop + clientHeight) - (subitemHeight + containerTop);
                    // 浮出层的top是相对于容器的位置，所以是一个相对位置
                    // 计算得出当前点距离容器的相对距离，一般浮动层就在这个齐平位置
                    calcuTop = pointTop - containerTop;
                    // 计入美化偏移量
                    calcuTop -= spanHeight;

                    if (calcuTop < 0) {
                        // 上底线为0
                        top = 0;
                    } else if (calcuTop > bottomPos) {
                        // 下底线位置，且上底线为0
                        top = Math.max(0, bottomPos);
                    } else {
                        // 一般普通位置
                        top = calcuTop;
                    }

                    jSubitem.css({
                        top: top
                    });
                },
                /**
                 * handlebars自定义函数
                 */
                customHandlebars: function() {
                    /**
                     * isHighLight的后台数据为'Y','F'字符串，Handlebar无法自然解析
                     * 判断是否增加一个orange的class，来高亮显示
                     * 辅助函数，不影响功能
                     * @param  {string} IsHighLight 'T'/'F'
                     * @param  {obj} options     自身，让他过还是不过
                     */
                    Handlebars.registerHelper('isHighLight', function(IsHighLight, options) {
                        var bRtn = false;
                        if (IsHighLight == 'T') {
                            bRtn = true;
                        } else if (IsHighLight == 'F') {
                            bRtn = false;
                        }

                        if (bRtn) {
                            return options.fn(this);
                        } else {
                            return options.inverse(this);
                        }
                    });
                    /**
                     * 对给到的URL进行处理，去掉头尾空格
                     * 辅助函数
                     */
                    Handlebars.registerHelper('trimUrl', function(url, options) {
                        return $.trim(url);
                    });
                },
                /**
                 * 左侧索引栏统计代码添加，为了查看点击数
                 * 遍历整个索引栏，并增加ctm_ref属性，每个链接给予不同的值
                 * 辅助函数，删除不会影响功能，
                 * 这代码一坨屎，所以已单独分离，可以直接重构
                 */
                anchorAttach: function() {
                    var settings = {
                        subChannel: 'hom',
                        area: 'idx', // area name
                        page: 'p0', // the default value of page number
                        listTag: 'li', // the tag name of the list items
                        anchorTag: 'a', // the tag name of the anchor
                        ignore: {
                            name: 'href',
                            value: '###'
                        } // check if the tag has the attribute, if not then ignore this tag.
                    };

                    var ctmStr, dtas, subChannel, anchorNum;
                    var isIgnore = false;
                    var _pathname = window.location.pathname;
                    subChannel = _pathname.length > 3 ? _pathname.substr(1, 3) : settings.subChannel;

                    var _anchorTag = settings.anchorTag || "a";
                    var _listTag = settings.listTag || "li";

                    jPoints.each(function(i) {
                        anchorNum = 0;
                        dtas = $(this).find(_anchorTag);
                        dtas.each(function(j) {
                            isIgnore = settings.ignore.name ? (!this.getAttribute(settings.ignore.name) || this.getAttribute(settings.ignore.name) == settings.ignore.value) : false;
                            // if the anchor sould be igonred, then add the anchorNum value to mark this ignored the anchor. 
                            // The next anchor will minus the anchorNum to get the correct number.
                            if (isIgnore) {
                                anchorNum++;
                                return true;
                            }
                            if (!this.getAttribute("data-ctm")) {
                                ctmStr = ["#ctm_ref=va_" + subChannel + "_s", $$.StartCity, "_" + settings.area + "_" + settings.page + "_l", i + 1, "_" + (j + 1 - anchorNum) + "_txt"].join("");
                                this.setAttribute("data-ctm", ctmStr);
                            }
                        });
                    });


                    var subLists, subAnchor, subTitleAnchor, subImgAnchor;
                    var subArea = settings.area + 1,
                        subAreaImg = settings.area + 2;
                    // 实际point的行数
                    var lineIndex, myDataKey;

                    jSubitems.each(function(i) {
                        myDataKey = $(this).data('data-key');
                        lineIndex = jPoints.index(oPoint[myDataKey]);

                        subLists = $(this).find(_listTag);
                        subLists.each(function(j) {
                            anchorNum = 0;
                            subTitleAnchor = $(this).find('>h4 a')[0];
                            if (subTitleAnchor && !subTitleAnchor.getAttribute("data-ctm")) {
                                ctmStr = ["#ctm_ref=va_" + subChannel + "_s", $$.StartCity, "_" + subArea + "_" + settings.page + "_l", lineIndex + 1, "_" + (j + 1) + "_txt"].join("");
                                subTitleAnchor.setAttribute("data-ctm", ctmStr);
                            }
                            subAnchor = $(this).find('>div a');

                            subAnchor.each(function(k) {
                                isIgnore = settings.ignore.name ? (!this.getAttribute(settings.ignore.name) || this.getAttribute(settings.ignore.name) == settings.ignore.value) : false;
                                // if the anchor sould be igonred, then add the anchorNum value to mark this ignored the anchor. 
                                // The next anchor will minus the anchorNum to get the correct number.
                                if (isIgnore) {
                                    anchorNum++;
                                    return true;
                                }
                                if (!this.getAttribute("data-ctm")) {
                                    ctmStr = ["#ctm_ref=va_" + subChannel + "_s", $$.StartCity, "_" + subArea + "_" + settings.page + "_l", lineIndex + 1, "_" + (j + 1) + "." + (k + 1 - anchorNum) + "_txt"].join("");
                                    this.setAttribute("data-ctm", ctmStr);
                                }
                            });
                        });

                        // 右下角图片添加跟踪代码
                        subImgAnchor = $(this).find('>div a')[0];
                        if (subImgAnchor && !subImgAnchor.getAttribute("data-ctm")) {
                            ctmStr = ["#ctm_ref=va_" + subChannel + "_s", $$.StartCity, "_" + subAreaImg + "_" + settings.page + "_l", lineIndex + 1, "_" + 1 + "_txt"].join("");
                            subImgAnchor.setAttribute("data-ctm", ctmStr);
                        }
                    });

                    // 热门旅游搜索
                    var jHotSearchLists = jHotSearch.find('li:not(.title)');
                    var jHotSearchAnchors;
                    jHotSearchLists.each(function(i) {
                        jHotSearchAnchors = $(this).find('>div a');
                        anchorNum = 0;
                        jHotSearchAnchors.each(function(j) {
                            isIgnore = settings.ignore.name ? (!this.getAttribute(settings.ignore.name) || this.getAttribute(settings.ignore.name) == settings.ignore.value) : false;
                            // if the anchor sould be igonred, then add the anchorNum value to mark this ignored the anchor. 
                            // The next anchor will minus the anchorNum to get the correct number.
                            if (isIgnore) {
                                anchorNum++;
                                return true;
                            }
                            if (!this.getAttribute("data-ctm")) {
                                ctmStr = ["#ctm_ref=va_" + subChannel + "_s", $$.StartCity, "_" + 'mth' + "_" + 'p', (i + 1), "_l0", "_" + (j + 1 - anchorNum) + "_txt"].join("");
                                this.setAttribute("data-ctm", ctmStr);
                            }
                        });
                    });
                },
                /**
                 * 点击数的a link重写url
                 * 遍历整个索引栏的a，有ctm_ref属性的a，那么就修改url，
                 * url添加dta-ctm
                 * 辅助函数，删除不会影响功能，
                 * @return {[type]} [description]
                 */
                overwriteCtmUrl: function() {
                    $('#DHotDest a').bind('click', function(event) {
                        var $this = $(this);
                        var datactm = $this.attr("data-ctm");
                        if ( !! datactm && datactm.length) {
                            if ($this.attr("target") === "_blank") {
                                window.open($this.attr("href") + datactm);
                            } else {
                                location.href = $this.attr("href") + datactm;
                            }
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    });
                }
            }
        },

        /*
        * 为目的地列表重设href，从data-url中取值
        */
        setHref: function () {
            var resetAnchors = $(".pkg-hot-list").find("a[data-url]");
            resetAnchors.each(function (index, element) {
                element.attributes['href'].value = element.attributes['data-url'].value;
            });
        },

        init: function() {
            var self = this;

            return function() {
                self.setHref();
                self.startStation().init();
                self.channelHotDest().init();
            }
        }
    }

    exports.init = HotDest.init.call(HotDest);
});
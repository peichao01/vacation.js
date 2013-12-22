define(function (require, exports, module) {
	var $ = require("jquery");
	
	var tpl = '\
            {{#if tpl_need_wrapper}}<div class="{{class_prefix}}calendar">{{/if}}\
            <ul class="{{class_prefix}}calendar_num basefix"><li class="bold">这里是汉字</li>\
            <li>这里是汉字</li><li>这里是汉字</li><li>这里是汉字</li><li>这里是汉字</li><li>这里是汉字</li><li class="bold">这里是汉字</li>\
            </ul>\
            <div class="basefix">\
            <div class="{{class_prefix}}calendar_left pkg_double_month" data-plug-bigcalendar="control">\
            <p class="border bgblue"></p>\
            <p></p>\
            <a href="javascript:;" title="这里是汉字" class="pkg_circle_top">这里是汉字</a>\
            <a href="javascript:;" title="这里是汉字" class="pkg_circle_bottom">这里是汉字</a>\
            </div>\
            <table class="{{class_prefix}}calendar_right">\
            <tbody>\
            <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>\
            <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>\
            <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>\
            <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>\
            <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>\
            {{#if need6tr}}<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>{{/if}}\
            </tbody></table></div>\
            <div class="bigcalendar_loding" style="display:none;"><span class="loading">这里是汉字...</span></div>\
            {{#if tpl_need_wrapper}}</div>{{/if}}\
            ';
    tpl = Handlebars.compile(tpl);
});
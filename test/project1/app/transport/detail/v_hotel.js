define("detail/v_hotel.js", ["jquery", "underscore", "public/EventEmitter.js", "lib/inherit.js", "detail/mod_util.js", "Modules/SelectBase.js", "Modules/scrollspy.js", "Modules/HotelSelect.js", "detail/mod_detail_big_order_other.js"], function (require, exports, module) {
    var $ = require("jquery"),
        _ = require("underscore"),
        EventEmitter = require("../public/EventEmitter"),
        inherit = require("lib/inherit"),
        util = require('./mod_util'),
        Selector = require('../Modules/SelectBase'),
        scrollspy = require('../Modules/scrollspy'),
        popHotelUi = require('../Modules/HotelSelect'),
        popOtherUi = require('./mod_detail_big_order_other');

    var tplOptional = '<div class="resource_mask" id="J_optional_select_pop" style="display: none;">\
                            <a href="javascript:void(0);" class="close J_optional_pop_close"><span>关闭</span></a>\
                            <div class="scroll_wrap">\
                                <table class="other_mask_table other_resource_table">\
                                {{#each AA}}{{/each}}\
                                </table>\
                                <div class="btn_wrap">\
                                    <a class="yes" id="J_optional_pop_confirm" href="javascript:void(0);">确定</a>\
                                    <a class="no J_optional_pop_close" href="javascript:void(0);">取消</a>\
                                </div>\
                            </div>\
                        </div>',
        singleTpl = '',
        hotelTpl = '';
    var template = Handlebars.compile(hotelTpl),
        template2 = Handlebars.compile(singleTpl),
        template3 = Handlebars.compile(tplOptional);

    module.exports = ''; 
});
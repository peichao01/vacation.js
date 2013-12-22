define("Modules/ProductPreviewManager.js", ["jquery", "underscore", "lib/inherit.js", "public/EventEmitter.js"], function (require, exports, module) {
	var $ = require("../../../lib/jquery"),
		_ = require("../../../lib/underscore"),
		inherit = require("../../../lib/inherit"),
		EventEmitter = require("../public/EventEmitter");

	var tplPicIntro = Handlebars.compile('{{nowIndex}}/{{total}} {{ImageDesc}}');
	module.exports = function () {
		
	};
});
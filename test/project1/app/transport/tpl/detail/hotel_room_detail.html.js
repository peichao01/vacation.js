define("tpl/detail/hotel_room_detail.html.js",[],"\n\
<div class=\"room_detail_wrap\" style=\"display:none;\">\n\
	<div class=\"room_img_wrap basefix\">\n\
		{{#notEmpty}}\n\
		{{#each RoomPicUrl}}\n\
		<img src=\"{{this}}\" alt=\"\" width=\"75\" height=\"75\">\n\
		{{/each}}\n\
		{{/notEmpty}}\n\
	</div>\n\
	<div class=\"room_txt_wrap basefix\">\n\
		<div title=\"{{AreaRange}}\">{{AreaRange}}</div>\n\
		<div title=\"{{FloorRange}}\">{{FloorRange}}</div>\n\
		<div title=\"{{BedWidth}}\">{{BedWidth}}</div>\n\
		<div title=\"{{AddBedFee}}\">{{AddBedFee}}</div>\n\
		<div title=\"{{Smoke}}\">{{Smoke}}</div>\n\
		<div title=\"这里是汉字：3这里是汉字\">这里是汉字：3这里是汉字</div>\n\
		<div class=\"long\" title=\"这里是汉字：这里是汉字。（120这里是汉字/这里是汉字，60/这里是汉字）\">这里是汉字：这里是汉字。（120这里是汉字/这里是汉字，60/这里是汉字）</div>\n\
		<div class=\"long\" title=\"这里是汉字：这里是汉字、这里是汉字、这里是汉字\">这里是汉字：这里是汉字、这里是汉字、这里是汉字</div>\n\
		<div class=\"long\" title=\"这里是汉字/这里是汉字：这里是汉字、这里是汉字\">这里是汉字/这里是汉字：这里是汉字、这里是汉字</div>\n\
		<div class=\"long\" title=\"这里是汉字：这里是汉字\">这里是汉字：这里是汉字</div>\n\
		<div class=\"long\" title=\"这里是汉字：24这里是汉字、这里是汉字、这里是汉字、这里是汉字\">这里是汉字：24这里是汉字、这里是汉字、这里是汉字、这里是汉字</div>\n\
	</div>\n\
	<a class=\"flod_btn\" href=\"javascript:void(0);\">这里是汉字<b></b></a>\n\
</div>");
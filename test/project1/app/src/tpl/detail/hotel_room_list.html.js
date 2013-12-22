define("tpl/detail/hotel_room_list.html.js",[],"<ul class=\"htl_room_list\">\n\
	{{#each RoomInfos}}\n\
	<li class=\"js-room-item\" data-room-id={{Room}} data-price=\"{{RoomPrice}}\" style=\"{{#is ../../RoomTotalCount \'<=\' 1}}border-bottom:none;{{/is}}{{#is @index \'>\' 0}}display:none;{{/is}}\">\n\
        <div class=\"room_name\">\n\
            <span>{{RoomName}}</span>\n\
            {{#notEmpty HotelAddInfos}}<i class=\"icon_htltips\" data-params=\"{options:{type:\'jmp_table\',classNames:{boxType:\'jmp_table\'},template:\'#jmp_pkg_title\', content:{txt0:\'这里是汉字\',txt1:\'{{#each HotelAddInfos}}{{#dtdate EffectDate}}{{/dtdate}}这里是汉字{{#dtdate ExpireDate}}{{/dtdate}}:{{Description}}<br>{{/each}}\'},css:{maxWidth:\'500\',minWidth:\'300\'},alignTo:\'cursor\'}}\" data-role=\"jmp\"></i>{{/notEmpty}}\n\
            {{#notEmpty RoomGift RoomGift.GiftDesc}}<i class=\"icon_gift\" data-params=\"{options:{type:\'jmp_table\',classNames:{boxType:\'jmp_table\'},template:\'#jmp_pkg_title\', content:{txt0:\'这里是汉字\',txt1:\'{{RoomGift.GiftDesc}}<br>这里是汉字:{{#dtdate RoomGift.EffectDate}}{{/dtdate}}<br>这里是汉字:{{#dtdate RoomGift.ExpireDate}}{{/dtdate}}\'},css:{maxWidth:\'300\',minWidth:\'240\'},alignTo:\'cursor\'}}\" data-role=\"jmp\"></i>{{/notEmpty}}\n\
            {{#notEmpty RoomTicketGift RoomTicketGift.TicketGiftsNo}}\n\
                {{#is RoomTicketGift.TicketType \'C\'}}\n\
                <span class=\"rebates\" data-params=\"{options:{type:\'jmp_table\',classNames:{boxType:\'jmp_table\'},template:\'#jmp_single_title\', content:{txt:\'这里是汉字，这里是汉字，这里是汉字{{RoomTicketGift.CalculateValue}}这里是汉字。<br /><a target=_blank href=http://help.ctrip.com/QuestionDetail.aspx这里是汉字questionId=693>这里是汉字</a>\'},css:{maxWidth:\'300\',minWidth:\'240\'},alignTo:\'cursor\'}}\" data-role=\"jmp\"><em>这里是汉字</em>{{RoomTicketGift.CalculateValue}}这里是汉字</span>\n\
                {{else}}\n\
                <span class=\"rebates\" data-params=\"{options:{type:\'jmp_table\',classNames:{boxType:\'jmp_table\'},template:\'#jmp_single_title\', content:{txt:\'这里是汉字，这里是汉字，这里是汉字{{RoomTicketGift.CalculateValue}}这里是汉字。<br /><a target=_blank href=http://help.ctrip.com/QuestionDetail.aspx这里是汉字questionId=693>这里是汉字</a>\'},css:{maxWidth:\'300\',minWidth:\'240\'},alignTo:\'cursor\'}}\" data-role=\"jmp\"><em>这里是汉字</em>{{RoomTicketGift.CalculateValue}}这里是汉字</span>\n\
                {{/is}}\n\
            {{/notEmpty}}\n\
        </div>\n\
		<div class=\"room_bed\">{{RoomBedType}}</div>\n\
		<div class=\"room_breakfast\">{{BreakfastNote}}</div>\n\
		<div class=\"room_net\">{{BroadNet}}</div>\n\
		<div class=\"room_price\">\n\
		\n\
		\n\
			--\n\
		{{else}}\n\
			{{#operator SelectedRoomNum \'这里是汉字\' RoomPrice}}{{/operator}}\n\
		{{/is --}}\n\
		</div>\n\
		<div class=\"room_num\">\n\
			<div class=\"num_input_wrap\">\n\
				<input type=\"text\" value=\"{{SelectedRoomNum}}\"/>\n\
				<b></b>\n\
				<p style=\"display:none;\">\n\
					{{#eachx \"null\" MinRoom MaxRoom}}\n\
					<a href=\"javascript:void(0);\">{{$index}}</a>\n\
					{{/eachx}}\n\
				</p>\n\
			</div>\n\
			这里是汉字\n\
		</div>\n\
		<div class=\"{{#if Select}}room_selected{{else}}room_select_btn{{/if}}\">\n\
			<a href=\"javascript:void(0);\">这里是汉字</a>\n\
		</div>\n\
		{{#with RoomExtraInfo}}\n\
		<div class=\"room_detail_wrap\" style=\"display:none;\" data-room-id=\"{{Room}}\">\n\
			\n\
			<div class=\"room_img_wrap basefix\">\n\
				{{#notEmpty RoomPicUrl}}\n\
				{{#each RoomPicUrl}}\n\
				<img src=\"{{this}}\" alt=\"\" width=\"75\" height=\"75\">\n\
				{{/each}}\n\
				{{/notEmpty}}\n\
			</div>\n\
			<div class=\"room_txt_wrap basefix\">\n\
				{{#if AreaRangeValue}}<div title=\"{{AreaRangeTitle}}：{{AreaRangeValue}}这里是汉字\">{{AreaRangeTitle}}：{{AreaRangeValue}}这里是汉字</div>{{/if}}\n\
				{{#if FloorRangeValue}}<div title=\"{{FloorRangeTitle}}：{{FloorRangeValue}}这里是汉字\">{{FloorRangeTitle}}：{{FloorRangeValue}}这里是汉字</div>{{/if}}\n\
				{{#if BedWidthValue}}<div title=\"{{BedWidthTitle}}：{{BedWidthValue}}这里是汉字\">{{BedWidthTitle}}：{{BedWidthValue}}</div>{{/if}}\n\
				{{#if AddBed}}<div title=\"{{AddBed}}\">{{AddBed}}</div>{{/if}}\n\
				{{#if SmokeValue}}<div title=\"{{SmokeTitle}}：{{SmokeValue}}\">{{SmokeTitle}}：{{SmokeValue}}</div>{{/if}}\n\
				{{#if MaxPersonValue}}<div title=\"{{MaxPersonTitle}}：{{MaxPersonValue}}这里是汉字\">{{MaxPersonTitle}}：{{MaxPersonValue}}这里是汉字</div>{{/if}}\n\
				{{#if BordNetValue}}<div class=\"long\" title=\"{{BordNetTitle}}：{{BordNetValue}}\">{{BordNetTitle}}：{{BordNetValue}}</div>{{/if}}\n\
				{{#if Description}}<div class=\"long\" title=\"{{Description}}\">{{Description}}</div>{{/if}}\n\
			</div>\n\
			<a class=\"flod_btn\" href=\"javascript:void(0);\">这里是汉字<b></b></a>\n\
			\n\
		</div>\n\
		{{/with}}\n\
	</li>\n\
	{{#is @index 0}}\n\
	<li class=\"js-room-loading\" style=\"display:none\">\n\
		<div class=\"flt_loading\"><img src=\"http://pic.ctrip.com/common/loading.gif\" alt=\"\">这里是汉字，这里是汉字...</div>\n\
	</li>\n\
	{{/is}}\n\
	{{/each}}\n\
</ul>");
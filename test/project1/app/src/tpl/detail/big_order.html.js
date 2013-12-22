define("tpl/detail/big_order.html.js",[],"<ul class=\"resource_price_wrap basefix\"> \n\
	<li class=\"start_date\"> \n\
		<label for=\"\">这里是汉字</label>\n\
		<div class=\"input_wrap\">\n\
			<input type=\"text\" id=\"js-departure-date\" value=\"{{#if BaseInfo.DepartureDate}} {{#dtdate BaseInfo.DepartureDate}}{{/dtdate}}（{{#week BaseInfo.DepartureDate}}{{/week}}）\n\
			{{#is BaseInfo.PriceAdult \'!==\' undefined}}\n\
				&nbsp;&nbsp;&nbsp;&yen;{{BaseInfo.PriceAdult}}/这里是汉字\n\
				&nbsp;&nbsp;&nbsp;&yen;{{BaseInfo.PriceChild}}/这里是汉字\n\
			{{/is}}{{/if}}\" />\n\
			<b></b>\n\
		</div> \n\
		<span data-role=\"jmp\" data-params=\"{options:{type:\'jmp_table\',classNames:{boxType:\'jmp_table\'},template:\'#jmp_pkg_title\', content:{txt0:\'这里是汉字\',txt1:\'这里是汉字2-12这里是汉字，这里是汉字，这里是汉字、这里是汉字、这里是汉字。\'},css:{maxWidth:\'300\',minWidth:\'240\'},alignTo:\'cursor\'}}\" class=\"children_price\"><i></i>这里是汉字</span>\n\
	</li>\n\
	<li class=\"tourist_num\">\n\
		<label for=\"\">这里是汉字</label>\n\
		<div class=\"input_wrap\">\n\
			<input type=\"text\" value=\"{{#is BaseInfo.AdultNum \'!==\' undefined}}{{BaseInfo.AdultNum}}{{/is}}\" />\n\
			<b></b>\n\
			<p style=\"display:none\">\n\
				{{#eachx \"null\" 1 10}}\n\
				<a href=\"javascript:void(0);\">{{$index}}</a>\n\
				{{/eachx}}\n\
			</p>\n\
		</div>\n\
	</li>\n\
	<li class=\"children_num\">\n\
		{{#if BaseInfo.ForChild}}\n\
		<label for=\"\">这里是汉字<span>(2-12这里是汉字)</span></label>\n\
		<div class=\"input_wrap\">\n\
			<input type=\"text\" value=\"{{#is BaseInfo.ChildNum \'!==\' undefined}}{{BaseInfo.ChildNum}}{{/is}}\" />\n\
			<b></b>\n\
			<p style=\"display:none\">\n\
				{{#eachx \"null\" 0 10}}\n\
				<a href=\"javascript:void(0);\">{{$index}}</a>\n\
				{{/eachx}}\n\
			</p>\n\
		</div>\n\
		{{else}}\n\
		<label for=\"\">这里是汉字<span>(这里是汉字)</span></label>\n\
		{{/if}}\n\
	</li>\n\
	<li class=\"total_price\">\n\
		<span class=\"price_name\">这里是汉字</span>\n\
		<span class=\"price\">{{#if isFetchSuccess }}{{#moneyHTML BaseInfo.TotalPrice}}{{/moneyHTML}}{{else}}--{{/if}}</span>\n\
		<a id=\"js-submit\" class=\"{{#if isFetchSuccess }}btn_red_big{{else}}btn_big_disabled{{/if}}\" href=\"javascript:void(0);\">{{#if isFetching }}{{#if isOrdering}}这里是汉字...{{else}}这里是汉字...{{/if}}{{else}}这里是汉字{{/if}}</a>\n\
	</li>\n\
</ul>\n\
<div class=\"all_resource\">\n\
	{{#if isFetchSuccess}}\n\
	<div class=\"flt_htl_resource basefix\">\n\
		<h3 class=\"resource_title\">\n\
			这里是汉字<i class=\"icon_b icon_b_05\"></i>\n\
		</h3>\n\
		{{#if FlightInfos.length}}\n\
		<div class=\"flt_resource_detail\" id=\"js-flight-wrap\">\n\
			<h4 class=\"resource_detail_title\">这里是汉字</h4>\n\
			\n\
			<table class=\"flt_resource_table\">\n\
				<tbody>\n\
					{{#each FlightInfosDealed}}\n\
					<tr{{#if CSSHasBorder}} class=\"border\"{{/if}} data-segment-number=\"{{TripSegmentNo}}\">\n\
						<td class=\"col_01\">\n\
							{{DepartDate}}{{#if DarkMorning}}<span data-role=\"jmp\" data-params=\"{options:{type:\'jmp_title\',classNames:{boxType:\'jmp_title\'},template:\'#jmp_pkg_title\', content:{txt0:\'{{DarkMorning}}\'},css:{maxWidth:\'300\',minWidth:\'240\'},alignTo:\'cursor\',showArrow:false}}\" class=\"special_flt\">这里是汉字</span>{{/if}}\n\
						</td>\n\
						<td class=\"col_02\">\n\
							<div>\n\
								<strong class=\"time\">{{DepartTime}}</strong>{{DepartCityName}}（{{DepartAirportName}}）\n\
							</div>\n\
							<div>\n\
								<strong class=\"time\">{{ArriveTime}}</strong>{{ArriveCityName}}（{{ArriveAirportName}}）\n\
								{{#is NextDay \'>\' 0}}\n\
								<span class=\"base_txtdiv\" data-role=\"jmp\" data-params=\"{options:{css:{maxWidth:\'300\',minWidth:\'240\'},type:\'jmp_text\',classNames:{boxType:\'jmp_text\'},\n\
									template:\'#jmp_NextDay_{{TripSegmentNo}}_{{FlightNo}}\',alignTo:\'cursor\',showArrow:false}}\">这里是汉字{{NextDay}}</span>\n\
								<div id=\"jmp_NextDay_{{TripSegmentNo}}_{{FlightNo}}\" style=\"display:none\">\n\
									<div class=\"jmp_bd\">这里是汉字，这里是汉字{{NextDay}}这里是汉字。这里是汉字。</div>\n\
								</div>\n\
								{{/is}}\n\
							</div>\n\
						</td>\n\
						<td class=\"col_03\">\n\
							<div class=\"pubFlights_{{AirlineCode}}\">{{AirlineShortName}}</div>\n\
							<div class=\"flt_num\">\n\
								{{FlightNo}}\n\
								\n\
						{{#if IsTraffic}}\n\
						<td class=\"col_04\">{{#dtdate DepartureDate}}{{/dtdate}}</td>\n\
						{{else}}\n\
						<td class=\"col_04\">--</td>\n\
						{{/if}}\n\
						<td class=\"col_05\">\n\
							<div class=\"room_num\">\n\
							\n\
								<div class=\"num_input_wrap\">\n\
									{{TotalCount}}\n\
								</div>\n\
								{{Unit}}\n\
							</div>\n\
						</td>\n\
						<td class=\"col_06\">\n\
							\n\
							--\n\
						</td>\n\
						<td class=\"col_07\">\n\
							<div class=\"room_selected\"{{#is Count \'<=\' 0}} style=\"display:none\"{{/is}}>\n\
								<a href=\"javascript:void(0);\">这里是汉字</a>\n\
							</div>\n\
						</td>\n\
						{{#is TotalCount \'>\' 1}}\n\
						<td class=\"col_btn\">\n\
							<a class=\"change_resource_btn\" href=\"javascript:void(0);\">这里是汉字{{{CategoryName}}}</a>\n\
						</td>\n\
						{{/is}}\n\
					</tr>\n\
					{{/if}}\n\
					{{/each}}\n\
					{{#each OptionResources}}\n\
					<tr{{#unless IsShow}} style=\"display:none\"{{/unless}} class=\"js-optional{{#if IsBaoxian}} js-is-baoxian{{/if}}\"\n\
					 {{#is Inventory.length 1}}data-only-date=\"{{#each Inventory}}{{#dtdate Date}}{{/dtdate}}{{/each}}\" {{/is}}data-index-in-data=\"{{@index}}\" data-resource-id=\"{{ResourceID}}\" data-category-id=\"{{CategoryID}}\">\n\
						<td class=\"col_01\" rowspan=\"{{Rowspan}}\"{{#unless IsShowTitle}} style=\"display:none\"{{/unless}}>\n\
							<h4 class=\"other_product\">{{{CategoryName}}}</h4>\n\
						</td>\n\
						<td class=\"col_02\">\n\
							<div class=\"other_name\">{{{Name}}}</div>\n\
						</td>\n\
						<td class=\"col_03\">\n\
						\n\
						{{#each Inventory}}\n\
							{{#unless @index}}\n\
							<div><span class=\"js-price other_price\">{{#moneyHTML Price}}{{/moneyHTML}}</div>\n\
							{{/unless}}\n\
						{{/each}}\n\
						</td>\n\
						<td class=\"col_04\">\n\
							{{#is Inventory.length \'>\' 1}}\n\
								<div class=\"use_date\">\n\
									<div class=\"date_input_wrap\">\n\
										{{#each Inventory}}\n\
										{{#unless @index}}<input type=\"text\" value=\"{{#dtdate Date}}{{/dtdate}}\"/>{{/unless}}\n\
										{{/each}}\n\
										<p style=\"display:none\">\n\
											{{#each Inventory}}\n\
											<a href=\"javascript:void(0);\">{{#dtdate Date}}{{/dtdate}}</a>\n\
											{{/each}}\n\
										</p>\n\
									</div>\n\
								</div>\n\
							{{else}}\n\
								\n\
								{{#dtdate Date}}{{/dtdate}}\n\
								{{/each --}}\n\
								--\n\
							{{/is}}\n\
						</td>\n\
						<td class=\"col_05\">\n\
							<div class=\"room_num\">\n\
								<div class=\"num_input_wrap\">\n\
								{{#each Inventory}}\n\
								{{#unless @index}}\n\
								\n\
									{{#is MinQuantity MaxQuantity}}\n\
										\n\
										{{DefaultQuantity}}\n\
									{{else}}\n\
										<input type=\"text\" value=\"{{DefaultQuantity}}\"/>\n\
										<b></b>\n\
										<p style=\"display:none\">\n\
											{{#eachx \'null\' MinQuantity MaxQuantity StepQuantity}}\n\
											<a href=\"javascript:void(0);\">{{$index}}</a>\n\
											{{/eachx}}\n\
										</p>\n\
									{{/is}}\n\
								{{/unless}}\n\
								{{/each}}\n\
								</div>{{Unit}}\n\
							</div>\n\
						</td>\n\
						<td class=\"col_06\">\n\
							\n\
							<div><span class=\"other_price js-total-price\">{{#if TotalPrice}}{{#moneyHTML TotalPrice}}{{/moneyHTML}}</span>{{else}}--{{/if}}</div>\n\
						</td>\n\
						<td class=\"col_07\">\n\
							{{#each Inventory}}\n\
							{{#unless @index}}\n\
							<div class=\"room_selected\"{{#is DefaultQuantity \'<=\' 0}} style=\"display:none;\"{{/is}}>\n\
								<a href=\"javascript:void(0);\">这里是汉字</a>\n\
							</div>\n\
							{{/unless}}\n\
							{{/each}}\n\
						</td>\n\
						\n\
						<td class=\"col_btn\" rowspan=\"{{Rowspan}}\"{{#unless IsShowTitle}} style=\"display:none\"{{/unless}}>\n\
							{{#if IsBaoxian}}\n\
							{{#is ThisCategoryTotalCount \'>\' 1}}\n\
							<a class=\"change_resource_btn\" href=\"javascript:void(0);\">这里是汉字{{CategoryName}}</a>\n\
							{{/is}}\n\
							{{/if}}\n\
						</td>\n\
					</tr>\n\
					{{#if Introduction}}\n\
					<tr class=\"js-intro\" style=\"display:none\">\n\
						<td></td>\n\
						<td colspan=\"5\">\n\
							<div class=\"other_product_detail\">\n\
								<b></b>\n\
								<i></i>\n\
								<div>{{Introduction}}</div>\n\
								<a class=\"flod_btn\" href=\"javascript:void(0);\">这里是汉字</a>\n\
							</div>\n\
						</td>\n\
						<td></td>\n\
					</tr>\n\
					{{/if}}\n\
					{{/each}}\n\
				</tbody>\n\
			</table>\n\
		</div>\n\
	</div>\n\
{{else}}{{#if isFetching}}\n\
	{{#if isOrdering}}\n\
	<div class=\"c_loading detail_loading\"><strong>这里是汉字，这里是汉字</strong></div>\n\
	{{else}}\n\
	<div class=\"c_loading detail_loading\"><strong>这里是汉字，这里是汉字</strong></div>\n\
	{{/if}}\n\
{{else}}{{#if isFetchFail}}\n\
	{{#if errmsg}}\n\
	<div class=\"no_resource_txt\">{{errmsg}}</div>\n\
	{{else}}\n\
	{{#if isServerError}}\n\
	<div class=\"no_resource_txt\">这里是汉字，这里是汉字，这里是汉字。</div>\n\
	{{else}}\n\
	<div class=\"no_resource_txt\">这里是汉字，这里是汉字，这里是汉字。</div>\n\
	{{/if}}\n\
	{{/if}}\n\
{{/if}}{{/if}}{{/if}}\n\
</div>\n\
<div id=\"jmp_pkg_title\" style=\"display:none;\">\n\
	<div class=\"jmp_bd flt_jmp\">\n\
		<strong>${txt0}</strong>\n\
		<p>${txt1}</p>\n\
	</div> \n\
</div>\n\
<div id=\"jmp_single_title\" style=\"display:none;\">\n\
  <div class=\"jmp_bd\">\n\
	<p>${txt}</p>\n\
  </div>\n\
</div>\n\
");
define("tpl/detail/order_money_contain.html.js",[],"\n\
{{#anyNoneEmpty FeeInfos FlightContains}}\n\
<div id=\"js-money-contain\" class=\"flt_htl_resource basefix\">\n\
	<h3 class=\"resource_title\">\n\
		这里是汉字&nbsp;&nbsp;这里是汉字<i class=\"icon_b icon_b_03\"></i>\n\
	</h3>\n\
	{{#notEmpty FeeInfos}}\n\
	<div class=\"cost_detail\"{{#unless FlightContains}} style=\"border-bottom:0\"{{/unless}}>\n\
		\n\
			{{#each FeeInfos}}\n\
				{{#notEmpty PkgDescEntitys}}\n\
				<h4 class=\"resource_detail_title\">{{TitleName}}</h4>\n\
				<ul class=\"resource_detail_list\">\n\
					{{#each PkgDescEntitys}}\n\
					<li>{{Detail}}</li>\n\
					{{/each}}\n\
				</ul>\n\
				{{/notEmpty}}\n\
			{{/each}}\n\
	</div>\n\
	{{/notEmpty}}\n\
	{{#notEmpty FlightContains}}\n\
	<div class=\"include_flt basefix\">\n\
		<h4>\n\
			<i></i>这里是汉字\n\
		</h4>\n\
		<div class=\"flt_detail_wrap\">\n\
			{{#each FlightContains}}\n\
			<span class=\"pubFlights_{{AirlineCode}}\">{{this.AirlineName}}&nbsp;{{this.FlightNo}}({{this.DepartCityName}}{{this.DepartTime}}-{{this.ArriveCityName}}{{this.ArriveTime}})</span>\n\
			{{/each}}\n\
		</div>\n\
	</div>\n\
	{{/notEmpty}}\n\
</div>\n\
{{/anyNoneEmpty}}");
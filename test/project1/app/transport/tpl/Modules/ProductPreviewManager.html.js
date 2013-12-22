define("tpl/Modules/ProductPreviewManager.html.js",[],"<div id=\"js-preview-photo\" class=\"attraction_photo_big\" data-id=\"{{FirstPreview.ImageID}}\">	\n\
	<img src=\"{{FirstPreview.Url}}\" alt=\"{{FirstPreview.ImageDesc}}\" width=\"500px\" height=\"280px\">\n\
	<a href=\"javascript:;\" title=\"\" class=\"prev\"></a>\n\
	<a href=\"javascript:;\" title=\"\" class=\"next\"></a>\n\
	<div class=\"photo_name\">\n\
		<p>1/{{Data.length}} {{FirstPreview.ImageDesc}}</p>\n\
		<a style=\"display:none;\" href=\"javascript:;\" title=\"这里是汉字\" class=\"play\">这里是汉字</a>\n\
		<a href=\"javascript:;\" title=\"这里是汉字\" class=\"stop\">这里是汉字</a>\n\
	</div>\n\
</div>\n\
<div id=\"js-preview-video\" class=\"attraction_photo_big\" style=\"display:none\">\n\
	<embed quality=\"high\" width=\"100这里是汉字\" height=\"100这里是汉字\" align=\"middle\" allowscriptaccess=\"sameDomain\" type=\"application/x-shockwave-flash\" wmode=\"transparent\">\n\
</div>\n\
<div class=\"attraction_photo_small\">\n\
	<div class=\"small_photo_wrap\">\n\
		<ul style=\"position:absolute\">\n\
			{{#each Data}}\n\
			{{#modulus @index 5 0}}\n\
			<li>\n\
			{{/modulus}}\n\
			{{#is ImageDesc \'!==\' undefined}}\n\
			<a{{#unless @index}} class=\"current\"{{/unless}} href=\"javascript:;\" title=\"{{ImageDesc}}\" data-type=\"image\"><img src=\"{{#each Gallery}}{{#is @index 0}}{{Url}}{{/is}}{{/each}}\" data-big-url=\"{{#each Gallery}}{{#is @index 1}}{{Url}}{{/is}}{{/each}}\" alt=\"{{ImageDesc}}\" width=\"82px\" height=\"46px\"><span><i></i></span></a>\n\
			{{else}}\n\
			<a{{#unless @index}} class=\"current\"{{/unless}} href=\"javascript:;\" title=\"{{VideoDesc}}\" data-type=\"video\"><img src=\"{{ThumbnailUrl}}\" data-big-url=\"{{VideoUrl}}\" alt=\"{{VideoDesc}}\" width=\"82px\" height=\"46px\"><span><i></i></span></a>\n\
			{{/is}}\n\
			{{#modulus @index 5 4}}\n\
			</li>\n\
			{{/modulus}}\n\
			{{/each}}\n\
		</ul>\n\
	</div>\n\
	<div class=\"small_photo_control\">\n\
		<a href=\"javascript:;\" title=\"这里是汉字\" class=\"prev prev_disable\"><i></i></a>\n\
		<a href=\"javascript:;\" title=\"这里是汉字\" class=\"next\"><i></i></a>\n\
	</div>\n\
</div>");
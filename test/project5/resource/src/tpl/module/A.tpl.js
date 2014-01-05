define("tpl/module/A.tpl",[],function(){
	return "<div class=\"wrapper\">\n\
	<ul>\n\
	<% for(var i=0, len = students.length; i<len; i++){ %>\n\
		<% var student = students[i]; %>\n\
		<li><%= student.name %>: <%= student.age %></li>\n\
	<% } %>\n\
	</ul>\n\
</div>"});
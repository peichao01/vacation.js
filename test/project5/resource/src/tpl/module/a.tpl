<div class="wrapper">
	<ul>
	<% for(var i=0, len = students.length; i<len; i++){ %>
		<% var student = students[i]; %>
		<li><%= student.name %>: <%= student.age %></li>
	<% } %>
	</ul>
</div>
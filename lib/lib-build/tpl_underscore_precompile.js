;(function(){
	var u = _;
	if(u){
		if(u.___vacation) return;
		var prevTemplate = u.template;
		u.template = function(text, data, settings){
			if(typeof text == 'function' && text.___vacationPrecompiled) return data ? text(data) : text;
			return prevTemplate.call(_, text, data, settings);
		}
		u.___vacation = true;
	}
})();
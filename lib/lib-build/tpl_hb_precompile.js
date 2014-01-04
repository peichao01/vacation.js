;(function(){
	var h = Handlebars;
	if(h){
		if(h.___vacation) return;
		var prevCompile = h.compile;
		h.compile = function (input, options) {
			if(typeof input == 'function' && input.___vacationPrecompiled) return input;
			return prevCompile.call(this, input, options);
		}
		h.___vacation = true;
	}
})();
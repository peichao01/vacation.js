Function.prototype.derive = function(constructor, proto){
    if(typeof constructor === 'object'){
        proto = constructor;
        constructor = proto.constructor || function(){};
        delete proto.constructor;
    }
    var parent = this;
    var fn = function(){
        parent.apply(this, arguments);
        constructor.apply(this, arguments);
    };
    var tmp = function(){};
    tmp.prototype = parent.prototype;
    var fp = new tmp(),
        cp = constructor.prototype,
        key;
    for(key in cp){
        if(cp.hasOwnProperty(key)){
            fp[key] = cp[key];
        }
    }
    proto = proto || {};
    for(key in proto){
        if(proto.hasOwnProperty(key)){
            fp[key] = proto[key];
        }
    }
    fp.constructor = constructor.prototype.constructor;
    fn.prototype = fp;
    return fn;
};

function A(name){
	this.name = name;
}
A.prototype.wang = function(){
	console.log('Im ' + this.name);
}

var B = A.derive({
	wang: function(){
		
	},
	say: function(){
		console.log('hi, i am '+this.name);
	}
});

var a = new A('a');
var b = new B('b');

a.wang();
b.wang();
b.say();

console.log(a);
console.log(b);

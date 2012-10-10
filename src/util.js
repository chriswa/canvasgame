// dummy console.log to avoid errors when console.log is left in!
if (!window.console) {
  var logger = window.opera ? window.opera.postError : function() {};
  window.console = { log: logger };
}

// es5 shim for bind
if ( !Function.prototype.bind ) {
  Function.prototype.bind = function( obj ) {
    var slice = [].slice,
    args = slice.call(arguments, 1),
    self = this,
    nop = function () {},
    bound = function () {
      return self.apply( this instanceof nop ? this : ( obj || {} ), args.concat( slice.call(arguments) ) );
    };
    nop.prototype = self.prototype;
    bound.prototype = new nop();
    return bound;
  };
}

// polyfill window.requestAnimationFrame / window.cancelAnimationFrame from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                               || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());

// polyfill Object.create
if (!Object.create) {
  Object.create = function (o) {
    if (arguments.length > 1) {
      throw new Error('Object.create polyfill only accepts the first parameter.');
    }
    function F() {}
    F.prototype = o;
    return new F();
  };
}

// Object.build is Object.create, plus an init(...) call
// adapted from http://stackoverflow.com/a/6571266
Object.build = function(o) {
  var initArgs = Array.prototype.slice.call(arguments, 1);
  function F() {
    if ((typeof o.init === 'function')) {
      o.init.apply(this, initArgs);
    }
  }
  F.prototype = o;
  return new F();
}

// Object.extend is Object.create, which then has properties merged into it
Object.extend = function(BaseClass, properties) {
  /*
  var o = Object.create(BaseClass);
  for (prop in properties) {
    o[prop] = properties[prop];
  }
  return o;
  */
  var o = {};
  for (prop in BaseClass)  { o[prop] = BaseClass[prop]; }
  for (prop in properties) { o[prop] = properties[prop]; }
  return o;
};

// now()
var now;
if (window.performance && window.performance.now) {
  now = window.performance.now.bind(window.performance);
} else {
  if (window.performance && window.performance.webkitNow) {
    now = window.performance.webkitNow.bind(window.performance);
  } else {
    now = function() { return new Date().getTime(); };
  }
}

//
function clamp(min, value, max) {
  if (value < min) { return min; }
  if (value > max) { return max; }
  return value;
}

//
function sign(value) {
  return (value >= 0 ? 1 : -1);
}

//
function showme() {
  var args = Array.prototype.slice.call(arguments, 0);
  console.log(args);
  //console.trace();
}

//
// console.assert()!
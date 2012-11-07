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
Object.buildArgs = function(o, initArgs) {
  function F() {
    if ((typeof o.init === 'function')) {
      o.init.apply(this, initArgs);
    }
  }
  F.prototype = o;
  return new F();
};

Object.build = function(o) {
  return Object.buildArgs(o, Array.prototype.slice.call(arguments, 1))
};

//// Object.extend is Object.create, which then has properties merged into it
//Object.extend = function(BaseClass, properties) {
//  /*
//  var o = Object.create(BaseClass);
//  for (prop in properties) {
//    o[prop] = properties[prop];
//  }
//  return o;
//  */
//  var o = {};
//  for (prop in BaseClass)  { o[prop] = BaseClass[prop]; }
//  for (prop in properties) { o[prop] = properties[prop]; }
//  return o;
//};

// Object.extend is Object.create, which then has properties merged into it
Object.extend = function(BaseClass, properties) {
  
  //var o = {};
  //for (prop in BaseClass)  { o[prop] = BaseClass[prop]; }
  //for (prop in properties) { o[prop] = properties[prop]; }

  var o = Object.create(BaseClass);
  for (prop in properties) {
    o[prop] = properties[prop];
  }
  
  // provide "uber" method
  o.BaseClass = BaseClass;
  var depth = {};
  o.uberArgs = function(methodName, args) {
    if (!(methodName in depth)) { depth[methodName] = 0; }
    var targetClass = BaseClass;
    for (var i = 0; i < depth[methodName]; i++) {
      targetClass = targetClass.BaseClass;
    }
    depth[methodName] += 1;
    var retVal = targetClass[methodName].apply(this, args);
    depth[methodName] -= 1;
    return retVal;
  };
  o.uber = function(methodName) {
    var args = Array.prototype.slice.call(arguments, 1);
    return o.uberArgs.call(this, methodName, args);
  };
  
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
function loadQueryString() {
  var params = {};
  var queryElements = document.location.search.substring(1).split(/\&/);
  for (var i in queryElements) {
    var nameVal = queryElements[i].split(/\=/);
    params[unescape(nameVal[0])] = unescape(nameVal[1]);
  }
  return params;
}

//
function showme() {
  var args = Array.prototype.slice.call(arguments, 0);
  console.log(args);
  //console.trace();
}

//
function pixelRectToTileRect(pixelRect, cols, rows, tileSize) {
  var tileRect = {};
  tileRect.x1 = Math.max(Math.floor( pixelRect.x1 / tileSize ), 0);
  tileRect.x2 = Math.min(Math.ceil(  pixelRect.x2 / tileSize ), cols);
  tileRect.y1 = Math.max(Math.floor( pixelRect.y1 / tileSize ), 0);
  tileRect.y2 = Math.min(Math.ceil(  pixelRect.y2 / tileSize ), rows);
  return tileRect;
}

//
function renderTiles(canvas, ctx, cols, rows, renderOffsetX, renderOffsetY, ts, getTile, tileImg, tileImgCols) {
  // find background tiles overlapping canvas
  var pixelRect = { x1: renderOffsetX, x2: renderOffsetX + canvas.width, y1: renderOffsetY, y2: renderOffsetY + canvas.height };
  var tileRect  = pixelRectToTileRect(pixelRect, cols, rows, ts);
  
  // blit background tiles
  var tx, ty, tileIndex;
  ty = Math.round(tileRect.y1 * ts - renderOffsetY);
  for (var y = tileRect.y1; y < tileRect.y2; y++) {
    tx = Math.round(tileRect.x1 * ts - renderOffsetX);
    for (var x = tileRect.x1; x < tileRect.x2; x++) {
      tileIndex = getTile(x, y);
      CANVAS_CTX.drawImage(tileImg, ts * (tileIndex % tileImgCols), ts * Math.floor(tileIndex / tileImgCols), ts, ts, tx, ty, ts, ts);
      //CANVAS_CTX.strokeStyle = '#000'; CANVAS_CTX.strokeRect(tx + 0.5, ty + 0.5, ts - 1, ts - 1);
      tx += ts;
    }
    ty += ts;
  }

}

// checks AABB overlaps
// accepts an absolute hitbox {x1,y1,x2,y2} and a collection of objects which are optionally mapped to yield a collection of absolute hitboxes, calls the callback on overlaps
function overlapOneToManyAABBs(oneAbsHitbox, many, callback, map) {
  if (!map) { map  = _.identity; }
  _.each(many, function(other) {
    var otherAbsHitbox = map(other);
    if (otherAbsHitbox && checkAbsHitboxOverlap(oneAbsHitbox, otherAbsHitbox)) {
      callback(other);
    }
  });
}

//
function checkAbsHitboxOverlap(absHitbox1, absHitbox2) {
  return (
    absHitbox1.x1 < absHitbox2.x2 &&
    absHitbox1.x2 > absHitbox2.x1 &&
    absHitbox1.y1 < absHitbox2.y2 &&
    absHitbox1.y2 > absHitbox2.y1
  );
}

//
function relToAbsHitbox(relHitbox, pos) {
  return { x1: relHitbox.x1 + pos.x, y1: relHitbox.y1 + pos.y, x2: relHitbox.x2 + pos.x, y2: relHitbox.y2 + pos.y };
}


//
// console.assert()!
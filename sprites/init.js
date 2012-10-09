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

// 
function post(obj) {
  var form = $('<form method="POST">').appendTo($(document))
  for (var key in obj) {
    $('<input type="hidden">').attr('name', key).attr('value', obj[key]).appendTo(form);
  }
  form.submit();
}

// 
function now() {
  //return (new Date) * 1 - 1;
  return new Date().getTime();
}

//
var Preview = {
  init: function() {
    this.canvas  = document.getElementById('canvas');
    if (!this.canvas) { throw new Error("Preview: Could not find canvas!"); }
    this.ctx     = this.canvas.getContext('2d');
    this.texture = document.getElementById('texture');
    if (!this.texture) { throw new Error("Preview: Could not find texture!"); }
    this.simTime = now();
    this.render();
  },
  startAnimation: function(animationFrames) {
    if (animationFrames.length) {
      this.delayRemaining = 1;
      this.frameIndex     = -1;
      this.frames         = $.extend({}, animationFrames); // deep copy
    }
  },
  MAX_FRAME_SKIP: 3,
  SIM_STEP_TIME:  1000 / 30,
  render: function() {
    if (this.frames) {
      var framesUpdatedBeforeRendering = 0;
      while (this.simTime < now()) {
        this.simTime += this.SIM_STEP_TIME;
        if (framesUpdatedBeforeRendering === this.MAX_FRAME_SKIP + 1) {
          console.log('FRAME SKIP!');
          this.simTime = now();
          break;
        }
        framesUpdatedBeforeRendering++;
        
        this.delayRemaining -= this.SIM_STEP_TIME;
        if (this.delayRemaining <= 0) {
          this.frameIndex++;
          var animFrame = this.frames[this.frameIndex];
          if (!animFrame) {
            this.frameIndex = 0;
            animFrame = this.frames[this.frameIndex];
          }
          this.delayRemaining += animFrame.duration;
          var slice = slices[animFrame.slice];
          
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          
          this.ctx.drawImage(this.texture, slice[0], slice[1], slice[2], slice[3], 50 - animFrame.x,        25 + animFrame.y,   slice[2], slice[3]);
          
          this.ctx.translate(this.canvas.width + 0.5, 0.5); // XXX: ?
          this.ctx.scale(-1, 1);
          this.ctx.drawImage(this.texture, slice[0], slice[1], slice[2], slice[3], 0.5 + 50 + animFrame.x_flipped - slice[2], -0.5 + 150 + animFrame.y, slice[2], slice[3]);
          this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
    }
    setTimeout( this.render.bind(this), this.SIM_STEP_TIME );
  }
};

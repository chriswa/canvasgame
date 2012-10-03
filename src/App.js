
var canvas, ctx;

// App object
var App = {
  
  isRunning: false,
  age: 0,
  game: null,
  fpsUpdate: null,
  fpsRender: null,
  
  SIM_STEP_TIME:  1000 / 30, // simulation framerate!
  MAX_FRAME_SKIP: 3,
  simTime:        null,
  
  init: function( game ) {
    this.game = game;
    
    // initialize video globals
    canvas = document.getElementById('canvas');
    ctx    = canvas.getContext('2d');
    
    // show loading screen
    ctx.fillStyle    = '#ccc';
    ctx.font         = 'bold 30px sans-serif';
    ctx.textAlign    = 'center';
    ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
    
    this.fpsUpdate = Object.build(FPSCounter);
    this.fpsRender = Object.build(FPSCounter);
    
    // auto-pause when window loses focus, and unpause when focus returns (for development - in production, i'll want to wait for a click while showing that the user should click!)
    $(window).blur(function() { App.pause(); });
    $(canvas).click(function() { App.start(); });
    
    Input.init();
    
    // load resources, then call callback
    ResourceManager.init( function() {
      game.init();
      App.start();
    });
  },
  
  // API for starting, pausing, and stepping
  start: function() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.simTime = now();
      this.updateLoop();
    }
  },
  pause: function() {
    if (this.isRunning) {
      this.isRunning = false;
      this.drawPausedScreen();
    }
  },
  stepAndPause: function() {
    this.pause();
    this.update();
    this.render(1.0);
    this.drawPausedScreen();
  },
  
  // 
  update: function() {
    this.age++;
    Debug.update();
    Input.update();
    this.game.update();
    //$('#fps-update').text(this.fpsUpdate.measure().toFixed(1));
  },
  render: function(stepInterpolation) {
    this.game.render(stepInterpolation);
    Debug.render(stepInterpolation);
    if (window.extraRenderFunction) { window.extraRenderFunction(); }
    $('#fps-render').text(this.fpsRender.measure().toFixed(1));
  },
  
  updateLoop: function() {
    if (!this.isRunning) { return; }
    
    // simulate up to one step into the future (if we lagged behind, simulate up to this.MAX_FRAME_SKIP steps; if we were super fast, we may not have any updating to do!)
    var framesUpdatedBeforeRendering = 0;
    while (this.simTime < now()) {
      
      // don't simulate more than this.MAX_FRAME_SKIP steps before rendering
      if (framesUpdatedBeforeRendering === this.MAX_FRAME_SKIP + 1) {
        console.log('FRAME SKIP!');
        this.simTime = now();
        break;
      }
      framesUpdatedBeforeRendering++;
    
      // simulate one step and push forward sim time by one time step
      this.update();
      this.simTime += this.SIM_STEP_TIME;
      
    }
    $('#skipped').text( framesUpdatedBeforeRendering > 1 ? (framesUpdatedBeforeRendering - 1) + ' skipped' : '' );
    //if (framesUpdatedBeforeRendering > 1) {
    //  console.log('framesUpdatedBeforeRendering = ' + framesUpdatedBeforeRendering);
    //}
    
    // for rendering, determine interpolation between last step and current step
    var stepInterpolation = 1 - (this.simTime - now()) / this.SIM_STEP_TIME; // 0 is current frame, 1 is previous frame
//console.log([now(), this.simTime, stepInterpolation]);
    // clamp to 0..1, just in case!
    stepInterpolation = Math.min(1, Math.max(0, stepInterpolation));
    //stepInterpolation = 1;
    this.render(stepInterpolation);
    
    // render!
    if (Debug.updateLoop === 'requestAnimationFrame') {
      window.requestAnimationFrame( this.updateLoop.bind(this), canvas );
    }
    else if (Debug.updateLoop === 'hybrid') {
      App._hybridAnimationFrameEnabled = true;
      App._hybridAnimationFrameRequest = window.requestAnimationFrame( App._hybridAnimationFrameHandler, canvas );
      setTimeout(function() {
        App._hybridAnimationFrameEnabled = false;
        //console.log('timeout');
        cancelAnimationFrame(App._hybridAnimationFrameRequest);
        App.updateLoop();
      }, 0);
    }
    else {
      setTimeout(this.updateLoop.bind(this), 0);
    }
  },
  _hybridAnimationFrameEnabled: false,
  _hybridAnimationFrameRequest: undefined,
  _hybridAnimationFrameHandler: function() {
    if (Debug.updateLoop !== 'hybrid') { return; }
    if (!App.isRunning) { return; }
    if (!App._hybridAnimationFrameEnabled) { return; }
    var stepInterpolation = 1 - (App.simTime - now()) / App.SIM_STEP_TIME; // 0 is current frame, 1 is previous frame
    stepInterpolation = Math.min(1, Math.max(0, stepInterpolation));
    App.render(stepInterpolation);
    App._hybridAnimationFrameRequest = window.requestAnimationFrame( App._hybridAnimationFrameHandler.bind(this), canvas );
  },
  
  // 
  drawPausedScreen: function() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.40, canvas.height * 0.35);
    ctx.lineTo(canvas.width * 0.60, canvas.height * 0.50);
    ctx.lineTo(canvas.width * 0.40, canvas.height * 0.65);
    ctx.fill();
    
    //var text      = 'click to unpause';
    //ctx.font      = '40pt Arial';
    //ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    //ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 20);
    //ctx.fillRect(canvas.width*.6, canvas.height*.3, canvas.width*.1, canvas.height*.4);
  },
  
  blitSliceByFilename: function(sliceFilename, x, y, w, h) {
    var slice = R.sliceNames[sliceFilename];
    if (!w) { w = slice[2]; }
    if (!h) { h = slice[3]; }
    ctx.drawImage(R.images.ui[0], slice[0], slice[1], slice[2], slice[3], x, y, w, h);
  },
  
};

//
function getUniqueId() {
  return getUniqueId.counter++;
}
getUniqueId.counter = 0;

//
var FPSCounter = {
  fps: 0,
  now: null,
  lastUpdate: 0,
  fpsFilter: 20, // debounce: the higher this value, the less the FPS will be affected by quick changes
  measure: function() {
    var thisFrameFPS = 1000 / ((this.now = now()) - this.lastUpdate);
    if (!isFinite(thisFrameFPS)) { return this.fps; } // no time passed, skip this check
    this.fps += (thisFrameFPS - this.fps) / this.fpsFilter;
    this.lastUpdate = this.now;
    return this.fps;
  }
};

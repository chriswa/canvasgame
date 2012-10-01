
var canvas, ctx;

// App object
var App = {
  
  isRunning: false,
  age: 0,
  game: null,
  fpsUpdate: null,
  fpsRender: null,
  
  SIM_STEP_TIME:  1000 / 30, // simulation framerate!
  MAX_FRAME_SKIP: 5,
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
    this.clearDebugShapes(); // simply clears them
    Input.update();
    this.game.update();
    //$('#fps-update').text(this.fpsUpdate.measure().toFixed(1));
  },
  render: function(stepInterpolation) {
    this.game.render(stepInterpolation);
    this.renderDebugShapes();
    if (window.extraRenderFunction) { window.extraRenderFunction(); }
    $('#fps-render').text(this.fpsRender.measure().toFixed(1));
  },
  
  updateLoop: function() {
    if (!this.isRunning) { return; }
    
    // simulate up to one step into the future (if we lagged behind, simulate up to this.MAX_FRAME_SKIP steps; if we were super fast, we may not have any updating to do!)
    var framesUpdatedBeforeRendering = 0;
    while (this.simTime < now()) {
    
      // push simulation forward by one step
      this.update();
      this.simTime += this.SIM_STEP_TIME;
      
      // don't simulate more than this.MAX_FRAME_SKIP steps before rendering
      framesUpdatedBeforeRendering++;
      if (framesUpdatedBeforeRendering === this.MAX_FRAME_SKIP + 1) {
        console.log('FRAME SKIP!');
        simTime = now();
        break;
      }
    }
    $('#skipped').text( framesUpdatedBeforeRendering > 1 ? (framesUpdatedBeforeRendering - 1) + ' skipped' : '' );
    //if (framesUpdatedBeforeRendering > 1) {
    //  console.log('framesUpdatedBeforeRendering = ' + framesUpdatedBeforeRendering);
    //}
    
    // render!
    // determine interpolation between last step and current step
    var stepInterpolation = 1 - (this.simTime - now()) / this.SIM_STEP_TIME; // 0 is current frame, 1 is previous frame
//console.log([now(), this.simTime, stepInterpolation]);
    // clamp to 0..1, just in case!
    stepInterpolation = Math.min(1, Math.max(0, stepInterpolation));
    this.render(stepInterpolation);
    
    window.requestAnimationFrame( this.updateLoop.bind(this), canvas );
    //setTimeout(this.updateLoop.bind(this), 10);
  },
  
  /*
  // running the game continuously
  updateLoop: function() {
    if (!this.isRunning) { return; }
    this.update();
    $('#fps-update').text(this.fpsUpdate.measure().toFixed(1));
    window.requestAnimationFrame( this.renderLoop.bind(this), canvas );
    //setTimeout(this.renderLoop.bind(this), 0);
  },
  renderLoop: function() {
    if (!this.isRunning) { return; }
    this.render();
    var fps = this.fpsRender.measure().toFixed(1);
    //window.setTimeout( this.updateLoop.bind(this), 0 );
    
    window.setTimeout( function() {
      $('#fps-render').text(fps);
      App.updateLoop();
    }, 0);
  },
  */
  
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
  
  /*
  mainLoop: function() {
    if (!this.isRunning) { return; }
    window.requestAnimationFrame( this.mainLoop.bind(this), canvas );
    this.step();
    $('#fps').text(fps.measure().toFixed(1));
  },
  */
  /*
  mainLoop: function() {
    if (!this.isRunning) { return; }
    this.step();
    window.requestAnimationFrame( this.game.render.bind(this.game), canvas );
    window.setTimeout(this.mainLoop.bind(this), 1000 / 60);
    $('#fps').text(fps.measure().toFixed(1));
  },
  */
  
  debugShapesToDraw: [],
  drawDebugRect: function(rect, colour) {
    this.debugShapesToDraw.push({type: 'rect', rect: rect, colour: colour || '#f0f'});
  },
  clearDebugShapes: function() {
    this.debugShapesToDraw = []
  },
  renderDebugShapes: function() {
    _.each(this.debugShapesToDraw, function(shape) {
      ctx.strokeStyle = shape.colour;
      if (shape.type === 'rect') {
        var rect = shape.rect;
        ctx.strokeRect(rect.x1 - Game.area.renderOffsetX, rect.y1 - Game.area.renderOffsetY, rect.x2 - rect.x1, rect.y2 - rect.y1);
      }
    });
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

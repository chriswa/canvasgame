// globals
var canvas, ctx;

// App object
var App = {
  
  isRunning: false,
  age: 0,
  game: null,
  fpsUpdate: null,
  fpsRender: null,
  
  SIM_SPEED:           1.0,
  SIM_STEP_MIN:        1000 * 1/60, // for stability, simulation delta times will not be smaller than this
  SIM_STEP_MAX:        1000 * 1/30, // for stability, simulation delta times will not be greater than this
  SIM_STEP_HARD_LIMIT: 1000 * 3/30, // for playability, each render frame will not advance simulation time more than this (avoiding the death spiral!)
  simTime: null,
  
  init: function() {
    this.game = Game;
    
    // initialize video globals
    canvas = document.getElementById('canvas');
    ctx    = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    // show loading screen
    this.drawTextScreen('Loading...', '#fff', '#ccc');
    
    this.fpsUpdate = Object.build(FPSCounter);
    this.fpsRender = Object.build(FPSCounter);
    
    // auto-pause when window loses focus, and unpause when focus returns (for development - in production, i'll want to wait for a click while showing that the user should click!)
    $(window).blur(function() { App.pause(); });
    $(canvas).click(function() { App.start(); });
    
    Input.init();
    
    // load resources, then call callback
    ResourceManager.init( function() {
      App.game.init();
      Debug.init();
      App.start();
    });
  },
  
  // API for starting, pausing, and stepping
  start: function() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.simTime = now();
      this.render();
      this.updateLoop();
    }
  },
  pause: function() {
    if (this.isRunning) {
      this.isRunning = false;
      this.drawPausedScreen();
    }
  },
  stepAndPause: function(dt) {
    this.pause();
    this.update(dt);
    this.simTime += dt;
    this.render();
    this.drawPausedScreen();
  },
  
  // 
  update: function(dt) {
    this.age += dt;
    Debug.update();
    Input.update();
    this.game.update(dt);
    //$('#fps-update').text(this.fpsUpdate.measure().toFixed(1));
  },
  render: function() {
    this.game.render();
    Mobile.render();
    Debug.render();
  },
  
  updateLoop: function() {
    if (!this.isRunning) { return; }
    
    if (Debug.timestep === '1/30') {
      this.SIM_STEP_MIN = 1000 / 30;
      this.SIM_STEP_MAX = 1000 / 30;
    }
    else if (Debug.timestep === '1/60') {
      this.SIM_STEP_MIN = 1000 / 60;
      this.SIM_STEP_MAX = 1000 / 60;
    }
    else {
      this.SIM_STEP_MIN = 1000 / 60;
      this.SIM_STEP_MAX = 1000 / 30;
    }
    
    var dt = (now() - this.simTime) * this.SIM_SPEED;
    
    // if more than the minimum time has passed, update then render
    if (dt > this.SIM_STEP_MIN) {
      
      // if more than the hard limit has passed, allow the game to slow down to avoid the spiral of death
      if (dt > this.SIM_STEP_HARD_LIMIT && this.SIM_SPEED === 1.0) {
        console.log('App: SLOWDOWN! ' + (dt - this.SIM_STEP_HARD_LIMIT) + 'ms abandoned!');
        this.simTime += dt - this.SIM_STEP_HARD_LIMIT;
        dt = this.SIM_STEP_HARD_LIMIT;
      }
      
      // figure out how many updates to run (we need more than 1 if more than the maximum time has passed)
      var requiredSteps = Math.ceil( dt / this.SIM_STEP_MAX );
      var stepDt        = dt / requiredSteps;
      //if (requiredSteps > 1) { console.log('rendering ' + requiredSteps + ' simulation steps this frame because dt > SIM_STEP_MAX'); }
      for ( var i = 0; i < requiredSteps; i++ ) {
        this.update(stepDt);
        this.simTime += stepDt / this.SIM_SPEED;
      }
      
      // render!
      this.render();
    }
    
    // loop!
    if (Debug.updateLoop === 'requestAnimationFrame') {
      window.requestAnimationFrame( this.updateLoop.bind(this), canvas );
    }
    else if (Debug.updateLoop === 'aggressive') {
      if (!this.recursionCount) { this.recursionCount = 0; }
      this.recursionCount++
      if (this.recursionCount === 100) { this.recursionCount = 0; setTimeout(this.updateLoop.bind(this), 0); }
      else { this.updateLoop(); }
    }
    else {
      setTimeout(this.updateLoop.bind(this), 0);
    }
  },

  
  //
  paintScreen: function(colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },
  
  // 
  drawPausedScreen: function() {
    this.paintScreen('rgba(0, 0, 0, 0.5)')
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.40, canvas.height * 0.35);
    ctx.lineTo(canvas.width * 0.60, canvas.height * 0.50);
    ctx.lineTo(canvas.width * 0.40, canvas.height * 0.65);
    ctx.fill();
  },
  
  drawTextScreen: function(text, colour, backgroundColour) {
    colour           = colour           || '#900';
    backgroundColour = backgroundColour || '#000';
    this.paintScreen(backgroundColour);
    ctx.font      = 'bold 50px sans-serif';
    ctx.fillStyle = colour;
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 20);
  },
  
  blitSliceByFilename: function(sliceFilename, x, y, w, h) {
    var slice = R.sliceNames[sliceFilename];
    var textureName = slice[4];
    if (!w) { w = slice[2]; }
    if (!h) { h = slice[3]; }
    ctx.drawImage(R.images[textureName][0], slice[0], slice[1], slice[2], slice[3], x, y, w, h);
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

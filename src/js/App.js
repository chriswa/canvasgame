// App object (singleton)
var App = {
  
  audioEnabled: true,
  
  isRunning: false,
  fpsRender: null,
  
  SIM_SPEED:           1.0,
  SIM_STEP_MIN:        1000 * 1/60, // for stability, simulation delta times will not be smaller than this
  SIM_STEP_MAX:        1000 * 1/30, // for stability, simulation delta times will not be greater than this
  SIM_STEP_HARD_LIMIT: 1000 * 3/30, // for playability, each render frame will not advance simulation time more than this (avoiding the death spiral!)
  simTime: null,
  
  init: function(isProduction) {
    
    // show/hide dom elements
    {
      // toggle default elements
      $('#static-loading').hide();
      $('.default-on').show();
      
      // toggle elements for production/development mode
      if (isProduction) {
        Debug.showStatusbar = false;
        $('.production-toggle').toggle();
      }
      else {
        $('.development-toggle').toggle();
      }
      
      // toggle mobile-unfriendly elements off in mobile mode
      if (Mobile.isMobile) { $('.mobile-off').hide(); }
    }
    
    // initialize video globals
    CANVAS = document.getElementById('canvas');
    CANVAS.onselectstart = function () { return false; } // prevent text selection on doubleclick
    GFX    = CANVAS.getContext('2d');
    //GFX.imageSmoothingEnabled = false;
    
    // show loading screen
    this.drawTextScreen('Loading...', '#ccc', '#fff');
    
    // auto-pause when window loses focus, and unpause when focus returns (for development - in production, i'll want to wait for a click while showing that the user should click!)
    $(window).blur(function() { App.pause(); });
    $(CANVAS).click(function() { App.start(); });
    if (Mobile.isMobile) {
      $(window).focus(function() { App.start(); });
    }
    
    Input.init();
    
    // load resources, then call callback
    var startTime = now();
    ResourceManager.init( function() {
      console.log("ResourceManager: " + (now() - startTime).toFixed(1) + "ms");
      Game.init();
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
    Debug.update();
    Input.update();
    Game.update(dt);
  },
  render: function() {
    Game.render();
    Mobile.render();
    Debug.render();
  },
  
  // main loop
  updateLoop: function() {
    if (!this.isRunning) { return; }
    
    var dt = (now() - this.simTime) * this.SIM_SPEED;
    
    // if more than the minimum time has passed, update then render
    if (dt > this.SIM_STEP_MIN) {
      
      // if more than the hard limit has passed, allow the game to slow down to avoid the spiral of death
      if (dt > this.SIM_STEP_HARD_LIMIT && this.SIM_SPEED === 1.0) {
        //console.log('App: SLOWDOWN! ' + (dt - this.SIM_STEP_HARD_LIMIT) + 'ms abandoned!');
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
      window.requestAnimationFrame( this.updateLoop.bind(this), CANVAS );
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
    GFX.fillStyle = colour;
    GFX.fillRect(0, 0, CANVAS.width, CANVAS.height);
  },
  
  // 
  drawPausedScreen: function() {
    this.paintScreen('rgba(0, 0, 0, 0.5)')
    GFX.fillStyle = 'rgba(255, 255, 255, 0.5)';
    GFX.beginPath();
    GFX.moveTo(CANVAS.width * 0.40, CANVAS.height * 0.35);
    GFX.lineTo(CANVAS.width * 0.60, CANVAS.height * 0.50);
    GFX.lineTo(CANVAS.width * 0.40, CANVAS.height * 0.65);
    GFX.fill();
  },
  
  drawTextScreen: function(text, colour, backgroundColour) {
    colour           = colour           || '#900';
    backgroundColour = backgroundColour || '#000';
    this.paintScreen(backgroundColour);
    GFX.font      = 'bold 50px sans-serif';
    GFX.fillStyle = colour;
    GFX.textAlign = 'center';
    GFX.fillText(text, CANVAS.width / 2, CANVAS.height / 2 + 16);
  },
  
  blitSliceByFilename: function(sliceFilename, x, y, w, h) {
    var slice = R.spriteSlicesByOriginalFilename[sliceFilename];
    var textureName = slice[4];
    if (!w) { w = slice[2]; }
    if (!h) { h = slice[3]; }
    GFX.drawImage(R.spriteTextures[textureName][0], slice[0], slice[1], slice[2], slice[3], x, y, w, h);
  },
  
  playSfx: function(filename) {
    if (!this.audioEnabled) { return; }
    var samples = R.sfx[filename];
    for (var i = 0; i < samples.length; i += 1) {
      var sample = samples[i];
      if (sample.paused || sample.ended) {
        sample.currentTime = 0;
        sample.play();
        return sample;
      }
    }
    samples[0].pause();
    samples[0].currentTime = 0.1; // force the next line to seek!
    samples[0].currentTime = 0;
    samples[0].play();
    return samples[0];
  }
  
};

//
function getUniqueId() {
  return getUniqueId.counter++;
}
getUniqueId.counter = 0;

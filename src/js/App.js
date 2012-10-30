// App object (singleton)
var App = {
  
  isMobile: null,
  audioEnabled: true,
  request: null,
  
  isRunning: false,
  fpsRender: null,
  
  SIM_SPEED:           1.0,
  SIM_STEP_MIN:        1000 * 1/60, // for stability, simulation delta times will not be smaller than this
  SIM_STEP_MAX:        1000 * 1/30, // for stability, simulation delta times will not be greater than this
  SIM_STEP_HARD_LIMIT: 1000 * 3/30, // for playability, each render frame will not advance simulation time more than this (avoiding the death spiral!)
  simTime: null,
  
  init: function(isProduction) {
    
    // load request object from ?query=string
    this.request = loadQueryString();
    
    // check if we're on mobile first, since we may need to resize canvas element
    var forceMobile = this.request['mobile'];
    this.isMobile = ('ontouchstart' in window) || forceMobile;
    
    // allow isProduction to be forced from query string
    if (this.request['production'])  { isProduction = true; }
    if (this.request['development']) { isProduction = false; }
    
    if (this.isMobile) {
      // galaxy nexus is 598 x 360 (?)
      $('#canvas').attr('width', 598).attr('height', 360).css({ border: 'none', margin: 0 });
      // iphone 4 is 320 x 460
      //$('#canvas').attr('width', 480).attr('height', 300).css({ border: 'none', margin: 0 });
    }

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
      if (this.isMobile) { $('.mobile-off').hide(); }
    }
    
    // initialize video globals
    CANVAS = document.getElementById('canvas');
    CANVAS.onselectstart = function () { return false; } // prevent text selection on doubleclick
    CANVAS_CTX = CANVAS.getContext('2d');
    //CANVAS_CTX.imageSmoothingEnabled = false;
    
    // show loading screen
    App.gfx.drawTextScreen('Loading...', '#ccc', '#fff');
    
    Input.init();
    
    // load resources, then call callback
    var startTime = now();
    ResourceManager.init( function() {
      console.log("ResourceManager: " + (now() - startTime).toFixed(1) + "ms");
      Game.init();
      Debug.init();
      
      // auto-pause when window loses focus, and unpause when focus returns (for development - in production, i'll want to wait for a click while showing that the user should click!)
      $(window).blur(function() { App.pause(); });
      $(CANVAS).click(function() { App.start(); });
      if (this.isMobile) {
        $(window).focus(function() { App.start(); });
      }
      
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
      App.gfx.drawPausedScreen();
    }
  },
  stepAndPause: function(dt) {
    this.pause();
    this.update(dt);
    this.simTime += dt;
    this.render();
    App.gfx.drawPausedScreen();
  },
  
  // 
  update: function(dt) {
    Debug.update();
    Input.update();
    Game.update(dt);
  },
  render: function() {
    Game.render();
    Input.render();
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
  onSystemKeyPress: function(keyName) {
    if (keyName === 'esc') { if (this.isRunning) { this.pause(); } else { this.start(); } }
    if (keyName === '6') { this.stepAndPause(1000 * 1 / 60); }
    if (keyName === '3') { this.stepAndPause(1000 * 1 / 30); }
  },
  
  
  
  gfx: {
    
    //
    paintScreen: function(colour) {
      CANVAS_CTX.fillStyle = colour;
      CANVAS_CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
    },
    
    // 
    drawPausedScreen: function() {
      App.gfx.paintScreen('rgba(0, 0, 0, 0.5)')
      CANVAS_CTX.fillStyle = 'rgba(255, 255, 255, 0.5)';
      CANVAS_CTX.beginPath();
      CANVAS_CTX.moveTo(CANVAS.width * 0.40, CANVAS.height * 0.35);
      CANVAS_CTX.lineTo(CANVAS.width * 0.60, CANVAS.height * 0.50);
      CANVAS_CTX.lineTo(CANVAS.width * 0.40, CANVAS.height * 0.65);
      CANVAS_CTX.fill();
    },
    
    drawTextScreen: function(text, colour, backgroundColour) {
      colour           = colour           || '#900';
      backgroundColour = backgroundColour || '#000';
      App.gfx.paintScreen(backgroundColour);
      CANVAS_CTX.font      = 'bold 50px sans-serif';
      CANVAS_CTX.fillStyle = colour;
      CANVAS_CTX.textAlign = 'center';
      CANVAS_CTX.fillText(text, CANVAS.width / 2, CANVAS.height / 2 + 16);
    },
    
    blitSliceByFilename: function(sliceFilename, x, y, w, h) {
      var slice = R.spriteSlicesByOriginalFilename[sliceFilename];
      var textureName = slice[4];
      if (!w) { w = slice[2]; }
      if (!h) { h = slice[3]; }
      CANVAS_CTX.drawImage(R.spriteTextures[textureName][0], slice[0], slice[1], slice[2], slice[3], x, y, w, h);
    },
    
  },
  
  sfx: {
    play: function(filename) {
      if (!App.audioEnabled) { return; }
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
  }
  
};

//
function getUniqueId() {
  return getUniqueId.counter++;
}
getUniqueId.counter = 0;

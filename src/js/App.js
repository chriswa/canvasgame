// App object (singleton)
var App = {
  
  isMobile: null,
  audioEnabled: true,
  request: null,
  
  isRunning: false,
  fpsRender: null,
  
  SIM_SPEED:           1.0,
  SIM_STEP_MIN:        1000 * 1/60, // for stability, simulation delta times will never be smaller than this
  SIM_STEP_MAX:        1000 * 1/30, // for stability, simulation delta times will never be greater than this
  SIM_STEP_HARD_LIMIT: 1000 * 3/30, // for playability, each render frame will never advance simulation time more than this (also avoiding the game loop "death spiral")
  simTime: null,
  
  init: function(isProduction) {
    
    // load request object from url (i.e. ?query=string)
    this.request = loadQueryString();
    
    // disable audio?
    if (this.request.nosound) { Audio.toggleAudio(); }
    
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
    Video.drawTextScreen('Loading...', '#ccc', '#fff');
    
    Input.init();
    
    // load resources, then call callback
    var startTime = now();
    ResourceManager.init( _.once(function() {
      console.log("ResourceManager initialized in " + (now() - startTime).toFixed(1) + "ms");
      Game.init();
      Debug.init();
      
      // auto-pause when window loses focus, and unpause when focus returns (for development - in production, i'll want to wait for a click while showing that the user should click!)
      $(window).blur(function() { App.pause(); });
      $(CANVAS).click(function() { App.start(); });
      if (this.isMobile) {
        $(window).focus(function() { App.start(); });
      }
      
      App.start();
    }));
  },
  
  // API for starting, pausing, and stepping
  start: function() {
    if (!this.isRunning) {
      Audio.unpauseMusic();
      this.isRunning = true;
      this.simTime = now();
      this.render();
      this.updateLoop();
    }
  },
  pause: function() {
    if (this.isRunning) {
      this.isRunning = false;
      Video.drawPausedScreen();
      Audio.pauseMusic();
    }
  },
  stepAndPause: function(dt) {
    this.pause();
    this.update(dt);
    this.simTime += dt;
    this.render();
    Video.drawPausedScreen();
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
  }
  
};

var Input = Object.extend(FiniteStateMachine, {
  
  // NOTE: this FSM calls update, render, onkeydown, onkeyup, and ontouch on its activeState
  
  keyDown: {}, // track keyDowns at all times so we can ignore automatic key repeats, as well as provide the current keyboard state during state transitions
  currentTouches: [], // provide the current screen input state during state transitions
  isMouseDown: false,
  
  // system keys that App wants events for (App.onSystemKeyPress)
  systemKeys: {
    27:  'esc',
    192: 'tilde',
    51:  '3',
    54:  '6'
  },
  
  // keys to disable default browser behaviour for
  preventDefaultKeys: {
    37:  'left',
    39:  'right',
    40:  'down',
    38:  'up'
  },
  
  //
  init: function() {
    // set initial state
    this.setState(this.none);
    
    // set up all global input handlers
    window.onkeydown = this.onkeydown.bind(this);
    window.onkeyup   = this.onkeyup.bind(this);
    var ontouch      = this.ontouch.bind(this);
    var ontouchend   = this.ontouchend.bind(this);
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', ontouch);
      document.addEventListener('touchmove', ontouch);
      document.addEventListener('touchend', ontouchend);
      document.addEventListener('touchcancel', ontouchend);
    }
    else {
      document.addEventListener('mousedown', this.onmousedown.bind(this));
      document.addEventListener('mousemove', this.onmousemove.bind(this));
      document.addEventListener('mouseup', this.onmouseup.bind(this));
    }
  },
  
  // update and render are delegated to the active state
  update: function(dt) {
    this.updateState();
    if (this.activeState.update) { this.activeState.update(dt); }
  },
  render: function() {
    if (this.activeState.render) { this.activeState.render(); }
  },
  
  // global event handlers
  onkeydown: function(e) {
    var evt = e ? e:event;
    var keyCode = evt.keyCode;
    
    //console.log(keyCode);
    
    // ignore auto-repeated keys
    if (!Input.keyDown[keyCode]) {
      
      // update our representation of the state of the keyboard
      Input.keyDown[keyCode] = true;
      
      // report event to activeState
      this.activeState.onkeydown(keyCode);
      
      // report "system keys" to App
      if (Input.systemKeys[keyCode]) { App.onSystemKeyPress(Input.systemKeys[keyCode]); }
      
    }
    
    // prevent browser defaults for certain keys
    if (Input.preventDefaultKeys[keyCode]) {
      e.preventDefault();
      return false;
    }
    else {
      return true;
    }
    
  },
    
  onkeyup: function(e) {
    var evt = e ? e:event;
    var keyCode = evt.keyCode;
    delete Input.keyDown[keyCode];
    
    // report event to activeState
    this.activeState.onkeyup(keyCode);
  },
  
  // encapsulate mouse evens so we can treat it the same as a one-finger touch
  onmousedown: function(e) {
    var evt = e ? e:event;
    this.isMouseDown = true;
    this.onscreeninput([{x: e.pageX - $('#canvas')[0].offsetLeft, y: e.pageY - $('#canvas')[0].offsetTop}]);
  },
  onmousemove: function(e) {
    var coords = {x: e.pageX - $('#canvas')[0].offsetLeft, y: e.pageY - $('#canvas')[0].offsetTop};
    if (this.isMouseDown) {
      this.onscreeninput([coords]);
    }
    else {
      this.activeState.onmouseover(coords);
    }
  },
  onmouseup: function(e) {
    this.isMouseDown = false;
    this.onscreeninput([]);
    this.onscreenup({x: e.pageX - $('#canvas')[0].offsetLeft, y: e.pageY - $('#canvas')[0].offsetTop});
  },
  
  // gather touch information and pass it along to our generalized mouse/touch handler
  ontouch: function(event) {
    var touches = [];
    for (var i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];
      touches.push({ x: touch.pageX, y: touch.pageY });
    }
    this.onscreeninput(touches);
  },
  
  ontouchend: function(event) {
    if (this.currentTouches.length > 0) {
      this.onscreenup(this.currentTouches[0]);
    }
    this.ontouch(event);
  },
  
  // generalized mouse/touch handler (XXX: also handles Debug buttons)
  onscreeninput: function(touches) {
    var isHoldingReset = false;
    for (var i = 0; i < touches.length; i++) {
      var x = touches[i].x;
      var y = touches[i].y;
      
      if (y < 50 && x < 50) {
        Debug.showStatusbar = !Debug.showStatusbar;
      }
      
      if (y < 50 && x > 275 && x < 325) {
        isHoldingReset = true;
        if (!this.refreshButtonTimeout) {
          this.refreshButtonTimeout = setTimeout(function() {
            App.pause();
            App.gfx.drawTextScreen("Refresh!", "#000", "#f0f");
            setTimeout(function() { window.location.reload(); }, 0);
          }, 750);
        }
      }
    }
    
    if (this.refreshButtonTimeout && !isHoldingReset) {
      clearTimeout(this.refreshButtonTimeout);
      this.refreshButtonTimeout = null;
    }
    
    this.currentTouches = touches;
    
    // report event to activeState
    this.activeState.ontouch(touches);
  },
  
  //
  onscreenup: function(coords) {
    this.activeState.ontouchup(coords);
  }
  
});


var Input = {
  keyDown: {},
  _keyJustPressed: {},
  keyPressed: {},
  keysToCapture: {
    
    // system control
    27:  'esc',
    192: 'tilde',
    49:  'one',
    
    // game
    37:  'left',
    39:  'right',
    40:  'down',
    16:  'jump',   // <shift>
    17:  'attack', // <ctrl>
    
    // game alternates
    90:  'jump',   // <Z>
    88:  'attack', // <X>
  },
  init: function() {
    window.onkeydown = function(e) {
      var evt = e ? e:event;
      var keyCode = evt.keyCode;
      
      //console.log(keyCode);
      
      var keyName = Input.keysToCapture[keyCode];
      
      // if we don't want the key, give it to the browser
      if (!keyName) { return true; }
      
      if (keyName === 'esc') { if (App.isRunning) { App.pause(); } else { App.start(); } }
      if (keyName === 'tilde') { App.stepAndPause(); }
      if (keyName === 'one') { Game.reset(); }
      
      e.preventDefault();
      
      // ignore auto-repeated keys
      if (Input.keyDown[keyName]) { return false; }
      
      Input.keyDown[keyName] = true;
      Input._keyJustPressed[keyName] = true;
      
      return false;
    };
    
    window.onkeyup = function(e) {
      var evt = e ? e:event;
      var keyCode = evt.keyCode;
      var keyName = Input.keysToCapture[keyCode];
      delete Input.keyDown[keyName];
    };
  },
  update: function() {
    this.keyPressed = this._keyJustPressed;
    this._keyJustPressed = {};
  },
  touchDown: function(keyName) {
    Input.keyDown[keyName] = true;
    Input._keyJustPressed[keyName] = true;
  },
  touchUp: function(keyName) {
    delete Input.keyDown[keyName];
  },
};


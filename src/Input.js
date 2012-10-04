var Input = {
  keyDown: {},
  _keyJustPressed: {},
  keyPressed: {},
  keysToCapture: {
    
    // system control
    27:  'esc',
    192: 'tilde',
    51:  '3',
    54:  '6',
    
    // game
    37:  'left',
    39:  'right',
    40:  'down',
    16:  'jump',   // <shift>
    17:  'attack', // <ctrl>
    
    // game alternates
    90:  'jump',   // <Z>
    88:  'attack', // <X>
    32:  'jump',   // <spacebar>
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
      if (keyName === '6') { App.stepAndPause(1000 * 1 / 60); }
      if (keyName === '3') { App.stepAndPause(1000 * 1 / 30); }
      
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


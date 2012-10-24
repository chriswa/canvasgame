Input.gamepad = {
  
  held: {},
  pressed: {},
  
  onenterstate: function() {
    this.held    = {};
    this.pressed = {};
    
    this.ontouch(Input.currentTouches);
    _.each(Object.keys(Input.keyDown), function(keycode) {
      Input.gamepad.onkeydown(keycode);
    });
  },
  onleavestate: function(nextState) {
    this.held    = {};
    this.pressed = {};
  },
  keys: {
    37:  'left',
    39:  'right',
    40:  'down',
    38:  'up',
    16:  'jump',   // <shift>
    17:  'attack', // <ctrl>
    // alternatives
    90:  'jump',   // <Z>
    88:  'attack', // <X>
    32:  'jump'   // <spacebar>
  },
  buttons: {
    left:   { x:   0, y: 185, w:  50, h: 215 },
    right:  { x: 100, y: 185, w:  75, h: 215 },
    down:   { x:   0, y: 310, w: 175, h:  90 },
    up:     { x:   0, y: 185, w: 175, h:  75 },
    jump:   { x:   0, y:   0, w:   0, h:   0 },
    attack: { x:   0, y:   0, w:   0, h:   0 }
  },
  onkeydown: function(keycode) {
    var buttonName = this.keys[keycode];
    if (buttonName) {
      Input.gamepad.held[buttonName] = true;
      this._buttonsJustPressed[buttonName] = true;
    }
  },
  onkeyup: function(keycode) {
    delete Input.gamepad.held[ this.keys[keycode] ];
  },
  onmouseover: function(coords) {
  },
  ontouch: function(touches) {
    if (!App.isMobile) { return; }
    var isPressing = {};
    for (var i = 0; i < touches.length; i++) {
      var x = touches[i].x;
      var y = touches[i].y;
      
      for (var buttonName in this.buttons) {
        var button = this.buttons[buttonName];
        if (x > button.x && x < button.x + button.w && y > button.y && y < button.y + button.h) {
          isPressing[buttonName] = true;
        }
      }
      if (x > 400 && y > 160) { isPressing[ (x - 400 > y - 160) ? 'attack' : 'jump' ] = true; }
    }
    for (var buttonName in this.buttons) {
      var button = this.buttons[buttonName];
      if (isPressing[buttonName] && !Input.gamepad.held[buttonName]) {
        Input.gamepad.held[buttonName] = true;
        this._buttonsJustPressed[buttonName] = true;
      }
      if (!isPressing[buttonName] && Input.gamepad.held[buttonName]) {
        delete Input.gamepad.held[buttonName];
      }
    }
    Input.gamepad.held = isPressing;
  },
  ontouchup: function(coords) {
  },
  update: function(dt) {
    Input.gamepad.pressed    = this._buttonsJustPressed;
    this._buttonsJustPressed = {};
  },
  render: function() {
    if (!App.isMobile) { return; }
    
    GFX.globalAlpha = 0.5;
    GFX.strokeStyle = '#fff';
    
    // draw dpad
    var origin = { x: 0, y: 209 };
    var size   = 150;
    // up
    GFX.fillStyle = Input.gamepad.held.up ? '#fff' : '#000';
    GFX.beginPath(); GFX.moveTo(0.5+origin.x+size*1/2, 0.5+origin.y+size*1/2); GFX.lineTo(0.5+origin.x+size*1/3, 0.5+origin.y+size*1/3); GFX.lineTo(0.5+origin.x+size*1/3, 0.5+origin.y); GFX.lineTo(0.5+origin.x+size*2/3, 0.5+origin.y); GFX.lineTo(0.5+origin.x+size*2/3, 0.5+origin.y+size*1/3); GFX.lineTo(0.5+origin.x+size*1/2, 0.5+origin.y+size*1/2); GFX.fill(); GFX.stroke();
    // down
    GFX.fillStyle = Input.gamepad.held.down ? '#fff' : '#000';
    GFX.beginPath(); GFX.moveTo(0.5+origin.x+size*1/2, 0.5+origin.y+size*1/2); GFX.lineTo(0.5+origin.x+size*1/3, 0.5+origin.y+size*2/3); GFX.lineTo(0.5+origin.x+size*+origin.x+size*1/3, 0.5+origin.y+size); GFX.lineTo(0.5+origin.x+size*2/3, 0.5+origin.y+size); GFX.lineTo(0.5+origin.x+size*2/3, 0.5+origin.y+size*2/3); GFX.lineTo(0.5+origin.x+size*1/2, 0.5+origin.y+size*1/2); GFX.fill(); GFX.stroke();
    // left
    GFX.fillStyle = Input.gamepad.held.left ? '#fff' : '#000';
    GFX.beginPath(); GFX.moveTo(0.5+origin.x+size*1/2, 0.5+origin.y+size*1/2); GFX.lineTo(0.5+origin.x+size*1/3, 0.5+origin.y+size*1/3); GFX.lineTo(0.5+origin.x, 0.5+origin.y+size*1/3); GFX.lineTo(0.5+origin.x, 0.5+origin.y+size*2/3); GFX.lineTo(0.5+origin.x+size*1/3, 0.5+origin.y+size*2/3); GFX.lineTo(0.5+origin.x+size*1/2, 0.5+origin.y+size*1/2); GFX.fill(); GFX.stroke();
    // right
    GFX.fillStyle = Input.gamepad.held.right ? '#fff' : '#000';
    GFX.beginPath(); GFX.moveTo(0.5+origin.x+size*1/2, 0.5+origin.y+size*1/2); GFX.lineTo(0.5+origin.x+size*2/3, 0.5+origin.y+size*1/3); GFX.lineTo(0.5+origin.x+size, 0.5+origin.y+size*1/3); GFX.lineTo(0.5+origin.x+size, 0.5+origin.y+size*2/3); GFX.lineTo(0.5+origin.x+size*2/3, 0.5+origin.y+size*2/3); GFX.lineTo(0.5+origin.x+size*1/2, 0.5+origin.y+size*1/2); GFX.fill(); GFX.stroke();
    
    // draw attack/jump buttons
    // attack
    GFX.fillStyle = Input.gamepad.held.attack ? '#fff' : '#000';
    GFX.beginPath(); GFX.arc(550, 240, 40, 0, Math.PI*2, true); GFX.fill(); GFX.stroke();
    // jump
    GFX.fillStyle = Input.gamepad.held.jump ? '#fff' : '#000';
    GFX.beginPath(); GFX.arc(480, 310, 40, 0, Math.PI*2, true); GFX.fill(); GFX.stroke();
    
    GFX.fillStyle = '#fff';
    GFX.font      = 'bold 10px sans-serif';
    GFX.textAlign = 'center';
    GFX.fillText("attack", 550, 240 + 3);
    GFX.fillText("jump", 480, 310 + 3);
    
    GFX.globalAlpha = 1;
  }
};
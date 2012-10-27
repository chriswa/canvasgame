Input.gui = {
  
  controls: undefined,
  hoverControl: undefined,
  depressControl: undefined,
  
  onenterstate: function() {
    this.controls = [];
  },
  onleavestate: function() {
  },
  
  // ignore keyboard
  onkeydown: function(keycode) {},
  onkeyup: function(keycode) {},
  
  //
  onmouseover: function(coords) {
    Input.gui.hoverControl = undefined;
    this._findControlAtCoords(coords, function(control) { Input.gui.hoverControl = control; });
  },
  ontouch: function(touches) {
    Input.gui.hoverControl = undefined;
    Input.gui.depressControl = undefined;
    _.each(touches, function(coords) {
      this._findControlAtCoords(coords, function(control) { Input.gui.depressControl = control; });
    }, this);
  },
  ontouchup: function(coords) {
    var clickedControl = undefined;
    this._findControlAtCoords(coords, function(control) { clickedControl = control; });
    if (clickedControl && clickedControl.onclick) {
      clickedControl.onclick();
    }
  },
  _findControlAtCoords: function(coords, callback) {
    var hitbox = { x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y };
    overlapOneToManyAABBs(hitbox, this.controls, callback, function(control) { return control.hitbox; });
  },
  
  // gui building api
  addButton: function() {
    var button = Object.buildArgs(this.controlTypes.button, Array.prototype.slice.call(arguments));
    this.controls.push(button);
  },
  
  update: function(dt) {
  },
  
  render: function() {
    _.each(this.controls, function(control) {
      if (control.render) {
        var controlState = 'normal';
        if (control === Input.gui.hoverControl) { controlState = 'hover'; }
        if (control === Input.gui.depressControl) { controlState = 'press'; }
        control.render( controlState );
      }
    })
  },
  
  controlTypes: {
    button: {
      init: function(label, hitbox, onclick) {
        this.label   = label;
        this.hitbox  = hitbox;
        this.onclick = onclick;
      },
      render: function(controlState) {
        CANVAS_CTX.fillStyle = { normal: '#333', hover: '#666', press: '#999' }[controlState];
        CANVAS_CTX.fillRect(0.5+this.hitbox.x1, 0.5+this.hitbox.y1, this.hitbox.x2 - this.hitbox.x1, this.hitbox.y2 - this.hitbox.y1);
        var textSizePx = 20;
        CANVAS_CTX.font      = 'bold '+textSizePx+'px sans-serif';
        CANVAS_CTX.fillStyle = '#fff';
        CANVAS_CTX.textAlign = 'center';
        CANVAS_CTX.fillText(this.label, (this.hitbox.x1 + this.hitbox.x2) / 2, (this.hitbox.y1 + this.hitbox.y2) / 2 + (textSizePx / 3));
      }
    }
  }
  
};
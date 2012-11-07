var OWEncounter = Object.extend(Sprite, {
  
  tx: undefined,
  ty: undefined,
  
  vx: 0,
  vy: 0,
  moveRemaining: 0,
  
  type: null,
  
  age: 0,
  
  SPEED: 250, // milliseconds to move one tile
  
  init: function(type, tx, ty) {
    if (type !== 'blob' && type !== 'monster' && type !== 'fairy') { throw new Error("OverworldEncounter: unknown type " + type); }
    Sprite.init.call(this, 'ow' + type);
    this.type = type;
    this.tx = tx;
    this.ty = ty;
    this.x = this.tx * 32;
    this.y = this.ty * 32;
  },
  
  update: function(dt) {
    
    this.age += dt;
    if (this.age > Game.overworld.ENCOUNTER_LIFETIME) { this.kill(); }
    
    // we only have control if we're not executing a move
    if (this.moveRemaining <= 0) {
      
      // abolish any accumulated floating point errors
      this.x = this.tx * 32;
      this.y = this.ty * 32;
      
      //
      var ptx = Game.overworld.getPlayerX();
      var pty = Game.overworld.getPlayerY();
      if (Math.random() < 0.5) {
        if      (ptx > this.tx) { this.startMove(  1,  0); }
        else if (ptx < this.tx) { this.startMove( -1,  0); }
      }
      else {
        if      (pty > this.ty) { this.startMove(  0,  1 ); }
        else if (pty < this.ty) { this.startMove(  0, -1 ); }
      }
      
      if (this.moveRemaining <= 0) {
        
        // move randomly
        var r = Math.random();
        if      (r < 0.25) { this.startMove( -1,  0); }
        else if (r < 0.50) { this.startMove(  1,  0); }
        else if (r < 0.75) { this.startMove(  0, -1); }
        else               { this.startMove(  0,  1); }
      }
      
    }
    
    // 
    if (this.moveRemaining > 0) {
      this.moveRemaining -= dt;
      this.x += dt * this.vx;
      this.y += dt * this.vy;
    }
    
    // 
    this.advanceAnimation(dt);
    
  },
  
  startMove: function(dtx, dty) {
    var newTX = this.tx + dtx;
    var newTY = this.ty + dty;
    
    // initiate move
    this.tx            = newTX;
    this.ty            = newTY;
    this.vx            = dtx * 32 / this.SPEED;
    this.vy            = dty * 32 / this.SPEED;
    this.moveRemaining = this.SPEED;
  },
  
});

var OverworldEncounter = Object.extend(Sprite, {
  
  tx: undefined,
  ty: undefined,
  
  vx: 0,
  vy: 0,
  moveRemaining: 0,
  
  age: 0,
  
  SPEED: 250, // milliseconds to move one tile
  EXPIRY_TIME: 8000, // automatically die after this long
  
  init: function(type, tx, ty) {
    if (type !== 'owblob' && type !== 'owmonster' && type !== 'owfairy') { throw new Error("OverworldEncounter: unknown type " + type); }
    Sprite.init.call(this, type);
    this.tx = tx;
    this.ty = ty;
    this.x = this.tx * 32;
    this.y = this.ty * 32;
  },
  
  update: function(dt) {
    
    this.age += dt;
    if (this.age > this.EXPIRY_TIME) { this.kill(); }
    
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
      else if (Math.random() < 1.00) {
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
    var tileIndex = Game.overworld.getTile(newTX, newTY);
    
    // initiate move
    this.tx            = newTX;
    this.ty            = newTY;
    this.vx            = dtx * 32 / this.SPEED;
    this.vy            = dty * 32 / this.SPEED;
    this.moveRemaining = this.SPEED;
  },
  
});

var OverworldPlayer = Object.extend(Sprite, {
  
  vx: 0,
  vy: 0,
  moveRemaining: 0,
  
  SPEED: 250, // milliseconds to move one tile
  SWAMP_SPEED: 500,
  
  init: function() {
    Sprite.init.call(this, 'owplayer');
    this.startAnimation('stand');
  },
  
  update: function(dt) {
    
    // we only have control if we're not executing a move
    if (this.moveRemaining <= 0) {
      
      // abolish any accumulated floating point errors
      this.x = Game.player.overworldX * 32;
      this.y = Game.player.overworldY * 32;
      
      // move?
      if      (Input.keyDown.left)  { this.startMove( -1,  0); }
      else if (Input.keyDown.right) { this.startMove(  1,  0); }
      else if (Input.keyDown.up)    { this.startMove(  0, -1); }
      else if (Input.keyDown.down)  { this.startMove(  0,  1); }
      
      // we haven't started a move? stand still
      if (this.moveRemaining <= 0) {
        this.startAnimation('stand');
        this.imageModifier = R.IMG_ORIGINAL;
      }
      
    }
    
    // 
    if (this.moveRemaining > 0) {
      this.moveRemaining -= dt;
      this.x += dt * this.vx;
      this.y += dt * this.vy;
      if (this.moveRemaining <= 0) {
        Game.overworld.findAndQueuePlayerExit();
      }
    }
    
    // 
    this.advanceAnimation(dt);
    
  },
  
  startMove: function(dtx, dty) {
    var newTX = Game.player.overworldX + dtx;
    var newTY = Game.player.overworldY + dty;
    var tileIndex = Game.overworld.getTile(newTX, newTY);
    
    // can't move into water or mountains
    if (tileIndex === 0 || tileIndex === 4) { return; }
    
    // player moves slower going into swamps
    var speed = (tileIndex === 6) ? this.SWAMP_SPEED : this.SPEED;
    
    // initiate move
    Game.player.overworldX = newTX;
    Game.player.overworldY = newTY;
    this.vx                = dtx * 32 / speed;
    this.vy                = dty * 32 / speed;
    this.moveRemaining     = speed;
    
    // animate
    this.imageModifier = R.IMG_ORIGINAL;
    if (dty < 0) {
      this.startAnimation('walk-north');
    }
    else if (dty > 0) {
      this.startAnimation('walk-south');
    }
    else if (dtx < 0) {
      this.imageModifier = R.IMG_FLIPX;
      this.startAnimation('walk-east');
    }
    else if (dtx > 0) {
      this.startAnimation('walk-east');
    }
  },
  
});

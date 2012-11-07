var OWPlayer = Object.extend(Sprite, {
  
  vx: 0,
  vy: 0,
  moveRemaining: 0,
  lastDir: undefined,
  
  SPEED: 250, // milliseconds to move one tile
  SWAMP_SPEED: 500,
  
  init: function() {
    Sprite.init.call(this, 'owplayer');
    this.startAnimation('stand');
  },
  
  reset: function() {
    this.moveRemaining = 0;
  },
  
  update: function(dt) {
    
    var timeLeft = dt;
    
    // 
    if (this.moveRemaining > 0) {
      this.moveRemaining -= timeLeft;
      this.x += timeLeft * this.vx;
      this.y += timeLeft * this.vy;
      timeLeft = -this.moveRemaining;
      if (this.moveRemaining <= 0) {
        if (Game.overworld.findAndQueuePlayerExit()) {
          this.advanceAnimation(dt);
          return;
        }
      }
    }
    
    // we only have control if we're not executing a move
    if (this.moveRemaining <= 0) {
      
      // abolish any accumulated floating point errors
      this.x = Game.player.overworldX * 32;
      this.y = Game.player.overworldY * 32;
      
      // move?
      if ( Input.gamepad.held.up    && this.moveRemaining <= 0 ) { if (this.startMove(  0, -1)) { this.lastDir = 'north'; } }
      if ( Input.gamepad.held.down  && this.moveRemaining <= 0 ) { if (this.startMove(  0,  1)) { this.lastDir = 'south'; } }
      if ( Input.gamepad.held.left  && this.moveRemaining <= 0 ) { if (this.startMove( -1,  0)) { this.lastDir = 'west';  } }
      if ( Input.gamepad.held.right && this.moveRemaining <= 0 ) { if (this.startMove(  1,  0)) { this.lastDir = 'east';  } }
      
      // we haven't started a move? stand still
      if (this.moveRemaining <= 0) {
        this.startAnimation('stand');
      }
      
    }
    
    // 
    if (this.moveRemaining > 0 && timeLeft > 0) {
      this.moveRemaining -= timeLeft;
      this.x += timeLeft * this.vx;
      this.y += timeLeft * this.vy;
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
    
    // can't move into water or mountains or boulders
    if (Overworld.terrainTypes.isImpassable(tileIndex)) { return false; }
    
    // player moves slower going into swamps
    var speed = Overworld.terrainTypes.isSwampy(tileIndex) ? this.SWAMP_SPEED : this.SPEED;
    
    // initiate move
    Game.player.overworldX = newTX;
    Game.player.overworldY = newTY;
    this.vx                = dtx * 32 / speed;
    this.vy                = dty * 32 / speed;
    this.moveRemaining     = speed;
    
    // animate
    this.facing = 1;
    if (dty < 0) {
      this.startAnimation('walk-north');
    }
    else if (dty > 0) {
      this.startAnimation('walk-south');
    }
    else if (dtx < 0) {
      this.facing = -1;
      this.startAnimation('walk-east');
    }
    else if (dtx > 0) {
      this.startAnimation('walk-east');
    }
    return true;
  },
  
  finishMove: function() {
    this.moveRemaining = 0;
    this.x = Game.player.overworldX * 32;
    this.y = Game.player.overworldY * 32;
    this.startAnimation('stand');
    this.advanceAnimation(0);
  }
  
});

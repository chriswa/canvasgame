R.spawnableSprites['HammerThrower'] = Object.extend(Enemy, {
  hitbox: { x1: -12, y1: -32, x2: 12, y2: 32 },
  
  health: 8,
  
  throwTimer:     0,
  jumpTimer:      15,
  changeDirTimer: 0,
  throwCount:     0,
  
  direction: 1,
  
  WALK_SPEED:     1.0,
  JUMP_IMPULSE:   -10,
  HAMMER_VX:      2,
  HAMMER_VY:      -5.5,
  HAMMER_GRAVITY: 0.15,
  
  init: function(area) {
    Enemy.init.call(this, area, 'hammer-thrower');
    this.startAnimation('default');
  },
  
  updateFixedStep: function(dt) {
    // update hurt timers, etc
    if (this.isHurt) { this.updateWhenHurt(dt); }
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    // turn to face player
    var facing = (this.area.playerSprite.x > this.x) ? 1 : -1;
    this.imageModifier = facing === 1 ? R.IMG_ORIGINAL : R.IMG_FLIPX;
    
    //
    this.throwTimer     += 1;
    this.jumpTimer      += 1;
    this.changeDirTimer += 1;
    
    if (this.changeDirTimer >= 60) {
      this.changeDirTimer = 0;
      this.direction = -this.direction;
    }
    if (this.jumpTimer >= 180) {
      this.jumpTimer = 0;
      this.vy = this.JUMP_IMPULSE;
    }
    if (this.throwTimer === 20) {
      this.playAnimation('throw');
    }
    if (this.throwTimer >= 30) {
      this.playAnimation('default');
      this.throwTimer = 0;
      this.area.spawn(R.spawnableSprites['ProjHammer'], { x: this.x + facing * 12, y: this.y - 16, vx: facing * this.HAMMER_VX, vy: this.HAMMER_VY, gravity: this.HAMMER_GRAVITY });
      
      // brief rest after 7 throws
      this.throwCount += 1;
      if (this.throwCount === 7) {
        this.throwCount = 0;
        this.throwTimer = -10;
        this.jumpTimer  -= 10;
      }
    }
    this.vx = this.direction * this.WALK_SPEED;
    
    // when hurt, stumble backwards
    if (this.hurtTimer > 200) {
      this.vx = -facing * 4 * (this.hurtTimer - 200) / 300;
    }
    
    // standard enemy stuff
    this.vy += this.gravity;
    this.translateWithTileCollisions( this.vx, this.vy );
    this.advanceAnimation( this.FIXED_STEP );
    if (this.touching.outOfBounds) { this.kill(); }
    if (this.touching.bottom || this.touching.top) { this.vy = 0; }
    
  },
});
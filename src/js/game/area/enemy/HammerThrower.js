R.spawnableSprites['HammerThrower'] = Object.extend(Entity, {
  hitbox: { x1: -12, y1: -32, x2: 12, y2: 32 },
  
  health: 8,
  damageToPlayer: 2,
  
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
    Entity.init.call(this, area, 'hammer-thrower');
    this.startAnimation('default');
  },
  
  updateFixedStep: function(dt) {
    // update hurt timers, etc
    this.updateWhenHurt(dt);
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    // turn to face player
    this.facing = (this.area.playerEntity.x > this.x) ? 1 : -1;
    
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
      this.area.spawn(R.spawnableSprites['ProjHammer'], { x: this.x + this.facing * 12, y: this.y - 16, vx: this.facing * this.HAMMER_VX, vy: this.HAMMER_VY, gravity: this.HAMMER_GRAVITY });
      
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
      this.vx = -this.facing * 4 * (this.hurtTimer - 200) / 300;
    }
    
    // standard enemy stuff
    this.vy += this.gravity;
    this.touching = this.translateWithTileCollisions( this.vx, this.vy );
    this.advanceAnimation( this.FIXED_STEP );
    if (this.isOutOfBounds()) { this.kill(); }
    if (this.touching.bottom || this.touching.top) { this.vy = 0; }
    
  },
});
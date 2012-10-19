R.spawnableSprites['HammerThrower'] = Object.extend(Enemy, {
  hitbox: { x1: -12, y1: -32, x2: 12, y2: 32 },
  
  health: 8,
  
  throwTimer:     0,
  jumpTimer:      0,
  changeDirTimer: 0,
  
  direction: 1,
  
  WALK_SPEED:    0.4,
  JUMP_IMPULSE:  -10,
  HAMMER_VX:     5,
  HAMMER_VY:     -14,
  
  init: function(area) {
    Enemy.init.call(this, area, 'hammer-thrower');
    this.startAnimation('default');
  },
  
  onStabbed: function() {
    this.isReadyToFire = false;
    Enemy.onStabbed.apply(this);
  },
  
  updateFixedStep: function() {
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    // turn to face player
    var facing = (this.area.playerSprite.x > this.x) ? 1 : -1;
    this.imageModifier = facing === 1 ? R.IMG_ORIGINAL : R.IMG_FLIPX;
    
    //
    this.throwTimer     += 1;
    this.jumpTimer      += 1;
    this.changeDirTimer += 1;
    
    if (this.changeDirTimer > 90) {
      this.changeDirTimer = 0;
      this.direction = -this.direction;
    }
    if (this.jumpTimer > 180) {
      this.jumpTimer = 0;
      this.vy = this.JUMP_IMPULSE;
    }
    if (this.throwTimer === 20) {
      this.playAnimation('throw');
    }
    if (this.throwTimer > 30) {
      this.playAnimation('default');
      this.throwTimer = 0;
      this.area.spawn(R.spawnableSprites['ProjHammer'], { x: this.x - facing * 12, y: this.y - 16, vx: facing * this.HAMMER_VX, vy: this.HAMMER_VY });
    }
    this.vx = this.direction * this.WALK_SPEED;
    
    // standard enemy stuff
    this.vy += this.gravity;
    this.translateWithTileCollisions( this.vx, this.vy );
    this.advanceAnimation( this.FIXED_STEP );
    if (this.touching.outOfBounds) { this.kill(); }
    if (this.touching.bottom || this.touching.top) { this.vy = 0; }
    
  },
});
R.spawnableSprites['Octorok'] = Object.extend(Enemy, {
  hitbox: { x1: -12, y1: -16, x2: 12, y2: 16 },
  
  behaviourTimer: 0,
  direction: 0,
  
  isReadyToFire: false,
  
  FIREBALL_SPEED: 3,
  
  init: function(area) {
    Enemy.init.call(this, area, 'octorok');
    this.startAnimation('idle');
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
    
    this.behaviourTimer++;
    if (this.behaviourTimer === 120) {
      this.vy = -6.5;
      this.isReadyToFire = true;
    }
    if (this.behaviourTimer === 130) {
      if (this.isReadyToFire) {
        this.area.spawn(R.spawnableSprites['EnemyFireball'], { x: this.x, y: this.y, vx: facing * this.FIREBALL_SPEED });
      }
    }
    if (this.behaviourTimer === 160) {
      this.behaviourTimer = 0;
    }
    
    // standard enemy stuff
    this.vy += this.gravity;
    this.translateWithTileCollisions( this.vx, this.vy );
    this.advanceAnimation( this.FIXED_STEP );
    if (this.touching.outOfBounds) { this.kill(); }
    
    if (this.touching.bottom || this.touching.top) { this.vy = 0; }
    
  },
});
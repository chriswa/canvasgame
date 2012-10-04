var EnemyOctorok = Object.extend(Enemy, {
  hitbox: { x1: 4, y1: 0, x2: 28, y2: 32 },
  
  behaviourTimer: 0,
  direction: 0,
  
  isReadyToFire: false,
  
  FIREBALL_SPEED: 6,
  
  init: function() {
    Enemy.init.call(this, 'octorok');
    this.startAnimation('idle');
  },
  
  onHurtByPlayer: function() {
    this.isReadyToFire = false;
    Enemy.onHurtByPlayer.apply(this);
  },
  
  updateFixedStep: function() {
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    // turn to face player
    var facing = (Game.playerSprite.x > this.x) ? 1 : -1;
    this.imageModifier = facing === 1 ? R.IMG_ORIGINAL : R.IMG_FLIPX;
    
    this.behaviourTimer++;
    if (this.behaviourTimer === 60) {
      this.vy = -9.5;
      this.isReadyToFire = true;
    }
    if (this.behaviourTimer === 65) {
      if (this.isReadyToFire) {
        Object.build(EnemyFireball, { x: this.x, y: this.y, vx: facing * this.FIREBALL_SPEED });
      }
    }
    if (this.behaviourTimer === 80) {
      this.behaviourTimer = 0;
    }
    
    // standard enemy stuff
    this.vy += this.gravity;
    this.translateWithTileCollisions( this.vx, this.vy );
    this.advanceAnimation( this.FIXED_STEP );
    if (this.outOfBounds) { this.kill(); }
    
    if (this.touchingBottom || this.touchingTop) { this.vy = 0; }
    
  },
});
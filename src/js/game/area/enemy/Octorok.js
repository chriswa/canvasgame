R.spawnableSprites['Octorok'] = Object.extend(Entity, {
  hitbox: { x1: -12, y1: -16, x2: 12, y2: 16 },
  
  behaviourTimer: 0,
  direction: 0,
  
  isReadyToFire: false,
  
  FIREBALL_SPEED: 3,
  
  init: function(area) {
    Entity.init.call(this, area, 'octorok');
    this.startAnimation('idle');
  },
  
  onStabbedByPlayer: function(absHitbox) {
    this.isReadyToFire = false;
    Entity.onStabbedByPlayer.call(this, absHitbox);
  },
  
  updateFixedStep: function(dt) {
    // update hurt timers, etc
    this.updateWhenHurt(dt);
    
    // do nothing while hurt
    if (this.isHurt()) { return; }
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    // turn to face player
    this.facing = (this.area.playerEntity.x > this.x) ? 1 : -1;
    
    this.behaviourTimer++;
    if (this.behaviourTimer === 120) {
      this.vy = -6.5;
      this.isReadyToFire = true;
    }
    if (this.behaviourTimer === 130) {
      if (this.isReadyToFire) {
        this.area.spawn(R.spawnableSprites['ProjFireball'], { x: this.x, y: this.y, vx: this.facing * this.FIREBALL_SPEED });
      }
    }
    if (this.behaviourTimer === 160) {
      this.behaviourTimer = 0;
    }
    
    // standard enemy stuff
    this.vy += this.gravity;
    this.touching = this.translateWithTileCollisions( this.vx, this.vy );
    this.advanceAnimation( this.FIXED_STEP );
    if (this.isOutOfBounds()) { this.kill(); }
    
    if (this.touching.bottom || this.touching.top) { this.vy = 0; }
    
  },
});
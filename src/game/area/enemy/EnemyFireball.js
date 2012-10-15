R.spawnableSprites['EnemyFireball'] = Object.extend(Enemy, {
  hitbox: { x1: 0, y1: 0, x2: 16, y2: 16 },
  
  isBlockable: true,
  isStabbable: false,
  
  init: function(spawn) {
    Enemy.init.call(this, 'fireball');
    this.x  = spawn.x;
    this.y  = spawn.y;
    this.vx = spawn.vx;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
  },
  
  onBlock: function() {
    this.isDangerous = false;
    this.isBlockable = false;
    this.vx = -this.vx * 0.7;
    this.vy = -4;
    this.ay = 0.6;
  },
  
  onPlayerCollision: function(playerSprite) {
    this.kill();
  },
  
  updateFixedStep: function() {
    this.behaviourTimer++;
    
    // translate without tile collisions
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    
    this.advanceAnimation( this.FIXED_STEP );
    
    // kill when out of bounds
    if (this.x < -16 || this.y < -16 || this.x > Game.area.maxX || this.y > Game.area.maxY ) {
      this.kill();
    }
    
    // kill when off screen
    if ( this.getStandardizedOffscreenDist() > 10 ) {
      this.kill();
    }
    
  },
});
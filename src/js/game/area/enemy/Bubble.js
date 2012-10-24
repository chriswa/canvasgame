R.spawnableSprites['Bubble'] = Object.extend(Enemy, {
  hitbox: { x1: -8, y1: -8, x2: 8, y2: 8 },
  
  isBlockable: false,
  isStabbable: false,
  
  init: function(area, spawn) {
    Enemy.init.call(this, area, 'fireball');
    this.x  = spawn.x;
    this.y  = spawn.y;
  },
  
  onPlayerCollision: function(playerSprite) {
    this.kill();
  },
  
  updateFixedStep: function() {
    
    // translate without tile collisions
    this.x += (Math.random() - 0.5) * 3;
    this.y += -3;
    
    this.advanceAnimation( this.FIXED_STEP );
    
    // kill when out of bounds
    if (this.y < -8) {
      this.kill();
    }
    
  },
});
R.spawnableSprites['ProjFireball'] = Object.extend(Entity, {
  hitbox: { x1: -8, y1: -8, x2: 8, y2: 8 },
  
  isBlockable: true,
  isStabbable: false,
  
  init: function(area, spawn) {
    Entity.init.call(this, area, 'fireball');
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
  
  onPlayerCollision: function(playerEntity) {
    if (this.isDangerous) {
      this.kill();
    }
  },
  
  updateFixedStep: function(dt) {
    
    // translate without tile collisions
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    
    this.advanceAnimation(dt);
    
    // kill when out of bounds
    if (this.x < -8 || this.y < -8 || this.x > this.area.maxX + 8 || this.y > this.area.maxY + 8 ) {
      this.kill();
    }
    
    // kill when off screen
    if ( this.getStandardizedOffscreenDist() > 10 ) {
      this.kill();
    }
    
  },
});
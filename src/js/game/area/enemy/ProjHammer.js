R.spawnableSprites['ProjHammer'] = Object.extend(Entity, {
  hitbox: { x1: -8, y1: -8, x2: 8, y2: 8 },
  
  isStabbable: false,
  damageToPlayer: 2,
  
  init: function(area, spawn) {
    Entity.init.call(this, area, 'proj-hammer');
    this.x  = spawn.x;
    this.y  = spawn.y;
    this.vx = spawn.vx;
    this.vy = spawn.vy;
    this.ax = 0;
    this.ay = spawn.gravity;
  },
  
  onPlayerCollision: function(playerEntity) {
    this.kill();
  },
  
  updateFixedStep: function() {
    
    // translate without tile collisions
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    
    this.advanceAnimation( this.FIXED_STEP );
    
    // kill when out of bounds
    if (this.x < -8 || this.y < -8 || this.x > this.area.maxX + 8 || this.y > this.area.maxY + 8 ) {
      this.kill();
    }
    
  },
});
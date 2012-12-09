R.spawnableSprites['Bubble'] = Object.extend(Entity, {
  hitbox: { x1: -8, y1: -8, x2: 8, y2: 8 },
  
  isBlockable: false,
  isStabbable: false,
  
  age: 0,
  
  init: function(area, spawn) {
    Entity.init.call(this, area, 'bubble');
    this.x  = spawn.x;
    this.y  = spawn.y;
  },
  
  onPlayerCollision: function(playerEntity) {
    this.kill();
  },
  
  updateFixedStep: function(dt) {
    
    this.age += 1;
    
    // translate without tile collisions
    this.x += (Math.random() - 0.5) * 3;
    this.y += -3;
    
    this.advanceAnimation( dt );
    
    // kill when out of bounds
    if (this.y < -8) {
      this.kill();
    }
    
  },
  
  render: function(ox, oy) {
    this.facing = (this.age % 12 / 12) < 0.5 ? 1 : -1;
    
    var colour = 0;
    if ((this.age % 12 / 12) < (1/6)) {
      colour = 1;
    }
    
    Entity.render.call(this, ox, oy, colour);
  }
  
});
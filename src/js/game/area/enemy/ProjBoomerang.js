R.spawnableSprites['ProjBoomerang'] = Object.extend(Entity, {
  hitbox: { x1: -8, y1: -8, x2: 8, y2: 8 },
  
  isBlockable: true,
  isStabbable: false,
  damageToPlayer: 1,
  
  age: 0,
  spawnInfo: undefined,
  
  SPEED: 6,
  TIME: 60,
  
  init: function(area, spawnInfo) {
    Entity.init.call(this, area, 'proj-boomerang');
    this.x         = spawnInfo.x;
    this.y         = spawnInfo.y;
    this.facing    = spawnInfo.facing;
    this.spawnInfo = spawnInfo;
  },
  
  onPlayerCollision: function(playerEntity) {
    if (this.isDangerous) {
      this.kill();
    }
  },
  
  onBlock: function() {
    this.isDangerous = false;
    this.isBlockable = false;
    this.vx = (this.vx > 0 ? -1 : 1) * 1;
    this.vy = -4;
    this.ay = 0.6;
  },
  
  updateFixedStep: function() {
    this.age += 1;
    
    if (this.isDangerous) {
      this.vx = 0;
      this.vy = 0;
      if (this.age < this.TIME) {
        this.vy = this.spawnInfo.curve1 / this.TIME * 2;
      }
      else if (this.age > this.TIME && this.age < this.TIME*2) {
        this.vy = this.spawnInfo.curve2 / this.TIME * 2;
      }
      if (this.age < this.TIME) {
        this.vx = this.facing * this.SPEED;
      }
      else if (this.age < this.TIME*2) {
        this.vx = this.facing * this.SPEED * (1 - ((this.age - this.TIME) / this.TIME) * 2);
      }
      else {
        this.vx = this.facing * -this.SPEED;
      }
      
      if (this.spawnInfo.thrower.alive && (this.x - this.spawnInfo.thrower.x) * this.facing < 0) {
        this.kill();
      }
    }
    else {
      this.vy += this.gravity;
    }
    
    // translate without tile collisions
    this.x += this.vx;
    this.y += this.vy;
    
    this.advanceAnimation( this.FIXED_STEP );
    
    // kill when out of bounds
    if (this.x < -8 || this.y < -8 || this.x > this.area.maxX + 8 || this.y > this.area.maxY + 8 ) {
      this.kill();
    }
    
  },
});
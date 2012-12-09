R.spawnableSprites['Boomeranger'] = Object.extend(Entity, {
  hitbox: { x1: -12, y1: -32, x2: 12, y2: 32 },
  
  health: 3,
  damageToPlayer: 2,
  
  attackTimer: 0,
  isAttacking: false,
  
  WALK_SPEED:     1.2,
  APPROACH_DIST:  200,
  ATTACK_DELAY:   2400,
  ATTACK_DIST:    200,
  
  init: function(area) {
    Entity.init.call(this, area, 'boomeranger');
    this.startAnimation('walk');
  },
  
  attackHitbox: { x1: -16, y1: -16, x2: 16, y2: -6 },
  
  updateFixedStep: function(dt) {
    // update hurt timers, etc
    this.updateWhenHurt(dt);
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    // turn to face player
    this.facing = (this.area.playerEntity.x > this.x) ? 1 : -1;
    
    var distFromPlayer = Math.abs(this.x - this.area.playerEntity.x);
    
    this.attackTimer += dt;
    
    if (this.isAttacking) {
      if (this.frameIndex === 1) {
        this.isAttacking = false;
        this.area.spawn(R.spawnableSprites['ProjBoomerang'], { thrower: this, x: this.x, y: this.y + this.throwInfo.y, facing: this.facing, curve1: this.throwInfo.curve1, curve2: this.throwInfo.curve2 });
      }
    }
    
    if (this.touching.bottom) {
      if (distFromPlayer < this.ATTACK_DIST && !this.isAttacking && this.attackTimer >= this.ATTACK_DELAY) {
        this.isAttacking = true;
        this.attackTimer = 0;
        
        var r = Math.random() * 3;
        if (r < 1) {
          this.throwInfo = { y: -16, curve1: -32, curve2: 32 };
          this.startAnimation('attack-high');
        }
        else if (r < 2) {
          this.throwInfo = { y: 16, curve1: 32, curve2: -32 };
          this.startAnimation('attack-low');
        }
        else {
          this.throwInfo = { y: 16, curve1: 0, curve2: -32 };
          this.startAnimation('attack-low');
        }
      }
      if (!this.isAttacking) {
        this.playAnimation('walk');
      }
    }
    else {
      //this.playAnimation('jump');
    }
    
    this.vx = 0;
    if (distFromPlayer > this.APPROACH_DIST) {
      this.vx = this.facing * this.WALK_SPEED;
    }
    
    // when hurt, stumble backwards
    if (this.hurtTimer > 200) {
      this.vx = -this.facing * 4 * (this.hurtTimer - 200) / 300;
    }
    
    // standard enemy stuff
    this.vy += this.gravity;
    this.touching = this.translateWithTileCollisions( this.vx, this.vy );
    this.advanceAnimation(dt);
    if (this.isOutOfBounds()) { this.kill(); }
    if (this.touching.bottom || this.touching.top) { this.vy = 0; }
    
  },
});
R.spawnableSprites['Skeleton'] = Object.extend(Enemy, {
  hitbox: { x1: -12, y1: -32, x2: 12, y2: 32 },
  
  health: 3,
  
  attackTimer: 0,
  isAttacking: false,
  
  WALK_SPEED:     1.6,
  JUMP_IMPULSE:   -10,
  APPROACH_DIST:  56,
  ATTACK_DELAY:   1000,
  ATTACK_DIST:    82,
  
  init: function(area) {
    Enemy.init.call(this, area, 'skeleton');
    this.startAnimation('walk');
  },
  
  attackHitbox: { x1: -16, y1: -16, x2: 16, y2: -6 },
  
  relativeShieldHitbox: { x1: -16, y1: -32, x2: 16, y2: 0 },
  getAbsShieldHitbox: function() {
    return relToAbsHitbox(this.relativeShieldHitbox, { x: this.x /* + this.facing * 20*/, y: this.y });
  },
  
  onStabbed: function(absSwordHitbox) {
    var gotHurt = Enemy.onStabbed.call(this, absSwordHitbox);
    if (gotHurt) {
      this.endAttack();
    }
    return gotHurt;
  },
  
  endAttack: function() {
    this.isAttacking = false;
    this.startAnimation('walk');
  },
  
  updateFixedStep: function(dt) {
    // update hurt timers, etc
    if (this.isHurt) { this.updateWhenHurt(dt); }
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    // turn to face player
    this.facing = (this.area.playerSprite.x > this.x) ? 1 : -1;
    
    /*
    //
    this.jumpTimer += 1;
    
    if (this.jumpTimer >= 180) {
      this.jumpTimer = 0;
      this.vy = this.JUMP_IMPULSE;
    }
    */
    
    this.attackTimer += dt;
    
    if (this.isAttacking) {
      if (this.frameIndex === 3) {
        this.endAttack();
      }
      if (this.frameIndex === 2) {
        this.attackRect(relToAbsHitbox(this.attackHitbox, { x: this.x + this.facing * 32, y: this.y }));
      }
    }
    
    var distFromPlayer = Math.abs(this.x - this.area.playerSprite.x);
    
    if (this.touching.bottom) {
      if (distFromPlayer < this.ATTACK_DIST && !this.isAttacking && this.attackTimer >= this.ATTACK_DELAY) {
        this.attackTimer = 0;
        this.isAttacking = true;
        this.startAnimation('attack');
      }
      if (!this.isAttacking) {
        this.playAnimation('walk');
      }
    }
    else {
      this.playAnimation('jump');
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
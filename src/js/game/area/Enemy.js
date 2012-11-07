var Enemy = Object.extend(PhysicsSprite, {
  
  health: 2,
  isDangerous: true,
  damageToPlayer: 1,
  isStabbable: true,
  invincibleTimer: 0, // this prevents multiple updates from the same attack from hurting us more than once
  hurtTimer: 0,
  
  init: function(area, characterName) {
    PhysicsSprite.init.call(this, area, characterName);
    //this.uber('init', area, characterName);
    this.addToGroup(this.area.enemyGroup);
  },
  
  getStandardizedOffscreenDist: function() {
    //return Math.max(Math.abs( this.x - this.area.playerSprite.x ), Math.abs( this.y - this.area.playerSprite.y ));
    var result = 0;
    if (this.x + this.hitbox.x2 < this.area.stdX1) { result = Math.max(result, this.area.stdX1 - (this.x + this.hitbox.x2)); }
    if (this.x + this.hitbox.x1 > this.area.stdX2) { result = Math.max(result, (this.x + this.hitbox.x1) - this.area.stdX2); }
    if (this.y + this.hitbox.y2 < this.area.stdY1) { result = Math.max(result, this.area.stdY1 - (this.y + this.hitbox.y2)); }
    if (this.y + this.hitbox.y1 < this.area.stdY2) { result = Math.max(result, (this.y + this.hitbox.y1) - this.area.stdY2); }
    return result;
  },
  
  // override me to provide a shield
  // eg. return relToAbsHitbox(this.relativeHitbox, { x: this.x + this.facing * 20, y: this.y });
  getAbsShieldHitbox: function() {
    return false;
  },
  
  onStabbed: function(absSwordHitbox) {
    if (!this.isStabbable) { return false; }
    if (this.invincibleTimer > 0) { return false; }
      
    // check for block?
    var absShieldHitbox = this.getAbsShieldHitbox();
    if (absShieldHitbox) {
      Debug.drawRect(absShieldHitbox, '#ff0');
      if (checkAbsHitboxOverlap(absSwordHitbox, absShieldHitbox)) {
        // blocked
        // TODO: sfx, pushing?
        return false;
      }
    }
    
    // take damage
    this.health              -= Game.player.swordDamage;
    this.isHurt              =  true;
    this.hurtTimer           =  500;
    this.invincibleTimer     =  250;
    
    // not dead yet
    if (this.health > 0) {
      if (this.area.currentAttackSfx && this.area.currentAttackSfx.getAttribute('name') === 'AOL_Sword') {
        this.area.currentAttackSfx.pause();
        this.area.currentAttackSfx = App.sfx.play('AOL_Sword_Hit');
      }
    }
    
    // death!
    else {
      // prevent all future actions
      this.update = this.updateWhenHurt; // note that this function should also be called from normal update code
      
      // no spurious onStabbed calls
      this.isStabbable = false;
      
      // callback for game flags
      this.onComplete();
      
      // explosion particle(s)
      if (this.hitbox.y2 - this.hitbox.y1 > 48) {
        this.area.spawn(EnemyDeathExplosion, { x: this.x, y: this.y - 16 });
        this.area.spawn(EnemyDeathExplosion, { x: this.x, y: this.y + 16 });
      }
      else {
        this.area.spawn(EnemyDeathExplosion, { x: this.x, y: this.y });
      }
      
      // sfx
      if (this.area.currentAttackSfx) { this.area.currentAttackSfx.pause(); }
      this.area.currentAttackSfx = App.sfx.play('AOL_Kill');
    }
    
    return true;
  },
  
  onPlayerCollision: function(playerSprite) {},
  
  updateWhenHurt: function(dt) {
    this.invincibleTimer -= dt;
    this.hurtTimer       -= dt;
    if (this.hurtTimer <= 250 && this.health <= 0) {
      this.kill();
    }
    if (this.hurtTimer <= 0) {
      this.isHurt = false;
    }
  },
  
  render: function(ox, oy, colour) {
    if (colour === undefined) { colour = 0; }
    if (this.isHurt) {
      var f = 1000 / 30;
      colour = Math.floor(this.hurtTimer / f % 4);
    }
    PhysicsSprite.render.call(this, ox, oy, colour);
  },
  
  onComplete: function() {},
  
  attackRect: function(absHitbox) {
    Debug.drawRect(absHitbox, '#0ff');
    var ps = this.area.playerSprite;
    if ( checkAbsHitboxOverlap(ps.getAbsHitbox(), absHitbox) ) {
      ps.onCollisionWithEnemy(this);
    }
  }
  
});

var Enemy = Object.extend(PhysicsSprite, {
  
  health: 2,
  isDangerous: true,
  isStabbable: true,
  invincibleTimer: 0, // this prevents multiple updates from the same attack from hurting us more than once
  hurtTimer: 0,
  
  init: function(area) {
    PhysicsSprite.init.apply(this, Array.prototype.slice.call(arguments, 0));
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
  
  onStabbed: function() {
    if (!this.isStabbable) { return; }
    if (this.invincibleTimer <= 0) {
      this.health--;
      this.isHurt              = true;
      this.hurtTimer           = 500;
      this.invincibleTimer     = 250;
      
      // death!
      if (this.health <= 0) {
        
        // prevent all future actions
        this.update = this.updateWhenHurt;
        
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
      else {
        if (this.area.currentAttackSfx && this.area.currentAttackSfx.getAttribute('name') === 'AOL_Sword') {
          this.area.currentAttackSfx.pause();
          this.area.currentAttackSfx = App.sfx.play('AOL_Sword_Hit');
        }
      }
    }
  },
  
  onPlayerCollision: function(playerSprite) {},
  
  updateWhenHurt: function(dt) {
    this.invincibleTimer -= dt;
    this.hurtTimer       -= dt;
    if (this.hurtTimer <= 250 && this.health <= 0) {
      this.kill();
      return;
    }
    if (this.hurtTimer <= 0) {
      this.isHurt = false;
      this.imageModifier &= ~(R.IMG_PINK | R.IMG_CYAN); // remove colouration while preserving other modifiers
      return;
    }
  },
  
  render: function(ox, oy) {
    if (this.isHurt) {
      this.imageModifier &= ~(R.IMG_PINK | R.IMG_CYAN); // remove colouration while preserving other modifiers
      if (this.hurtTimer % 67 >= 50) {
        this.imageModifier |= R.IMG_PINK | R.IMG_CYAN;
      }
      else if (this.hurtTimer % 67 >= 33) {
        this.imageModifier |= R.IMG_CYAN;
      }
      else if (this.hurtTimer % 67 >= 17) {
        this.imageModifier |= R.IMG_PINK;
      }
    }
    PhysicsSprite.render.call(this, ox, oy);
  },
  
  onComplete: function() {}
  
});

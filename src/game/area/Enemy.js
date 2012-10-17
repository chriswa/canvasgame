var Enemy = Object.extend(PhysicsSprite, {
  
  health: 2,
  isDangerous: true,
  isStabbable: true,
  invincibleTimer: 0,
  
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
      this.hurtTimer           = 0;
      this.invincibleTimer     = 16;
      
      if (this.updateFixedStep !== this.updateWhenHurtFixedStep) {
        this.origImageModifier   = this.imageModifier;
        this.origUpdateFixedStep = this.updateFixedStep;
        this.updateFixedStep     = this.updateWhenHurtFixedStep;
      }
      
      // death!
      if (this.health <= 0) {
        
        // no spurious onStabbed calls
        this.isStabbable = false;
        
        // callback for game flags
        this.onComplete();
        
        // explosion particle(s)
        this.area.spawn(EnemyDeathExplosion, { x: this.x, y: this.y });
        
        // sfx
        if (this.area.currentAttackSfx) { this.area.currentAttackSfx.pause(); }
        this.area.currentAttackSfx = App.playSfx('AOL_Kill');
      }
      else {
        if (this.area.currentAttackSfx && this.area.currentAttackSfx.getAttribute('name') === 'AOL_Sword') {
          this.area.currentAttackSfx.pause();
          this.area.currentAttackSfx = App.playSfx('AOL_Sword_Hit');
        }
      }
    }
  },
  
  onPlayerCollision: function(playerSprite) {},
  
  updateWhenHurtFixedStep: function() {
    this.invincibleTimer--;
    this.hurtTimer++;
    if (this.hurtTimer > 16 && this.health <= 0) {
      this.kill();
      return;
    }
    if (this.hurtTimer > 32) {
      this.isHurt            = false;
      this.updateFixedStep   = this.origUpdateFixedStep;
      this.imageModifier     = this.origImageModifier;
      delete this.origUpdateFixedStep;
      delete this.origImageModifier;
      this.updateFixedStep();
      return;
    }
    //
    if (this.hurtTimer % 4 < 1) {
      this.imageModifier = this.origImageModifier | R.IMG_PINK;
    }
    else if (this.hurtTimer % 4 < 2) {
      this.imageModifier = this.origImageModifier | R.IMG_CYAN;
    }
    else if (this.hurtTimer % 4 < 3) {
      this.imageModifier = this.origImageModifier | R.IMG_PINK | R.IMG_CYAN;
    }
  },
  
  onComplete: function() {},
  
});

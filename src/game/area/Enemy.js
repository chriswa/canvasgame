var Enemy = Object.extend(PhysicsSprite, {
  
  health: 2,
  isDangerous: true,
  isStabbable: true,
  
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
    if (!this.isHurt) {
      this.health--;
      this.isHurt              = true;
      this.origUpdateFixedStep = this.updateFixedStep;
      this.origImageModifier   = this.imageModifier;
      this.hurtTimer           = 0;
      this.updateFixedStep     = this.updateWhenHurtFixedStep;
    }
    if (this.health <= 0) {
      this.isStabbable = false;
      
      // callback
      this.onComplete();
      
      // sfx
      if (this.area.currentAttackSfx) { this.area.currentAttackSfx.pause(); }
      this.area.currentAttackSfx = App.playSfx('AOL_Kill');
    }
  },
  
  onPlayerCollision: function(playerSprite) {},
  
  updateWhenHurtFixedStep: function() {
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

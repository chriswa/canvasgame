var Enemy = Object.extend(PhysicsSprite, {
  
  health: 2,
  
  init: function() {
    Sprite.init.apply(this, Array.prototype.slice.call(arguments, 0));
    this.addToGroup(Game.enemiesGroup);
  },
  
  getStandardizedOffscreenDist: function() {
    //return Math.max(Math.abs( this.x - Game.playerSprite.x ), Math.abs( this.y - Game.playerSprite.y ));
    var result = 0;
    if (this.x + this.hitbox.x2 < Game.area.stdX1) { result = Math.max(result, Game.area.stdX1 - (this.x + this.hitbox.x2)); }
    if (this.x + this.hitbox.x1 > Game.area.stdX2) { result = Math.max(result, (this.x + this.hitbox.x1) - Game.area.stdX2); }
    if (this.y + this.hitbox.y2 < Game.area.stdY1) { result = Math.max(result, Game.area.stdY1 - (this.y + this.hitbox.y2)); }
    if (this.y + this.hitbox.y1 < Game.area.stdY2) { result = Math.max(result, (this.y + this.hitbox.y1) - Game.area.stdY2); }
    return result;
  },
  
  onHurtByPlayer: function() {
    if (!this.isHurt) {
      this.health--;
      this.isHurt            = true;
      this.origUpdate        = this.update;
      this.origImageModifier = this.imageModifier;
      this.hurtTimer         = 0;
      this.update            = this.updateWhenHurt;
    }
  },
  
  updateWhenHurt: function() {
    this.hurtTimer++;
    if (this.hurtTimer === 8 && this.health < 1) {
      this.kill();
      return;
    }
    if (this.hurtTimer === 16) {
      this.isHurt            = false;
      this.update            = this.origUpdate;
      this.imageModifier     = this.origImageModifier;
      delete this.origUpdate;
      delete this.origImageModifier;
      this.update();
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
    
    // 
    Sprite.updateInterpolationData.call(this);
  },
  
});
var PhysicsSprite = Object.extend(Sprite, {
  gravity: 1.2,
  
  hitbox: { x1: 0, y1: 0, x2: 32, y2: 32 }, // default size of 1x1 tiles
  
  touchingTop: false,
  touchingBottom: false,
  touchingLeft: false,
  touchingRight: false,
  outOfBounds: false,
  
  /*init: function() {
    return Sprite.init.apply(this, Array.prototype.slice.call(arguments, 0));
  },*/
  render: function(stepInterpolation) {
    Sprite.render.call(this, stepInterpolation);
    //App.drawDebugRect({x1:this.hitbox.x1+this.x, y1:this.hitbox.y1+this.y, x2:this.hitbox.x2+this.x, y2:this.hitbox.y2+this.y}, '#0f0');
  },
  update: function() {
    this.vy += this.gravity;
    
    //if (spr.touchingBottom) {
    //  this.moveOnGround(spr);
    //}
    //else {
      this.moveInAir();
    //}
    
    // call overridden method
    Sprite.update.apply(this);
  },
  moveInAir: function() {
    var tileSize = Game.area.tileSize;
    
    this.touchingBottom = false;
    this.touchingTop    = false;
    this.touchingLeft   = false;
    this.touchingRight  = false;
    this.outOfBounds    = false;
    
    this.x += this.vx;
    if (this.vx !== 0) {
      var tileY1 = Math.floor(  (this.y + this.hitbox.y1) / tileSize);
      var tileY2 = Math.ceil(   (this.y + this.hitbox.y2) / tileSize) - 1;
      if (this.vx < 0) {
        var tileX = Math.floor( (this.x + this.hitbox.x1) / tileSize);
      }
      else {
        var tileX = Math.ceil(  (this.x + this.hitbox.x2) / tileSize) - 1;
      }
      for (var tileY = tileY1; tileY <= tileY2; tileY++) {
        
        var physicsTile = Game.area.getPhysicsTile(tileX, tileY);
        if (physicsTile === -1) {
          this.outOfBounds = true;
        }
        else if (physicsTile > 0) {
          if (this.vx < 0) {
            this.touchingLeft = true;
            this.x = (tileX + 1) * tileSize - this.hitbox.x1;
          }
          else {
            this.touchingRight = true;
            this.x = (tileX) * tileSize - this.hitbox.x2;
          }
          this.vx = 0;
          break;
        }
      }
    }
    
    this.y += this.vy;
    if (this.vy !== 0) {
      var tileX1 = Math.floor(  (this.x + this.hitbox.x1) / tileSize);
      var tileX2 = Math.ceil(   (this.x + this.hitbox.x2) / tileSize) - 1;
      if (this.vy < 0) {
        var tileY = Math.floor( (this.y + this.hitbox.y1) / tileSize);
      }
      else {
        var tileY = Math.ceil(  (this.y + this.hitbox.y2) / tileSize) - 1;
      }
      for (var tileX = tileX1; tileX <= tileX2; tileX++) {
        
        var physicsTile = Game.area.getPhysicsTile(tileX, tileY);
        
        if (physicsTile === -1) {
          this.outOfBounds = true;
        }
        else if (physicsTile > 0) {
          if (this.vy < 0) {
            this.touchingTop = true;
            this.y = (tileY + 1) * tileSize - this.hitbox.y1;
          }
          else {
            this.touchingBottom = true;
            this.y = (tileY) * tileSize - this.hitbox.y2;
          }
          this.vy = 0;
          break;
        }
      }
    }
  },
});

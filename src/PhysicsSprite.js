var PhysicsSprite = Object.extend(Sprite, {
  gravity: 1.2,
  
  hitbox: { x1: 0, y1: 0, x2: 32, y2: 32 }, // default size of 1x1 tiles
  
  isUpdatingPhysics: true,
  touchingTop: false,
  touchingBottom: false,
  touchingLeft: false,
  touchingRight: false,
  outOfBounds: false,
  
  /*init: function() {
    return Sprite.init.apply(this, Array.prototype.slice.call(arguments, 0));
  },*/
  update: function() {
    if (this.isUpdatingPhysics) {
      this.vy += this.gravity;
      
      //if (spr.touchingBottom) {
      //  this.moveOnGround(spr);
      //}
      //else {
        this.moveInAir();
      //}
    }
    
    // call overridden method
    Sprite.update.apply(this);
    
    Debug.drawRect({x1:this.hitbox.x1+this.x, y1:this.hitbox.y1+this.y, x2:this.hitbox.x2+this.x, y2:this.hitbox.y2+this.y}, '#0f0');
  },
  moveInAir: function() {
    this.touchingBottom = false;
    this.touchingTop    = false;
    this.touchingLeft   = false;
    this.touchingRight  = false;
    this.outOfBounds    = false;
    
    var gpt = Game.area.getPhysicsTile.bind(Game.area);
    
    // move along x-axis
    var r = this.moveAlongAxis(this.vx, this.x, this.hitbox.x1, this.hitbox.x2, this.y, this.hitbox.y1, this.hitbox.y2, function(x, y) { return gpt(x, y); });
    this.x = r.newPos;
    if (r.hit === -1) { this.vx = 0; this.touchingLeft   = true; }
    if (r.hit ===  1) { this.vx = 0; this.touchingRight  = true; }
    
    // move along y-axis
    var r = this.moveAlongAxis(this.vy, this.y, this.hitbox.y1, this.hitbox.y2, this.x, this.hitbox.x1, this.hitbox.x2, function(y, x) { return gpt(x, y); });
    this.y = r.newPos;
    if (r.hit === -1) { this.vy = 0; this.touchingTop    = true; }
    if (r.hit ===  1) { this.vy = 0; this.touchingBottom = true; }
  },
  moveAlongAxis: function(velocity, u, u1, u2, v, v1, v2, tileGetter) {
    var tileSize = Game.area.tileSize;
    var vRemaining = velocity;
    var vSign      = velocity > 0 ? 1 : -1;
    while (vRemaining !== 0) {
      if (Math.abs(vRemaining) > tileSize) {
        u += tileSize * vSign;
        vRemaining -= tileSize * vSign;
      }
      else {
        u += vRemaining;
        vRemaining = 0;
      }
      
      
      var tileV1 = Math.floor(  (v + v1) / tileSize);
      var tileV2 = Math.ceil(   (v + v2) / tileSize) - 1;
      if (velocity < 0) {
        var tileU = Math.floor( (u + u1) / tileSize);
      }
      else {
        var tileU = Math.ceil(  (u + u2) / tileSize) - 1;
      }
      for (var tileV = tileV1; tileV <= tileV2; tileV++) {
        
        var physicsTile = tileGetter(tileU, tileV);
        
        if (physicsTile === -1) {
          this.outOfBounds = true; // XXX: this isn't entirely reliable because we might return a hit before finding an out-of-bound tile!
        }
        else if (physicsTile > 0) {
          if (velocity < 0) {
            return { hit: -1, newPos: (tileU + 1) * tileSize - u1 };
          }
          else {
            return { hit: 1, newPos: (tileU) * tileSize - u2 };
          }
        }
      }
    }
    return { hit: 0, newPos: u };
  },
});
    /*
    var vRemaining = this.vx;
    var vSign      = this.vx > 0 ? 1 : -1;
    while (vRemaining !== 0) {
      if (Math.abs(vRemaining) > tileSize) {
        this.x     += tileSize * vSign;
        vRemaining -= tileSize * vSign;
      }
      else {
        this.x += vRemaining;
        vRemaining = 0;
      }
      
      
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
          vRemaining = 0;
          break;
        }
      }
    }
    
    var vRemaining = this.vy;
    var vSign      = this.vy > 0 ? 1 : -1;
    while (vRemaining !== 0) {
      if (Math.abs(vRemaining) > tileSize) {
        this.y     += tileSize * vSign;
        vRemaining -= tileSize * vSign;
      }
      else {
        this.y += vRemaining;
        vRemaining = 0;
      }
      
      
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
          vRemaining = 0;
          break;
        }
      }
    }
    */

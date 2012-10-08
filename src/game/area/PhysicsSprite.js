var PhysicsSprite = Object.extend(Sprite, {
  gravity: 1.2,
  
  hitbox: { x1: 0, y1: 0, x2: 32, y2: 32 }, // default size of 1x1 tiles
  
  touchingTop: false,
  touchingBottom: false,
  touchingLeft: false,
  touchingRight: false,
  outOfBounds: false,
  
  /*
    Debug.drawRect({x1:this.hitbox.x1+this.x, y1:this.hitbox.y1+this.y, x2:this.hitbox.x2+this.x, y2:this.hitbox.y2+this.y}, '#0f0');
  */
  translateWithTileCollisions: function( dx, dy ) {
    this.touchingBottom = false;
    this.touchingTop    = false;
    this.touchingLeft   = false;
    this.touchingRight  = false;
    this.outOfBounds    = false;
    
    var gpt = Game.area.getPhysicsTile.bind(Game.area);
    
    // translate along x-axis
    var r = this.translateWithTileCollisionsAlongAxis(dx, this.x, this.hitbox.x1, this.hitbox.x2, this.y, this.hitbox.y1, this.hitbox.y2, function(x, y) { return gpt(x, y); });
    this.x = r.newPos;
    if (r.hit === -1) { this.touchingLeft   = true; }
    if (r.hit ===  1) { this.touchingRight  = true; }
    
    // translate along y-axis
    var r = this.translateWithTileCollisionsAlongAxis(dy, this.y, this.hitbox.y1, this.hitbox.y2, this.x, this.hitbox.x1, this.hitbox.x2, function(y, x) { return gpt(x, y); });
    this.y = r.newPos;
    if (r.hit === -1) { this.touchingTop    = true; }
    if (r.hit ===  1) { this.touchingBottom = true; }
    
    // debug draw hitbox
    Debug.drawRect({x1:this.hitbox.x1+this.x, y1:this.hitbox.y1+this.y, x2:this.hitbox.x2+this.x, y2:this.hitbox.y2+this.y}, '#0f0');
  },
  translateWithTileCollisionsAlongAxis: function(deltaPos, u, u1, u2, v, v1, v2, tileGetter) {
    var tileSize = Game.area.tileSize;
    var deltaPosRemaining = deltaPos;
    var deltaPosSign      = deltaPos > 0 ? 1 : -1;
    while (deltaPosRemaining !== 0) {
      if (Math.abs(deltaPosRemaining) > tileSize) {
        u += tileSize * deltaPosSign;
        deltaPosRemaining -= tileSize * deltaPosSign;
      }
      else {
        u += deltaPosRemaining;
        deltaPosRemaining = 0;
      }
      
      var tileV1 = Math.floor(  (v + v1) / tileSize);
      var tileV2 = Math.ceil(   (v + v2) / tileSize) - 1;
      if (deltaPos < 0) {
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
          if (deltaPos < 0) {
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

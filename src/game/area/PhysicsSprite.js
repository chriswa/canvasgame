var PhysicsSprite = Object.extend(Sprite, {
  
  area: undefined,
  
  gravity: 0.6,
  
  hitbox: { x1: 0, y1: 0, x2: 32, y2: 32 }, // default size of 1x1 tiles
  
  init: function(area, characterName) {
    this.area = area;
    Sprite.init.call(this, characterName);
  },
  
  //
  getAbsHitbox: function() {
    return { x1: this.hitbox.x1 + this.x, y1: this.hitbox.y1 + this.y, x2: this.hitbox.x2 + this.x, y2: this.hitbox.y2 + this.y };
  },
  
  // feedback from translateWithTileCollisions
  touching: {},
  
  //
  translateWithTileCollisions: function( dx, dy ) {
    this.touching     = {};
    this.tilesTouched = {};
    
    var x1 = this.hitbox.x1;
    var y1 = this.hitbox.y1;
    var x2 = this.hitbox.x2;
    var y2 = this.hitbox.y2;
    
    var gpt = this.area.getPhysicsTile.bind(this.area);
    
    // translate along x-axis
    var r = this.translateWithTileCollisionsAlongAxis(dx, this.x, x1, x2, this.y, y1, y2, function(x, y) { return gpt(x, y); });
    this.x = r.newPos;
    if (r.hitSomething && dx < 0) { this.touching.left   = true; }
    if (r.hitSomething && dx > 0) { this.touching.right  = true; }
    
    // translate along y-axis
    var r = this.translateWithTileCollisionsAlongAxis(dy, this.y, y1, y2, this.x, x1, x2, function(y, x) { return gpt(x, y); });
    this.y = r.newPos;
    if (r.hitSomething && dy < 0) { this.touching.top    = true; }
    if (r.hitSomething && dy > 0) { this.touching.bottom = true; }
    
    // debug draw hitbox
    Debug.drawRect({x1: x1 + this.x, y1: y1 + this.y, x2: x2 + this.x, y2: y2 + this.y}, '#0f0');
  },
  
  //
  translateWithTileCollisionsAlongAxis: function(deltaPos, u, u1, u2, v, v1, v2, tileGetter) {
    var tileSize = this.area.tileSize;
    var deltaPosRemaining = deltaPos;
    var deltaPosSign      = deltaPos > 0 ? 1 : -1;
    var hitSomething      = false;
    var tilesTouched      = {};
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
        
        // -1 means outOfBounds
        if (physicsTile === -1) {
          this.touching.outOfBounds = true;
        }
        
        // solid tiles cause us to stop
        else if (physicsTile === 1) {
          if (deltaPos < 0) {
            u = (tileU + 1) * tileSize - u1;
          }
          else {
            u = (tileU) * tileSize - u2;
          }
          hitSomething      = true;
          deltaPosRemaining = 0;
        }
        
        // special physics tiles
        if (physicsTile > 1) {
          this.tilesTouched[physicsTile] = true;
        }
      }
    }
    return { hitSomething: hitSomething, newPos: u };
  },
});

var Entity = Object.extend(Sprite, {
  
  /*
  
  Interface for derived classes:
    
    isStabbable
      defaults to true
      if true, and the player's sword collides, onStabbedByPlayer() is called, which hurts/kills us
    
    isBlockable
      defaults to false
      if true, and the player's shield collides, custom onBlock() code is called
    
    isDangerous
      defaults to true
      if true, the player is hurt when colliding
    
    damageToPlayer
      defaults to 1
      how much damage is done to player if isDangerous is true
    
    getAbsShieldHitbox
      defaults to returning false
      called in onStabbedByPlayer(), if the absHitbox returned overlaps the player's sword, we are not hurt
    
    onPlayerCollision
      defaults to do-nothing
      called whenever the player collides, except if isDangerous and the player is invincible
      this can be used to suicide (for projectiles being absorbed), give the player a boon (for powerups), or mess with the player's position (for Locks and Elevators)
    
    onBlock
      defaults to calling this.kill()
      called when player's shield collides (probably want to set isDangerous and isBlockable to false)
    
    render(ox, oy, colour)
      override this to supply extra render instructions or change render colour
      note that colour is set here if isHurt()
  
  Utility methods for derived classes:
    
    updateWhenHurt(dt)
      this should be called every update(), as it reduces the hurtTimer and invincibleTimer counters and also kills us if we've run out of health
    
    attackPlayerRect(absHitbox)
      dynamically extend our regular hitbox for colliding with the player, not their sword
      note that this collision respects all the normal rules for this Entity (e.g. isBlockable, isDangerous, player invincibility, damageToPlayer)
      note that this will also call onPlayerCollision (unless isDangerous and the player is invincible)
    
    translateWithTileCollisions(x, y)
      moves us with respect to bumping into solid tiles
      returns an object describing where collisions occurred and new tile types we've started overlapping (e.g. OUTOFBOUNDS, INSTADEATH)
    
    isOutOfBounds()
      returns true if any part of our hitbox is outside of the area's AABB
    
    getStandardizedOffscreenDist()
      returns 0 if we're near the player, or a number indicating how far away from the player's screen we are (this.area.stdU#)
  
  */
  
  area: undefined,
  gravity: 0.6,
  hitbox: { x1: -16, y1: -16, x2: 16, y2: 16 }, // default size (1 square tile)
  touching: {}, // feedback from translateWithTileCollisions
  
  health: 2,
  isDangerous: true,
  isStabbable: true,
  isBlockable: false,
  damageToPlayer: 1,
  invincibleTimer: 0, // this is used to prevent multiple updates from the same attack from hurting us more than once
  hurtTimer: 0,
  onComplete: function() {}, // optionally initialized by spawn code to flag Game.player.worldState/tempDungeonState if the spawn is not to be repeated after "completed"
  
  // lifecycle
  // =========
  
  // initialize with area and animation information
  init: function(area, characterName, animationName) {
    this.area = area;
    Sprite.init.call(this, characterName, animationName);
    this.addToGroup(this.area.enemyGroup);
  },
  
  // area-specific
  // =============
  
  // translate our hitbox into world-coords based on (this.x, this.y)
  getAbsHitbox: function() {
    return relToAbsHitbox( this.hitbox, this );
  },
  
  // are we overlapping the edges of the area?
  isOutOfBounds: function() {
    return this.x + this.hitbox.x1 < 0 || this.x + this.hitbox.x2 > this.area.maxX ||
           this.y + this.hitbox.y1 < 0 || this.y + this.hitbox.y2 > this.area.maxY;
  },
  
  // how far off-screen are we (used to prevent far-away enemies from moving)
  getStandardizedOffscreenDist: function() {
    //return Math.max(Math.abs( this.x - this.area.playerEntity.x ), Math.abs( this.y - this.area.playerEntity.y ));
    var result = 0;
    if (this.x + this.hitbox.x2 < this.area.stdX1) { result = Math.max(result, this.area.stdX1 - (this.x + this.hitbox.x2)); }
    if (this.x + this.hitbox.x1 > this.area.stdX2) { result = Math.max(result, (this.x + this.hitbox.x1) - this.area.stdX2); }
    if (this.y + this.hitbox.y2 < this.area.stdY1) { result = Math.max(result, this.area.stdY1 - (this.y + this.hitbox.y2)); }
    if (this.y + this.hitbox.y1 < this.area.stdY2) { result = Math.max(result, (this.y + this.hitbox.y1) - this.area.stdY2); }
    return result;
  },
  
  // move ourselves, bumping into tiles (also reports "other" tile types entered, e.g. OUTOFBOUNDS, INSTADEATH)
  translateWithTileCollisions: function( dx, dy ) {
    var touching = {};
    
    var x1 = this.hitbox.x1;
    var y1 = this.hitbox.y1;
    var x2 = this.hitbox.x2;
    var y2 = this.hitbox.y2;
    
    var gpt = this.area.getPhysicsTile;
    var translationResults;
    
    // translate along x-axis
    translationResults = this._translateWithTileCollisionsAlongAxis(dx, this.x, x1, x2, this.y, y1, y2, function(x, y) { return gpt(x, y); });
    this.x = translationResults.newPos;
    if (translationResults.hitSomething && dx < 0) { touching.left   = true; }
    if (translationResults.hitSomething && dx > 0) { touching.right  = true; }
    touching.tiles = translationResults.otherTilesEntered;
    
    // translate along y-axis
    translationResults = this._translateWithTileCollisionsAlongAxis(dy, this.y, y1, y2, this.x, x1, x2, function(y, x) { return gpt(x, y); });
    this.y = translationResults.newPos;
    if (translationResults.hitSomething && dy < 0) { touching.top    = true; }
    if (translationResults.hitSomething && dy > 0) { touching.bottom = true; }
    _.extend(touching.tiles, translationResults.otherTilesEntered);
    
    // debug draw hitbox
    Debug.drawRect({x1: x1 + this.x, y1: y1 + this.y, x2: x2 + this.x, y2: y2 + this.y}, '#0f0');
    
    return touching;
  },
  
  // private workhorse for translateWithTileCollisions: moves us along one axis (horizontally or vertically), bumping us into solid tiles
  _translateWithTileCollisionsAlongAxis: function(deltaPos, u, u1, u2, v, v1, v2, tileGetter) {
    var tileSize          = this.area.tileSize;
    var deltaPosRemaining = deltaPos;
    var deltaPosSign      = deltaPos > 0 ? 1 : -1;
    var hitSomething      = false;
    var otherTilesEntered = {};
    
    // move at most tileSize at a time, keep moving until deltaPosRemaining runs out
    while (deltaPosRemaining !== 0) {
      
      // if we need to move more than tileSize, move tileSize
      if (Math.abs(deltaPosRemaining) > tileSize) {
        u += tileSize * deltaPosSign;
        deltaPosRemaining -= tileSize * deltaPosSign;
      }
      
      // otherwise, move the remainder
      else {
        u += deltaPosRemaining;
        deltaPosRemaining = 0;
      }
      
      // we need to check a line of tiles which overlaps the edge we are moving forward
      var tileV1 = Math.floor(  (v + v1) / tileSize);
      var tileV2 = Math.ceil(   (v + v2) / tileSize) - 1;
      if (deltaPosSign === 1) {
        var tileU = Math.ceil(  (u + u2) / tileSize) - 1;
      }
      else {
        var tileU = Math.floor( (u + u1) / tileSize);
      }
      
      // check each tile in the line
      for (var tileV = tileV1; tileV <= tileV2; tileV++) {
        
        // get the tile (note that this function will translate (u,v) to (x,y) or (y,x))
        var physicsTile = tileGetter(tileU, tileV);
        
        // ignore empty tiles
        if (physicsTile === Area.physicsTileTypes.EMPTY) {
          // pass
        }
        
        // solid tiles push us back to the tile boundary and stop further movement
        else if (physicsTile === Area.physicsTileTypes.SOLID) {
          if (deltaPos < 0) {
            u = (tileU + 1) * tileSize - u1;
          }
          else {
            u = (tileU) * tileSize - u2;
          }
          hitSomething      = true;
          deltaPosRemaining = 0;
        }
        
        // report other tiles (e.g. OUTOFBOUNDS, INSTADEATH)
        else {
          otherTilesEntered[physicsTile] = true;
        }
        
      }
    }
    
    // return results of this translation
    return { hitSomething: hitSomething, newPos: u, otherTilesEntered: otherTilesEntered };
  },
  
  // player-interaction
  // ==================
  
  // override me to provide a shield
  // eg. return relToAbsHitbox(this.relativeHitbox, { x: this.x + this.facing * 20, y: this.y });
  getAbsShieldHitbox: function() {
    return false;
  },
  
  //
  onBlock: function() {
    this.kill();
  },
  
  // 
  onStabbedByPlayer: function(absSwordHitbox) {
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
      
      // no spurious onStabbedByPlayer calls
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
  
  // override me to do something when the player bumps us (e.g. fireballs kill themselves to simulate absorption)
  onPlayerCollision: function(playerEntity) {},
  
  // attack the player, if they collide with this absHitbox (e.g. sword extends out of our normal hitbox)
  attackPlayerRect: function(absHitbox) {
    Debug.drawRect(absHitbox, '#0ff');
    var ps = this.area.playerEntity;
    if ( checkAbsHitboxOverlap(ps.getAbsHitbox(), absHitbox) ) {
      ps.onCollisionWithEnemy(this);
    }
  },
  
  // hurting
  // =======
  
  isHurt: function() {
    return this.hurtTimer !== 0;
  },
  
  // advance hurtTimer and invincibleTimer and kill self if we're out of health (this should be called by all derived update code!)
  updateWhenHurt: function(dt) {
    if (this.hurtTimer === 0) { return; }
    this.invincibleTimer -= dt;
    this.hurtTimer       -= dt;
    if (this.hurtTimer <= 0) {
      this.hurtTimer = 0;
    }
    if (this.invincibleTimer <= 0) {
      this.invincibleTimer = 0;
    }
    
    // also, kill ourselves if we're dying
    if (this.hurtTimer <= 250 && this.health <= 0) {
      this.kill();
    }
  },
  
  // render ourself, colour-cycling if we're hurting
  render: function(ox, oy, colour) {
    if (colour === undefined) { colour = 0; }
    if (this.hurtTimer > 0) {
      var f = 1000 / 30;
      colour = Math.floor(this.hurtTimer / f % 4);
    }
    Sprite.render.call(this, ox, oy, colour);
  }
  
});

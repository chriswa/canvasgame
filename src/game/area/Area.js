var Area = {
  
  physicsTileTypes: {
    EMPTY: 0,
    SOLID: 1,
    LAVA:  2
  },
  
  playerSprite: null,
  
  allGroup: null,   // all sprites (for updating and rendering)
  enemyGroup: null, // things which collide with the player
  
  areaId: null,
  areaData: null,
  tileImg: null,
  tileSize: null,
  tileImgCols: 0,
  
  // render offset for other rendering code to know where to draw itself
  renderOffsetX: 0,
  renderOffsetY: 0,
  
  // AABB for game logic to provide identical experience on different screen resolutions
  stdX1: undefined,
  stdY1: undefined,
  stdX2: undefined,
  stdY2: undefined,
  
  rows: 0,
  cols: 0,
  age: 0,
  
  init: function(exitObject, sideHintFromLastExit) {
    this.areaId        = exitObject.area;
    
    this.areaData      = R.areas[this.areaId];
    if (!this.areaData) { throw new Error("could not find areaId " + this.areaId); }
    
    this.tileImg       = R.tilesetImages[ this.areaData.image ];
    this.tileSize      = this.areaData.tileSize;
    this.tileImgCols   = Math.floor(this.tileImg.width / this.tileSize);
    
    this.cols          = this.areaData.cols;
    this.rows          = Math.floor(this.areaData.physics.length / this.cols);
    this.maxX          = this.cols * this.tileSize;
    this.maxY          = this.rows * this.tileSize;
    
    // init groups
    this.allGroup   = Object.build(SpriteGroup);
    this.enemyGroup = Object.build(SpriteGroup);
    
    // spawn a playerSprite
    this.playerSprite = this.spawn(PlayerSprite);
    
    // spawn enemies
    _.each(this.areaData.spawns, function(spawnInfo) {
      
      // have we already "completed" (i.e. defeated/collected) this spawn?
      if (spawnInfo.oncePerDungeon && Game.player.dungeonFlags[spawnInfo.oncePerDungeon]) { return; }
      if (spawnInfo.onceEver       && Game.player.worldFlags[spawnInfo.onceEver])         { return; }
      
      // is this an encounter-type dependant spawn and the wrong type of encounter?
      if (exitObject.encounter === 'fairy') { return; }
      if (exitObject.encounter === 'blob' && spawnInfo.hard) { return; }
      if (exitObject.encounter === 'monster' && !spawnInfo.hard) { return; }
      
      // spawn!
      var classObject = R.spawnableSprites[spawnInfo['class']];
      var e = this.spawn(classObject, spawnInfo);
      e.x += spawnInfo.x;
      e.y += spawnInfo.y;
      
      // do we need to do anything when the spawn is completed?
      if (spawnInfo.oncePerDungeon) { e.onComplete = function() { Game.player.dungeonFlags[spawnInfo.oncePerDungeon] = true; } }
      if (spawnInfo.onceEver)       { e.onComplete = function() { Game.player.worldFlags[spawnInfo.onceEver]         = true; } }
      
    }, this);
    
    // special rules for exitObject.encounter === 'fairy'
    if (exitObject.encounter === 'fairy') {
      var e = this.spawn(R.spawnableSprites['Fairy']);
      e.x += this.tileSize * this.cols / 2 - 16;
      e.y += 9 * this.tileSize;
    }
    
    // set the playerSprite's position and velocity
    // if the player is leaving an area, we can use which side of it they're on to guess where the player should appear on the next area
    if (exitObject.x !== undefined && exitObject.y !== undefined) {
      this.playerSprite.x = exitObject.x;
      this.playerSprite.y = exitObject.y;
      // TODO: also set velocity
    }
    else {
      var side = exitObject.side;
      if (!side && sideHintFromLastExit) {
        if (sideHintFromLastExit === 'left') { side = 'right'; }
        if (sideHintFromLastExit === 'right') { side = 'left'; }
      }
      if (!side) { side = 'left'; }
      
      // find the first solid tile from the bottom
      var tx = 0;
      if (side === 'right') { tx = this.cols - 1; }
      if (side === 'centre') { tx = Math.floor(this.cols / 2); }
      for (var ty = this.rows - 1; ty > 2; ty--) {
        if (this.getPhysicsTile(tx, ty) < 1) { break; }
      }
      
      // place player
      this.playerSprite.x = (side === 'left') ? -this.playerSprite.hitbox.x1 : ((tx + 1) * this.tileSize) - this.playerSprite.hitbox.x2;
      if (side === 'centre') { this.playerSprite.x = this.tileSize * this.cols / 2 - 16; }
      this.playerSprite.y = (ty + 1) * this.tileSize - this.playerSprite.hitbox.y2;
      this.playerSprite.vx = 0;
      if (side === 'left')  { this.playerSprite.vx =  this.playerSprite.MAX_X_SPEED; }
      if (side === 'right') { this.playerSprite.vx = -this.playerSprite.MAX_X_SPEED; }
      
      this.playerSprite.facing = (side === 'left') ? 1 : -1;
      this.playerSprite.startAnimation('walk');
    }
    
    //
    this.update(0);
  },
  getPhysicsTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return -1; } // out of bounds
    return this.areaData.physics[ ty * this.cols + tx ];
  },
  getBackgroundTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return 0; }
    return this.areaData.background[ ty * this.cols + tx ];
  },
  update: function(dt) {
    this.age += dt;
    
    // update all entities
    this.allGroup.update(dt);
    
    // offset the area to center on the player
    this.updateCamera();
    
    // do collisions
    var p = this.playerSprite;
    overlapOneToManyAABBs(p.getAbsHitbox(), this.enemyGroup.collection, function(e) { p.onCollisionWithEnemy(e); }, function(e) { return e.isHurt ? false : e.getAbsHitbox(); });
    
    // cull entities while have been "killed"
    this.allGroup.cull();
    
    Debug.statusbarPrint("SPR: " + this.allGroup.count(), 71);
  },
  updateCamera: function() {
    var px = Math.round(this.playerSprite.x);
    var py = Math.round(this.playerSprite.y);
    
    // center camera on playerSprite
    this.renderOffsetX = Math.round(Math.min(Math.max(0, Math.floor(px + 16 - canvas.width  / 2)), this.cols * this.tileSize - canvas.width));
    this.renderOffsetY = Math.round(Math.min(Math.max(0, Math.floor(py + 32 - canvas.height / 2)), this.rows * this.tileSize - canvas.height));
    
    // provide standardized aabb for game logic to provide identical gameplay on devices with different display sizes
    var stdW = 640;
    var stdH = 480;
    this.stdX1 = Math.min(Math.max(0, Math.floor(px + 16 - stdW / 2)), this.cols * this.tileSize - stdW);
    this.stdY1 = Math.min(Math.max(0, Math.floor(py + 32 - stdH / 2)), this.rows * this.tileSize - stdH);
    this.stdX2 = this.stdX1 + stdW;
    this.stdY2 = this.stdY1 + stdH;
  },
  render: function() {
    var ts = this.tileSize;
    
    // clear screen
    ctx.fillStyle = this.areaData.bgColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // find background tiles overlapping canvas
    var leftCol   = Math.max(Math.floor(this.renderOffsetX / ts), 0);
    var rightCol  = Math.min(Math.ceil((this.renderOffsetX + canvas.width) / ts), this.cols);
    var topRow    = Math.max(Math.floor(this.renderOffsetY / ts), 0);
    var bottomRow = Math.min(Math.ceil((this.renderOffsetY + canvas.height) / ts), this.rows);
    
    // blit background tiles
    var tx, ty, tileIndex;
    ty = Math.round(topRow * ts - this.renderOffsetY);
    for (var y = topRow; y < bottomRow; y++) {
      tx = Math.round(leftCol * ts - this.renderOffsetX);
      for (var x = leftCol; x < rightCol; x++) {
        tileIndex = this.getBackgroundTile(x, y);
        //ctx.drawImage(this.tileImg, ts * (tileIndex % this.tileImgCols), ts * Math.floor(tileIndex / this.tileImgCols), ts, ts, tx, ty, ts, ts);
        ctx.drawImage(this.tileImg, ts * (tileIndex % this.tileImgCols), ts * Math.floor(tileIndex / this.tileImgCols), ts, ts, tx, ty, ts, ts);
        tx += ts;
      }
      ty += ts;
    }
    
    // render all entities
    this.allGroup.render(this.renderOffsetX, this.renderOffsetY);
  },
  spawn: function(classObject, spawnInfo) {
    var e = Object.build(classObject, this, spawnInfo);
    e.addToGroup(this.allGroup);
    return e;
  },
  findAndQueuePlayerExit: function() {
    var p = this.playerSprite;
    // find an overlapping area exit object
    var success = false;
    overlapOneToManyAABBs(p.getAbsHitbox(), this.areaData.exits, function(exitObject) { Game.queueExit(exitObject); success = true; }, function(exitObject) { return exitObject.hitbox; });
    if (!success) { console.log("Player is out of bounds, but no exitObject could be found!"); }
  },
  handlePlayerAttack: function(absHitbox) {
    Debug.drawRect(absHitbox, '#f00');
    var hitSomething = false;
    overlapOneToManyAABBs(absHitbox, this.enemyGroup.collection, function(e) { e.onStabbed(); hitSomething = true; }, function(e) { return e.getAbsHitbox(); });
    if (hitSomething) {
      R.sfx['AOL_Sword_Hit'].play();
    }
    else {
      R.sfx['AOL_Sword'].play();
    }
  },
};

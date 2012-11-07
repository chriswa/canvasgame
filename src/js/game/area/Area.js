var Area = {
  
  physicsTileTypes: {
    OUTOFBOUNDS: -1,
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
  music: undefined,
  
  init: function(exitObject) {
    this.getPhysicsTile    = this.getPhysicsTile.bind(this);
    this.getBackgroundTile = this.getBackgroundTile.bind(this);
    
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
    
    // spawn enemies
    this.initSpawnEntities(exitObject.encounter);
    
    // spawn a playerSprite
    this.initPlayer(exitObject);
    
    // fix elevators
    this.initElevators();
    
    // decide on music
    this.music = 'battle';
    if (this.areaData.properties.music) {
      this.music = this.areaData.properties.music;
    }
    else if (exitObject.encounter) {
      if (exitObject.encounter === 'fairy') {
        this.music = 'NONE';
      }
    }
    else if (this.areaData.properties.dungeonId) {
      this.music = 'palace';
    }
    if (this.areaData.properties.dungeonId && !Game.player.currentDungeonId) {
      Game.player.tempDungeonState.music = this.music;
    }
    if (Game.player.currentDungeonId) { this.music = 'NO_CHANGE'; }
    
    //
    this.update(0);
  },
  initPlayer: function(exitObject) {
    this.playerSprite = this.spawn(PlayerSprite);
    
    // set the playerSprite's position and velocity
    // if the player is leaving an area, we can use which side of it they're on to guess where the player should appear on the next area
    if (exitObject.x !== undefined && exitObject.y !== undefined) {
      this.playerSprite.x = exitObject.x;
      this.playerSprite.y = exitObject.y;
      // TODO: also set velocity?
    }
    else {
      var side = exitObject.sideHint;
      if (exitObject.side) { side = exitObject.side; }
      if (!side) { side = 'left'; }
      
      // elevator?
      if (side === 'top' || side === 'bottom') {
        
        // find any elevator
        var elevators = _.where(this.enemyGroup.collection, { className: 'Elevator' });
        if (elevators.length < 1) { throw new Error('side = ' + side + ' but no elevators were found!'); }
        var elevator = elevators[0];
        
        // move player to edge of screen, in line with elevator
        var extraDisplacementFromEdge = 16;
        this.playerSprite.x = elevator.x;
        if (side === 'top') {
          this.playerSprite.y = 0 - this.playerSprite.hitbox.y1 + extraDisplacementFromEdge;
        }
        else {
          this.playerSprite.y = this.maxY - this.playerSprite.hitbox.y2 - extraDisplacementFromEdge;
        }
        
        // move elevator under player
        elevator.moveUnderPlayer();
        
      }
      
      // side is left, right, or centre
      else {
        
        // find the first solid tile from the bottom
        var tx = 0;
        if (side === 'right') { tx = this.cols - 1; }
        if (side === 'centre') { tx = Math.floor(this.cols / 2); }
        for (var ty = this.rows - 1; ty > 2; ty--) {
          if (this.getPhysicsTile(tx, ty) === this.physicsTileTypes.EMPTY) { break; }
        }
        
        // place player
        this.playerSprite.x = (side === 'left') ? -this.playerSprite.hitbox.x1 : ((tx + 1) * this.tileSize) - this.playerSprite.hitbox.x2;
        if (side === 'centre') { this.playerSprite.x = this.tileSize * this.cols / 2; }
        this.playerSprite.y = (ty + 1) * this.tileSize - this.playerSprite.hitbox.y2;
        this.playerSprite.vx = 0;
        if (side === 'left')  { this.playerSprite.vx =  this.playerSprite.MAX_X_SPEED; }
        if (side === 'right') { this.playerSprite.vx = -this.playerSprite.MAX_X_SPEED; }
        
        this.playerSprite.facing = (side === 'right') ? -1 : 1;
        this.playerSprite.startAnimation('walk');
      }
    }
  },
  initSpawnEntities: function(encounterType) {
    // special rules for encounterType === 'fairy'
    if (encounterType === 'fairy') {
      var e = this.spawn(R.spawnableSprites['Fairy']);
      e.x += this.tileSize * this.cols / 2;
      e.y += 9 * this.tileSize;
    }
    
    // 
    _.each(this.areaData.spawns, function(spawnInfo) {
      
      // have we already "completed" (i.e. defeated/collected) this spawn?
      if (spawnInfo.oncePerDungeon && Game.player.tempDungeonState[spawnInfo.oncePerDungeon]) { return; }
      if (spawnInfo.onceEver       && Game.player.worldState[spawnInfo.onceEver])             { return; }
      
      // is this an encounter-type dependant spawn and the wrong type of encounter?
      if (encounterType === 'fairy') { return; }
      if (encounterType === 'blob' && spawnInfo.hard) { return; }
      if (encounterType === 'monster' && !spawnInfo.hard) { return; }
      
      // spawn!
      var classObject = R.spawnableSprites[spawnInfo['class']];
      if (!classObject) { throw new Error("Unknown spawnableSprite " + spawnInfo['class']); }
      var e = this.spawn(classObject, spawnInfo);
      e.x += spawnInfo.x;
      e.y += spawnInfo.y;
      
      // do we need to do anything when the spawn is completed?
      if (spawnInfo.oncePerDungeon) { e.onComplete = function() { Game.player.tempDungeonState[spawnInfo.oncePerDungeon] = true; }; }
      if (spawnInfo.onceEver)       { e.onComplete = function() { Game.player.worldState[spawnInfo.onceEver]             = true; }; }
      
    }, this);
  },
  initElevators: function() {
    // TODO: if the player enters via a top tunnel, an elevator between the tunnels must spawn at the top and vice versa
  },
  
  getPhysicsTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return this.physicsTileTypes.OUTOFBOUNDS; }
    return this.areaData.physics[ ty * this.cols + tx ];
  },
  getBackgroundTile: function(tx, ty) {
    //if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return 0; }
    return this.areaData.background[ ty * this.cols + tx ];
  },
  startMusic: function() {
    if (this.music === 'NONE') {
      App.sfx.stopMusic();
    }
    else if (this.music === 'NO_CHANGE') {
      App.sfx.playMusic(Game.player.tempDungeonState.music);
    }
    else {
      App.sfx.playMusic(this.music);
    }
  },
  update: function(dt) {
    this.age += dt;
    
    // update all entities
    this.allGroup.update(dt);
    
    // cull entities while have been "killed"
    this.allGroup.cull();
    
    // offset the area to center on the player
    this.updateCamera();
    
    // do collisions
    var p = this.playerSprite;
    var onCollision = function(e) { p.onCollisionWithEnemy(e); };
    var getEnemyAbsHitbox = function(e) { return e.isHurt ? false : e.getAbsHitbox(); };
    overlapOneToManyAABBs(p.getAbsHitbox(), this.enemyGroup.collection, onCollision, getEnemyAbsHitbox);
    
    Debug.statusbarPrint("SPR: " + this.allGroup.count(), 71);
  },
  updateCamera: function() {
    var px = Math.round(this.playerSprite.x);
    var py = Math.round(this.playerSprite.y);
    
    // center camera on playerSprite
    this.renderOffsetX = Math.round(Math.min(Math.max(0, Math.floor(px - CANVAS.width  / 2)), this.maxX - CANVAS.width));
    this.renderOffsetY = Math.round(Math.min(Math.max(0, Math.floor(py - CANVAS.height / 2)), this.maxY - CANVAS.height));
    
    // provide standardized aabb for game logic to provide identical gameplay on devices with different display sizes
    var stdW = 640;
    var stdH = 480;
    this.stdX1 = Math.min(Math.max(0, Math.floor(px - stdW / 2)), this.maxX - stdW);
    this.stdY1 = Math.min(Math.max(0, Math.floor(py - stdH / 2)), this.maxY - stdH);
    this.stdX2 = this.stdX1 + stdW;
    this.stdY2 = this.stdY1 + stdH;
  },
  render: function() {
    
    // clear screen
    CANVAS_CTX.fillStyle = this.areaData.bgColour;
    CANVAS_CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
    
    // blit background tiles
    renderTiles(CANVAS, CANVAS_CTX, this.cols, this.rows, this.renderOffsetX, this.renderOffsetY, this.tileSize, this.getBackgroundTile, this.tileImg, this.tileImgCols)
    
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
    var enemyToAbsHitbox = function(e) { return e.getAbsHitbox(); };
    var onCollision = function(e) { e.onStabbed(absHitbox); };
    overlapOneToManyAABBs(absHitbox, this.enemyGroup.collection, onCollision, enemyToAbsHitbox);
    
    // find background tiles overlapping player's sword
    var tileRect = pixelRectToTileRect(absHitbox, this.cols, this.rows, this.tileSize);
    
    var solidTileOverlap = false;
    for (var y = tileRect.y1; y < tileRect.y2; y++) {
      for (var x = tileRect.x1; x < tileRect.x2; x++) {
        if (this.getPhysicsTile(x, y) === this.physicsTileTypes.SOLID) {
          solidTileOverlap = true;
        }
      }
    }
    return solidTileOverlap;
  }
};

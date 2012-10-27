var Overworld = {
  
  player: null,
  
  allGroup: null,   // all sprites (for updating and rendering)
  enemyGroup: null, // things which collide with the player
  
  tileImg: null,
  tileSize: null,
  tileImgCols: 0,
  
  // render offset for other rendering code to know where to draw itself
  renderOffsetX: 0,
  renderOffsetY: 0,
  
  rows: 0,
  cols: 0,
  age: 0,
  
  spawnTimer: 0,
  SPAWN_DELAY_INITIAL:  4000,
  SPAWN_DELAY_REPEAT:  10000,
  ENCOUNTER_LIFETIME:   6000,
  
  terrainTypes: {
    WATER:         0,
    ROAD:          1,
    GRASS:         2,
    FOREST:        3,
    MOUNTAIN:      4,
    DESERT:        5,
    SWAMP:         6,
    EVILSWAMP:     7,
    TOWN1:         8,
    TOWN2:         9,
    TOWN3:         10,
    PALACE:        11,
    GRAVEYARD:     12,
    BOULDER:       13,
    DOCK:          14,
    CAVE:          15,
    FAKE_WATER:    16,
    FAKE_MOUNTAIN: 17,
    isEncounterSafe: function(t) {
      return t === this.WATER || t === this.ROAD || t === this.TOWN1 || t === this.TOWN2 || t === this.TOWN3 || t === this.CAVE || t === this.FAKE_WATER || t === this.FAKE_MOUNTAIN;
    }
  },
  
  init: function() {
    this.getTile = this.getTile.bind(this);
    
    this.areaData      = R.areas['overworld'];
    this.tileImg       = R.tilesetImages['overworld-tiles.png'];
    this.tileSize      = this.areaData.tileSize;
    this.tileImgCols   = Math.floor(this.tileImg.width / this.tileSize);
    
    this.cols          = this.areaData.cols;
    this.rows          = Math.floor(this.areaData.background.length / this.cols);
    this.maxX          = this.cols * this.tileSize;
    this.maxY          = this.rows * this.tileSize;
    
    // init groups
    this.allGroup   = Object.build(SpriteGroup);
    this.enemyGroup = Object.build(SpriteGroup);
    
    // spawn a player
    this.player = Object.build(OverworldPlayer);
    this.player.addToGroup(this.allGroup);
    
    this.spawnTimer = this.SPAWN_DELAY_INITIAL;
  },
  reset: function() {
    this.player.reset();
  },
  getTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return 0; }
    return this.areaData.background[ ty * this.cols + tx ];
  },
  getPlayerX: function() { return Game.player.overworldX; },
  getPlayerY: function() { return Game.player.overworldY; },
  update: function(dt) {
    this.age += dt;
    
    // 
    var ptx = this.getPlayerX();
    var pty = this.getPlayerY();
    var playerTileIndex = this.getTile(ptx, pty);
    
    // spawn encounters?
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && !this.terrainTypes.isEncounterSafe(playerTileIndex)) {
      var encounterDistance = 4;
      this.spawnEncounters(encounterDistance);
      this.spawnTimer = this.SPAWN_DELAY_REPEAT;
    }
    
    // update all entities
    this.allGroup.update(dt);
    
    // center camera on playerSprite
    this.updateCamera();
    
    // do collisions
    var currentExit = this.findPlayerExit();
    this.enemyGroup.each(function(e) {
      var etx = Math.round(e.x / 32);
      var ety = Math.round(e.y / 32);
      if (etx === ptx && ety === pty) {
        if (currentExit) {
          e.kill();
        }
        else {
          var started = Game.overworld.startEncounter(e, playerTileIndex);
          if (!started) {
            e.kill();
          }
        }
      }
    });
    
    // cull entities while have been "killed"
    this.allGroup.cull();
  },
  updateCamera: function() {
    var px = Math.round(this.player.x);
    var py = Math.round(this.player.y);
    this.renderOffsetX = Math.round(Math.min(Math.max(0, Math.floor(px + 16 - CANVAS.width  / 2)), this.cols * this.tileSize - CANVAS.width));
    this.renderOffsetY = Math.round(Math.min(Math.max(0, Math.floor(py + 32 - CANVAS.height / 2)), this.rows * this.tileSize - CANVAS.height));
  },
  render: function() {
    
    // blit background tiles
    renderTiles(CANVAS, CANVAS_CTX, this.cols, this.rows, this.renderOffsetX, this.renderOffsetY, this.tileSize, this.getTile, this.tileImg, this.tileImgCols)
    
    /*
    var ts = this.tileSize;
    
    // find background tiles overlapping canvas
    var leftCol   = Math.max(Math.floor(this.renderOffsetX / ts), 0);
    var rightCol  = Math.min(Math.ceil((this.renderOffsetX + CANVAS.width) / ts), this.cols);
    var topRow    = Math.max(Math.floor(this.renderOffsetY / ts), 0);
    var bottomRow = Math.min(Math.ceil((this.renderOffsetY + CANVAS.height) / ts), this.rows);
    
    // blit background tiles
    var tx, ty, tileIndex;
    ty = Math.round(topRow * ts - this.renderOffsetY);
    for (var y = topRow; y < bottomRow; y++) {
      tx = Math.round(leftCol * ts - this.renderOffsetX);
      for (var x = leftCol; x < rightCol; x++) {
        tileIndex = this.getTile(x, y);
        CANVAS_CTX.drawImage(this.tileImg, ts * (tileIndex % this.tileImgCols), ts * Math.floor(tileIndex / this.tileImgCols), ts, ts, tx, ty, ts, ts);
        tx += ts;
      }
      ty += ts;
    }
    */
    
    // render all entities
    this.allGroup.render(Game.overworld.renderOffsetX, Game.overworld.renderOffsetY);
  },
  
  spawnEncounters: function(distance) {
    var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    dirs.splice(Math.floor(Math.random() * 4), 1);
    for (var i = 0; i < dirs.length; i++) {
      var type = ['blob', 'blob', 'blob', 'blob', 'blob', 'blob', 'monster', 'monster', 'monster', 'monster', 'fairy'];
      //var type = ['blob', 'monster', 'fairy'];
      type = type[Math.floor(Math.random() * type.length)];
      var e = Object.build(OverworldEncounter, type, this.getPlayerX() + distance * dirs[i][0], this.getPlayerY() + distance * dirs[i][1]);
      e.addToGroup(this.allGroup);
      e.addToGroup(this.enemyGroup);
    }
  },
  
  startEncounter: function(encounter, tileIndex) {
    var areaId = undefined;
    if (encounter.type === 'fairy') {
      if      (tileIndex === this.terrainTypes.ROAD)   { areaId = 'road'; } // road already satisfies fairy area requirements!
      else if (tileIndex === this.terrainTypes.GRASS)  { areaId = 'fairy_grass'; }
      if      (tileIndex === this.terrainTypes.FOREST) { areaId = 'fairy_forest'; }
      else if (tileIndex === this.terrainTypes.DESERT) { areaId = 'fairy_desert'; }
    }
    else {
      if (tileIndex === this.terrainTypes.ROAD)   { areaId = 'road'; }
      if (tileIndex === this.terrainTypes.GRASS)  { areaId = 'grass'; }
      if (tileIndex === this.terrainTypes.FOREST) { areaId = 'forest'; }
      if (tileIndex === this.terrainTypes.DESERT) { areaId = 'desert'; }
    }
    if (!areaId) { return false; }
    //App.sfx.play('AOL_Battle');
    this.queueExit({ area: areaId, side: 'centre', encounter: encounter.type });
    return true;
  },
  
  resetEncounters: function() {
    this.enemyGroup.invoke('kill');
    this.spawnTimer = this.SPAWN_DELAY_INITIAL;
  },
  
  findAndQueuePlayerExit: function() {
    var exitObject = this.findPlayerExit();
    if (exitObject) {
      this.queueExit(exitObject);
      return true;
    }
    return false;
  },
  
  findPlayerExit: function() {
    var px = this.getPlayerX() * 32 + 16;
    var py = this.getPlayerY() * 32 + 16;
    var match = false;
    _.each(this.areaData.exits, function(exitObject) {
      var exitHitbox = exitObject.hitbox;
      if (px > exitHitbox.x1 && px < exitHitbox.x2 && py > exitHitbox.y1 && py < exitHitbox.y2) {
        match = exitObject;
      }
    });
    return match;
  },
  
  queueExit: function(exitObject) {
    this.resetEncounters();
    Game.queueExit(exitObject);
  },
  
  movePlayerTo: function(x, y) {
    Game.player.overworldX = x;
    Game.player.overworldY = y;
    this.player.finishMove();
    this.updateCamera();
  }
  
};

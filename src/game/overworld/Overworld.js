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
  SPAWN_DELAY_INITIAL: 2000,
  SPAWN_DELAY_REPEAT:  5000,
  
  init: function() {
    
    this.areaData      = R.areas['overworld'];
    this.tileImg       = R.images['overworld-tiles'];
    this.tileSize      = this.areaData.tileSize;
    this.tileImgCols   = Math.floor(this.tileImg[0].width / this.tileSize);
    
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
  getTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return 0; }
    return this.areaData.background[ ty * this.cols + tx ];
  },
  getPlayerX: function() { return Game.player.overworldX; },
  getPlayerY: function() { return Game.player.overworldY; },
  update: function(dt) {
    this.age += dt;
    
    // update all entities
    this.allGroup.update(dt);
    
    // 
    var ptx = Math.round(this.player.x / 32);
    var pty = Math.round(this.player.y / 32);
    var playerTileIndex = this.getTile(ptx, pty);
    
    // spawn encounters?
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && (playerTileIndex !== 1 && playerTileIndex !== 8 && playerTileIndex !== 9 && playerTileIndex !== 10)) { // road or towns
      this.spawnEncounters(4);
      this.spawnTimer = this.SPAWN_DELAY_REPEAT;
    }
    
    // center camera on playerSprite
    var px = Math.round(this.player.x);
    var py = Math.round(this.player.y);
    this.renderOffsetX = Math.round(Math.min(Math.max(0, Math.floor(px + 16 - canvas.width  / 2)), this.cols * this.tileSize - canvas.width));
    this.renderOffsetY = Math.round(Math.min(Math.max(0, Math.floor(py + 32 - canvas.height / 2)), this.rows * this.tileSize - canvas.height));
    
    // do collisions
    this.enemyGroup.each(function(e) {
      var etx = Math.round(e.x / 32);
      var ety = Math.round(e.y / 32);
      if (etx === ptx && ety === pty) {
        Game.overworld.resetEncounters();
        Game.loadArea({ area: 'forest', side: 'centre' });
      }
    });
    
    // cull entities while have been "killed"
    _.invoke(_.filter(this.allGroup.collection, function(spr) { return spr.readyToCull; }), 'destroy');
  },
  render: function() {
    var ts = this.tileSize;
    
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
        tileIndex = this.getTile(x, y);
        ctx.drawImage(this.tileImg[0], ts * (tileIndex % this.tileImgCols), ts * Math.floor(tileIndex / this.tileImgCols), ts, ts, tx, ty, ts, ts);
        tx += ts;
      }
      ty += ts;
    }
    
    // render all entities
    this.allGroup.each(function(e) {
      e.render(Game.overworld.renderOffsetX, Game.overworld.renderOffsetY);
    });
  },
  
  spawnEncounters: function(distance) {
    var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    dirs.splice(Math.floor(Math.random() * 4), 1);
    for (var i = 0; i < dirs.length; i++) {
      var type = ['owblob', 'owmonster', 'owfairy'];
      type = type[Math.floor(Math.random() * type.length)];
      var e = Object.build(OverworldEncounter, type, this.getPlayerX() + distance * dirs[i][0], this.getPlayerY() + distance * dirs[i][1]);
      e.addToGroup(this.allGroup);
      e.addToGroup(this.enemyGroup);
    }
  },
  
  resetEncounters: function() {
    this.enemyGroup.invoke('kill');
    this.spawnTimer = this.SPAWN_DELAY_INITIAL;
  },
  
  findAndQueuePlayerExit: function() {
    var px = this.getPlayerX() * 32 + 16;
    var py = this.getPlayerY() * 32 + 16;
    _.each(this.areaData.exits, function(exitObject) {
      var exitHitbox = exitObject.hitbox;
      if (px > exitHitbox.x1 && px < exitHitbox.x2 && py > exitHitbox.y1 && py < exitHitbox.y2) {
        Game.overworld.resetEncounters();
        Game.queueAreaTransition(exitObject);
      }
    });
  },
  
};

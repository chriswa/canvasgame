var Area = {
  
  playerSprite: null,
  
  allEntities: null,
  enemiesGroup: null,
  
  tileImg: null,
  tileSize: null,
  tileImgCols: 0,
  tileMap: null,
  offsetX: undefined,
  offsetY: undefined,
  stdX1: undefined, // for game logic to provide identical experience on different screen resolutions
  stdY1: undefined,
  stdX2: undefined,
  stdY2: undefined,
  rows: 0,
  cols: 0,
  exits: null,
  age: 0,
  init: function(exitObject, oldArea) {
    Game.area = this;
    
    var areaId = exitObject.area;
    
    this.tileImg       = R.images[ R.areas[areaId].image ];
    this.tileSize      = R.areas[areaId].tileSize;
    this.tileImgCols   = Math.floor(this.tileImg[0].width / this.tileSize);
    this.physicsMap    = R.areas[areaId].physics;
    this.backgroundMap = R.areas[areaId].background;
    this.cols          = R.areas[areaId].cols;
    this.rows          = Math.floor(this.physicsMap.length / this.cols);
    this.exits         = R.areas[areaId].exits;
    
    this.maxX          = this.cols * this.tileSize;
    this.maxY          = this.rows * this.tileSize;
    
    this.allEntities  = Object.build(EntityGroup);
    this.enemiesGroup = Object.build(EntityGroup);
    
    // spawn a playerSprite
    this.playerSprite = Object.build(PlayerSprite);
    
    // spawn enemies
    _.each(R.areas[areaId].spawns, function(spawn) {
      
      // have we already "completed" (i.e. defeated/collected) this spawn?
      if (spawn.oncePerDungeon && Game.player.dungeonFlags[spawn.oncePerDungeon]) { return; }
      
      // spawn!
      var classObject = window[spawn['class']];
      var e = Object.build(classObject, spawn);
      e.x += spawn.x;
      e.y += spawn.y;
      
      // do we need to do anything when the spawn is completed?
      if (spawn.oncePerDungeon) { e.onComplete = function() { Game.player.dungeonFlags[spawn.oncePerDungeon] = true; } }
      
    }, this);
    
    // set the playerSprite's position and velocity
    // if the player is leaving an area, we can use which side of it they're on to guess where the player should appear on the next area
    if (exitObject.x !== undefined && exitObject.y !== undefined) {
      this.playerSprite.x = exitObject.x;
      this.playerSprite.y = exitObject.y;
      // TODO: also set velocity
    }
    else {
      var side = exitObject.side || 'left';
      
      // if side is not supplied, we can determine it from where the player was on the old area (if supplied)
      if (!exitObject.side && oldArea && oldArea.playerSprite) {
        side = (oldArea.playerSprite.x > oldArea.cols * oldArea.tileSize / 2) ? 'left' : 'right'; // walking off left side enters on right side (and vice versa)
      }
      
      // find the first solid tile from the bottom
      var tx = (side === 'left') ? 0 : this.cols - 1;
      for (var ty = this.rows - 1; ty > 2; ty--) {
        if (this.getPhysicsTile(tx, ty) < 1) { break; }
      }
      
      // place player
      this.playerSprite.x = (side === 'left') ? -this.playerSprite.hitbox.x1 : ((tx + 1) * this.tileSize) - this.playerSprite.hitbox.x2;
      this.playerSprite.y = (ty + 1) * this.tileSize - this.playerSprite.hitbox.y2;
      this.playerSprite.vx = ((side === 'left') ? 1 : -1) * this.playerSprite.MAX_X_SPEED;
      
      this.playerSprite.facing = (side === 'left') ? 1 : -1;
      this.playerSprite.startAnimation('walk');
    }
  },
  getPhysicsTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return -1; } // out of bounds
    return this.physicsMap[ ty * this.cols + tx ];
  },
  getBackgroundTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return 0; }
    return this.backgroundMap[ ty * this.cols + tx ];
  },
  update: function(dt) {
    this.age += dt;
    
    // update entities
    this.allEntities.update(dt);
    
    var px = Math.round(Game.area.playerSprite.x);
    var py = Math.round(Game.area.playerSprite.y);
    
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
    
    // do collisions
    var p = this.playerSprite;
    this.enemiesGroup.each(function(e) {
      if (!e.isHurt && e.x + e.hitbox.x2 > p.x + p.hitbox.x1 && e.x + e.hitbox.x1 < p.x + p.hitbox.x2 && e.y + e.hitbox.y2 > p.y + p.hitbox.y1 && e.y + e.hitbox.y1 < p.y + p.hitbox.y2) {
        //e.vy = -5;
        p.onCollisionWithEnemy(e);
      }
    });
    
    // cull entities while have been "killed"
    _.invoke(_.filter(this.allEntities.collection, function(spr) { return spr.readyToCull; }), 'destroy');
  },
  render: function() {
    var ts = this.tileSize;
    
    var leftCol   = Math.max(Math.floor(this.renderOffsetX / ts), 0);
    var rightCol  = Math.min(Math.ceil((this.renderOffsetX + canvas.width) / ts), this.cols);
    var topRow    = Math.max(Math.floor(this.renderOffsetY / ts), 0);
    var bottomRow = Math.min(Math.ceil((this.renderOffsetY + canvas.height) / ts), this.rows);
    
    // blit!
    var tx, ty, tileIndex;
    ty = Math.round(topRow * ts - this.renderOffsetY);
    for (var y = topRow; y < bottomRow; y++) {
      tx = Math.round(leftCol * ts - this.renderOffsetX);
      for (var x = leftCol; x < rightCol; x++) {
        tileIndex = this.getBackgroundTile(x, y);
        ctx.drawImage(this.tileImg[0], ts * (tileIndex % this.tileImgCols), ts * Math.floor(tileIndex / this.tileImgCols), ts, ts, tx, ty, ts, ts);
        tx += ts;
      }
      ty += ts;
    }
    
    // render all entities
    this.allEntities.render();
  },
  handlePlayerAttack: function(absHitbox) {
    Debug.drawRect(absHitbox, '#f00');
    this.enemiesGroup.each(function(e) {
      if (e.x + e.hitbox.x2 > absHitbox.x1 && e.x + e.hitbox.x1 < absHitbox.x2 && e.y + e.hitbox.y2 > absHitbox.y1 && e.y + e.hitbox.y1 < absHitbox.y2) {
        e.onStabbed();
      }
    });
  },
};

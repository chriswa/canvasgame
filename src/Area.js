var Area = {
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
  init: function(areaId) {
    this.tileImg       = R.images[ R.areas[areaId].image ];
    this.tileSize      = R.areas[areaId].tileSize;
    this.tileImgCols   = Math.floor(this.tileImg[0].width / this.tileSize);
    this.physicsMap    = R.areas[areaId].physics;
    this.backgroundMap = R.areas[areaId].background;
    this.cols          = R.areas[areaId].cols;
    this.rows          = Math.floor(this.physicsMap.length / this.cols);
    this.exits         = R.areas[areaId].exits;
    
    _.each(R.areas[areaId].spawns, function(spawn) {
      var classObject = window[spawn['class']];
      var e = Object.build(classObject, spawn);
      e.x = spawn.x;
      e.y = spawn.y;
    }, this);
    
    /*
    var e = Object.build(EnemyOctorok);
    e.x = 33 * 32;
    e.y = 12 * 32;
    
    var howManyToCreate = 10;
    _.each(_.range(howManyToCreate), function(i) {
      var e = Object.build(EnemyBot);
      e.x = Math.random() * 200 + 200;
      e.y = Math.random() * 100 + 100;
    });
    */
  },
  update: function() {
    this.age++;
    
    this.oldOffsetX = this.offsetX;
    this.oldOffsetY = this.offsetY;
    
    // center camera on playerSprite
    this.offsetX = Math.min(Math.max(0, Math.floor(Game.playerSprite.x + 16 - canvas.width  / 2)), this.cols * this.tileSize - canvas.width);
    this.offsetY = Math.min(Math.max(0, Math.floor(Game.playerSprite.y + 32 - canvas.height / 2)), this.rows * this.tileSize - canvas.height);
    
    //
    var stdW = 640;
    var stdH = 480;
    this.stdX1 = Math.min(Math.max(0, Math.floor(Game.playerSprite.x + 16 - stdW / 2)), this.cols * this.tileSize - stdW);
    this.stdY1 = Math.min(Math.max(0, Math.floor(Game.playerSprite.y + 32 - stdH / 2)),  this.rows * this.tileSize - stdH);
    this.stdX2 = this.stdX1 + stdW;
    this.stdY2 = this.stdY1 + stdH;
  },
  getPhysicsTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return -1; } // out of bounds
    return this.physicsMap[ ty * this.cols + tx ];
  },
  getBackgroundTile: function(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) { return 0; }
    return this.backgroundMap[ ty * this.cols + tx ];
  },
  render: function(stepInterpolation) {
    var ts = this.tileSize;
    
    // deal with stepInterpolation
    if (this.oldOffsetX === undefined) { this.oldOffsetX = this.offsetX; this.oldOffsetY = this.offsetY; }
    this.renderOffsetX = Math.round( this.offsetX * stepInterpolation + this.oldOffsetX * (1-stepInterpolation) );
    this.renderOffsetY = Math.round( this.offsetY * stepInterpolation + this.oldOffsetY * (1-stepInterpolation) );
    
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
        //console.log([tileIndex, ts * (tileIndex % this.tileImgCols), ts * Math.floor(tileIndex / this.tileImgCols)]);
        ctx.drawImage(this.tileImg[0], ts * (tileIndex % this.tileImgCols), ts * Math.floor(tileIndex / this.tileImgCols), ts, ts, tx, ty, ts, ts);
        tx += ts;
      }
      ty += ts;
    }
  },
};

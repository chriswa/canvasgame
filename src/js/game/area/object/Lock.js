R.spawnableSprites['Lock'] = Object.extend(Enemy, {
  hitbox: { x1: -8, y1: -48, x2: 8, y2: 48 },
  
  isStabbable:   false,
  isDangerous:   false,
  
  isUnlocking: false,
  wallSprite: undefined,
  wallOffset: 32,
  
  UNLOCK_TIME: 300,
  
  init: function(area, spawn) {
    Enemy.init.call(this, area, 'lock');
    this.wallSprite = Object.build(Sprite, 'lock', 'wall');
  },
  
  onPlayerCollision: function(playerSprite) {
    
    var p = Game.player;
    if (p.currentDungeonId && p.dungeonState[p.currentDungeonId].keys > 0) {
      p.dungeonState[p.currentDungeonId].keys -= 1;
      this.area.playerSprite.frozenTimer = Infinity;
      this.isUnlocking = true;
    }
    
    if (playerSprite.x < this.x) {
      playerSprite.x = this.x + this.hitbox.x1 - playerSprite.hitbox.x2;
    }
    else {
      playerSprite.x = this.x + this.hitbox.x2 - playerSprite.hitbox.x1;
    }
    this.area.updateCamera();
  },
  
  update: function(dt) {
    if (this.isUnlocking) {
      this.wallOffset -= (32 / this.UNLOCK_TIME) * dt;
      
      if (this.wallOffset <= 0) {
        this.onComplete();
        this.kill();
        this.area.playerSprite.vx          = 0;
        this.area.playerSprite.frozenTimer = 0;
      }
    }
  },
  
  render: function(ox, oy) {
    this.wallSprite.x = this.x;
    this.wallSprite.y = this.y;
    this.wallSprite.render(ox, oy - this.wallOffset);
    this.wallSprite.render(ox, oy + this.wallOffset);
    
    Enemy.render.call(this, ox, oy);
  }
  
});

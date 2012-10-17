R.spawnableSprites['HeartContainer'] = Object.extend(Enemy, {
  hitbox: { x1: 0, y1: 0, x2: 32, y2: 32 },
  
  isCollectable: true,
  isStabbable:   false,
  isDangerous:   false,
  
  init: function(area, spawn) {
    Enemy.init.call(this, area, 'heart-container');
  },
  
  onPlayerCollision: function(playerSprite) {
    App.playSfx('AOL_LevelUp_GetItem');
    Game.player.healthMax += 2;
    Game.player.health    =  Game.player.healthMax;
    playerSprite.poseWithItem(this);
  },
  
  update: function(dt) {
    this.advanceAnimation(dt);
  },
});

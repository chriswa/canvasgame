R.spawnableSprites['HeartContainer'] = Object.extend(Enemy, {
  hitbox: { x1: -16, y1: -16, x2: 16, y2: 16 },
  
  isCollectable: true,
  isStabbable:   false,
  isDangerous:   false,
  
  init: function(area, spawn) {
    Enemy.init.call(this, area, 'heart-container');
  },
  
  onPlayerCollision: function(playerSprite) {
    Game.player.healthMax += 2;
    Game.player.health    =  Game.player.healthMax;
    playerSprite.poseWithItem(this);
  },
  
  update: function(dt) {
    this.advanceAnimation(dt);
  },
});

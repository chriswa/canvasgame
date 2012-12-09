R.spawnableSprites['HeartContainer'] = Object.extend(Entity, {
  hitbox: { x1: -16, y1: -16, x2: 16, y2: 16 },
  
  isStabbable:   false,
  isDangerous:   false,
  
  init: function(area, spawn) {
    Entity.init.call(this, area, 'heart-container');
  },
  
  onPlayerCollision: function(playerEntity) {
    this.onComplete();
    Game.player.healthMax += 2;
    Game.player.health    =  Game.player.healthMax;
    playerEntity.poseWithItem(this);
  },
  
  update: function(dt) {
    this.advanceAnimation(dt);
  },
});

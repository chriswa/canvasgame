R.spawnableSprites['Fairy'] = Object.extend(Enemy, {
  hitbox: { x1: 0, y1: 0, x2: 16, y2: 30 },
  
  isCollectable: true,
  isStabbable:   false,
  isDangerous:   false,
  
  init: function(spawn) {
    Enemy.init.call(this, 'fairy');
    this.x += 8;
  },
  
  onPlayerCollision: function(playerSprite) {
    playerSprite.frozenTimer = 500;
    this.kill();
    Game.player.health = Game.player.healthMax;
  },
  
  update: function(dt) {
    this.advanceAnimation(dt);
  },
});

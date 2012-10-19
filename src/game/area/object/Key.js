R.spawnableSprites['Key'] = Object.extend(Enemy, {
  hitbox: { x1: -8, y1: -15, x2: 8, y2: 15 },
  
  isDangerous: false,
  
  init: function(area, spawn) {
    Enemy.init.call(this, area, 'key');
  },
  
  onStabbed: function() {
    Game.player.dungeonFlags.keys++;
    this.onComplete();
    this.kill();
  },
  
  update: function(dt) {
    this.advanceAnimation(dt);
  },
});

var EnemyKey = Object.extend(Enemy, {
  hitbox: { x1: 0, y1: 0, x2: 16, y2: 30 },
  
  isDangerous: false,
  
  init: function(spawn) {
    Enemy.init.call(this, 'key');
    this.x += 8;
    this.y += 2;
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
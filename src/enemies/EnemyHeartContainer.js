var EnemyHeartContainer = Object.extend(Enemy, {
  hitbox: { x1: 0, y1: 0, x2: 32, y2: 32 },
  
  isCollectable: true,
  
  init: function(spawn) {
    Enemy.init.call(this, 'heart-container');
  },
  
  onPlayerCollision: function() {
    Game.player.healthMax += 2;
    Game.player.health    =  Game.player.healthMax;
  },
  
  update: function(dt) {
    this.advanceAnimation(dt);
  },
});
R.spawnableSprites['Key'] = Object.extend(Entity, {
  hitbox: { x1: -8, y1: -15, x2: 8, y2: 15 },
  
  isDangerous: false,
  
  init: function(area, spawn) {
    Entity.init.call(this, area, 'key');
  },
  
  onStabbedByPlayer: function() {
    var ds = Game.player.dungeonState[Game.player.currentDungeonId];
    if (ds) {
      ds.keys = (ds.keys || 0) + 1;
    }
    this.onComplete();
    this.kill();
  },
  
  update: function(dt) {
    this.advanceAnimation(dt);
  },
});

R.spawnableSprites['TestBotSpawner'] = Object.extend(Enemy, {
  
  //hitbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
  
  init: function() {
    Enemy.init.call(this, 'fireball'); // TODO: invisible!
  },
  
  FIXED_STEP: 1000 / 2,
  
  updateFixedStep: function() {
    var e = Game.area.spawn(R.spawnableSprites['Bot']);
    e.x = this.x;
    e.y = this.y;
  },
});

R.spawnableSprites['TestBotSpawner'] = Object.extend(Entity, {
  
  //hitbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
  
  init: function(area) {
    Entity.init.call(this, area, 'fireball'); // TODO: invisible!
  },
  
  FIXED_STEP: 1000 / 2,
  
  updateFixedStep: function() {
    var e = this.area.spawn(R.spawnableSprites['Bot']);
    e.x = this.x;
    e.y = this.y;
  },
});

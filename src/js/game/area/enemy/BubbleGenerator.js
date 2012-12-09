R.spawnableSprites['BubbleGenerator'] = Object.extend(Entity, {
  
  hitbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
  
  init: function(area) {
    Entity.init.call(this, area, 'fireball'); // TODO: invisible!
  },
  
  FIXED_STEP: 1000 / 2,
  
  updateFixedStep: function() {
    
    var y  = this.area.stdY2;
    var x  = this.area.playerEntity.x + (Math.random() - 0.5) * 1200;
    this.area.spawn(R.spawnableSprites['Bubble'], { x: x, y: y });
    
  },
});

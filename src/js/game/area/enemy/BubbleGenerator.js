R.spawnableSprites['BubbleGenerator'] = Object.extend(Enemy, {
  
  hitbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
  
  init: function(area) {
    Enemy.init.call(this, area, 'fireball'); // TODO: invisible!
  },
  
  FIXED_STEP: 1000 / 2,
  
  updateFixedStep: function() {
    
    var y  = this.area.stdY2;
    var x  = this.area.playerSprite.x + (Math.random() - 0.5) * 1200;
    this.area.spawn(R.spawnableSprites['Bubble'], { x: x, y: y });
    
  },
});

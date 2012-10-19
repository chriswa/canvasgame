R.spawnableSprites['DesertFireballGenerator'] = Object.extend(Enemy, {
  
  //hitbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
  
  init: function(area) {
    Enemy.init.call(this, area, 'fireball'); // TODO: invisible!
  },
  
  FIXED_STEP: 1000 / 2,
  
  FIREBALL_SPEED: 2.5,
  
  updateFixedStep: function() {
    
    var vx = (Math.random() > 0.5 ? 1 : -1) * this.FIREBALL_SPEED;
    var y  = Math.random() * 32*7 + 32*6 - 8;
    var x  = vx > 0 ? this.area.stdX1 - 16 : this.area.stdX2;
    this.area.spawn(R.spawnableSprites['EnemyFireball'], { x: x, y: y, vx: vx });
    
  },
});

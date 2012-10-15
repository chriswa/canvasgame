R.spawnableSprites['DesertFireballGenerator'] = Object.extend(Enemy, {
  
  //hitbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
  
  init: function() {
    Enemy.init.call(this, 'fireball'); // TODO: invisible!
  },
  
  FIXED_STEP: 1000 / 2,
  
  FIREBALL_SPEED: 2.5,
  
  updateFixedStep: function() {
    
    var vx = (Math.random() > 0.5 ? 1 : -1) * this.FIREBALL_SPEED;
    var y  = Math.random() * 32*7 + 32*6 - 16;
    var x  = vx > 0 ? Game.area.stdX1 - 16 : Game.area.stdX2;
    Game.area.spawn(R.spawnableSprites['EnemyFireball'], { x: x, y: y, vx: vx });
    
  },
});

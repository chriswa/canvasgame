var EnemyGhostRunner = Object.extend(Enemy, {
  hitbox: { x1: 0, y1: 0, x2: 16, y2: 30 },
  
  isDangerous: false,
  
  init: function(spawn) {
    Enemy.init.call(this, 'link');
    this.x += 8;
    this.y += 2;
  },
  
  FIXED_STEP: 1000 / 60,
  
  updateFixedStep: function() {
    
    this.x += 0.20 * this.FIXED_STEP;
    
    this.advanceAnimation(this.FIXED_STEP);
  },
});
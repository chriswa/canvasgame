var EnemyOctorok = Object.extend(Enemy, {
  facing: 'right',
  hitbox: { x1: 4, y1: 0, x2: 28, y2: 32 },
  
  behaviourTimer: 0,
  direction: 0,
  
  init: function() {
    Enemy.init.call(this, 'octorok');
    this.startAnimation('idle');
  },
  update: function() {
    this.behaviourTimer++;
    
    // turn to face player
    this.imageModifier = (Game.playerSprite.x < this.x) ? R.IMG_FLIPX : R.IMG_ORIGINAL;
    
    if (this.behaviourTimer === 60) {
      this.vy = -9.5;
    }
    if (this.behaviourTimer === 70) {
      // shoot!
    }
    if (this.behaviourTimer === 80) {
      this.behaviourTimer = 0;
    }
    
    if (this.outOfBounds) { this.kill(); }
    
    // call overridden method (physics and animation)
    Enemy.update.call(this);
  },
});

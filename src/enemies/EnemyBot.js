var EnemyBot = Object.extend(Enemy, {
  facing: 'right',
  hitbox: { x1: 4, y1: 0, x2: 28, y2: 24 },
  
  behaviour: 'inch',
  behaviourTimer: 0,
  direction: 0,
  
  init: function() {
    Enemy.init.call(this, 'blob');
    //this.startAnimation('idle');
    this.vx = Math.random() < 0.5 ? 1 : -1;
  },
  update: function() {
    
    if (this.touchingBottom) {
      this.behaviourTimer--;
      this.vx = 0;
      if (Math.random() < (this.behaviour === 'twitch' ? 0.005 : 0.005)) {
        this.behaviour = 'inch';
        this.vy = -9;
        this.vx = this.direction * 4;
        this.playAnimation('jump');
      }
      if (this.behaviourTimer < 0) {
        if (Math.random() < 0.5) {
          this.behaviour = 'twitch';
          this.behaviourTimer = 40 + Math.random() * 40;
          this.direction = Math.random() < 0.5 ? 1 : -1;
        }
        else {
          this.behaviour = 'inch';
          this.behaviourTimer = 40 + Math.random() * 100;
          this.direction = Math.random() < 0.5 ? 1 : -1;
        }
      }
      this.playAnimation(this.behaviour);
      
      if (this.behaviour === 'inch' && this.frameIndex === 0 && this.frameDelayRemaining === 1) {
        this.vx = this.direction * 7;
      }
    }
    //else {
    //  this.vx = this.direction * 3;
    //}
    
    if (this.outOfBounds) { this.kill(); }
    
    // call overridden method (physics and animation)
    Enemy.update.call(this);
  },
});

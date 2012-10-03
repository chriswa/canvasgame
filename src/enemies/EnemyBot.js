var EnemyBot = Object.extend(Enemy, {
  
  hitbox: { x1: 4, y1: 0, x2: 28, y2: 24 },
  
  behaviour: 'inch',
  behaviourTimer: 0,
  direction: 0,
  
  init: function() {
    Enemy.init.call(this, 'blob');
    //this.startAnimation('idle');
    //this.vx = Math.random() < 0.5 ? 1 : -1;
  },
  
  jump: function() {
    this.behaviour = 'inch';
    this.behaviourTimer = 0;
    this.direction = (Game.playerSprite.x < this.x) ? -1 : 1;
    this.vx = this.direction * 4;
    this.vy = -9.5;
    this.touchingBottom = false;
  },
  
  update: function() {
    if ( this.getStandardizedOffscreenDist() > 20 ) {
      Sprite.updateInterpolationData.call(this);
      return;
    }
    
    if (this.touchingBottom) {
      this.behaviourTimer--;
      this.vx = 0;
      
      // jump?
      if (Math.random() < 0.005) {
        this.jump();
      }
      
      // bored?
      else if (this.behaviourTimer < 0) {
        if (Math.random() < (this.behaviour === 'twitch' ? 0.5 : 0.1)) {
          this.jump();
        }
        else if (Math.random() < 0.5) {
          this.behaviour = 'inch';
          this.behaviourTimer = 20 + Math.random() * 50;
          this.direction = Math.random() < 0.5 ? 1 : -1;
        }
        else {
          this.behaviour = 'twitch';
          this.behaviourTimer = 20 + Math.random() * 20;
          this.direction = Math.random() < 0.5 ? 1 : -1;
        }
      }
      
      this.playAnimation(this.behaviour);
      
      if (this.touchingBottom && this.behaviour === 'inch' && this.frameIndex === 0 && this.frameDelayRemaining === 1) {
        this.vx = this.direction * 10;
      }
    }
    else {
      this.playAnimation('jump');
    }
    
    if (this.outOfBounds) { this.kill(); }
    
    // call overridden method (physics and animation) (but do not allow vx to be zero'd out)
    var currentVX = this.vx;
    Enemy.update.call(this);
    this.vx = currentVX;
  },
});

R.spawnableSprites['Bot'] = Object.extend(Enemy, {
  
  hitbox: { x1: 4, y1: 0, x2: 28, y2: 24 },
  
  behaviour: 'inch',
  behaviourTimer: 0,
  direction: 0,
  
  init: function() {
    Enemy.init.call(this, 'blob');
    this.y += 8;
    //this.startAnimation('idle');
    //this.vx = Math.random() < 0.5 ? 1 : -1;
  },
  
  jump: function() {
    this.behaviour = 'inch';
    this.behaviourTimer = 0;
    this.direction = (Game.area.playerSprite.x < this.x) ? -1 : 1;
    this.vx = this.direction * 3;
    this.vy = -6.5;
    this.touchingBottom = false;
  },
  
  updateFixedStep: function() {
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    if (this.touchingBottom) {
      this.behaviourTimer--;
      this.vx = 0;
      
      // jump?
      if (Math.random() < 0.0025) {
        this.jump();
      }
      
      // bored?
      else if (this.behaviourTimer < 0) {
        if (Math.random() < (this.behaviour === 'twitch' ? 0.5 : 0.1)) {
          this.jump();
        }
        else if (Math.random() < 0.5) {
          this.behaviour = 'inch';
          this.behaviourTimer = 60 + Math.random() * 150;
          this.direction = Math.random() < 0.5 ? 1 : -1;
        }
        else {
          this.behaviour = 'twitch';
          this.behaviourTimer = 40 + Math.random() * 40;
          this.direction = Math.random() < 0.5 ? 1 : -1;
        }
      }
      
      this.playAnimation(this.behaviour);
      
    }
    else {
      this.playAnimation('jump');
    }
    
    // standard enemy stuff
    this.vy += this.gravity;
    this.translateWithTileCollisions( this.vx, this.vy );
    this.advanceAnimation( this.FIXED_STEP );
    if (this.outOfBounds) { this.kill(); }
    
    if (this.touchingBottom || this.touchingTop) { this.vy = 0; }
    
  },
  
  onAnimationFrameAdvance: function(animationName, frameIndex) {
    if (this.touchingBottom && animationName === 'inch' && frameIndex === 1) {
      this.translateWithTileCollisions( this.direction * 10, this.gravity );
      this.vx = this.direction * 5;
      //this.touchingBottom = true;
    }
  }
  
});

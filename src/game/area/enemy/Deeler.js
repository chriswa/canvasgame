R.spawnableSprites['Deeler'] = Object.extend(Enemy, {
  
  FIXED_STEP: 1000 / 60,
  hitbox: { x1: 0, y1: 0, x2: 32, y2: 32 },
  
  behaviour: 'canopy',
  canopyY: 0,
  
  CANOPY_SPEED:  1.5,
  DESCEND_SPEED: 4,
  ASCEND_SPEED:  2,
  
  init: function(spawnInfo) {
    Enemy.init.call(this, 'deeler');
    this.startAnimation('canopy');
    this.advanceAnimation(0);
    this.canopyY = spawnInfo.y;
  },
  
  updateFixedStep: function() {
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    if (this.behaviour === 'canopy') {
      var distanceToPlayer = Game.area.playerSprite.x - this.x;
      if (Math.abs(distanceToPlayer) < 100 && Math.random() < 0.01) {
        this.behaviour = 'descend';
        this.startAnimation('attack');
      }
      else {
        this.x += sign(distanceToPlayer) * this.CANOPY_SPEED;
      }
    }
    
    if (this.behaviour === 'descend') {
      this.y += this.DESCEND_SPEED;
      if (this.y >= this.canopyY + 32 * 7) {
        this.behaviour = 'ascend';
      }
    }
    
    if (this.behaviour === 'ascend') {
      this.y -= this.ASCEND_SPEED;
      if (this.y <= this.canopyY) {
        this.y = this.canopyY;
        this.behaviour = 'canopy';
        this.startAnimation('canopy');
      }
    }
    
    this.advanceAnimation( this.FIXED_STEP );
    
  },
  
  // draw web line back up to canopy
  render: function(ox, oy) {
    Enemy.render.call(this, ox, oy);
    
    if (this.y > this.canopyY) {
    
      var x = Math.round( this.x + 16 );
      var y = Math.round( this.y );
      var canopyY = Math.round( this.canopyY );
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo( x - ox, canopyY - oy );
      ctx.lineTo( x - ox, y - oy );
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  },
  
});

R.spawnableSprites['Deeler'] = Object.extend(Enemy, {
  
  FIXED_STEP: 1000 / 60,
  hitbox: { x1: -16, y1: -16, x2: 16, y2: 16 },
  
  behaviour: 'canopy',
  canopyY: 0,
  
  CANOPY_SPEED:  1,
  DESCEND_SPEED: 4,
  ASCEND_SPEED:  2,
  
  init: function(area, spawnInfo) {
    Enemy.init.call(this, area, 'deeler');
    this.startAnimation('canopy');
    this.advanceAnimation(0);
    this.canopyY = spawnInfo.y;
  },
  
  updateFixedStep: function() {
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    if (this.behaviour === 'canopy') {
      var distanceToPlayer = this.area.playerSprite.x - this.x;
      if (Math.abs(distanceToPlayer) < 80 && Math.random() < 0.02) {
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
    
      var x = Math.round( this.x );
      var y = Math.round( this.y - 16 );
      var canopyY = Math.round( this.canopyY - 16 );
      
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

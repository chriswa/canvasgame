R.spawnableSprites['Deeler'] = Object.extend(Entity, {
  hitbox: { x1: -16, y1: -16, x2: 16, y2: 16 },
  
  behaviour: 'canopy',
  canopyY: 0,
  
  CANOPY_SPEED:  1,
  DESCEND_SPEED: 4,
  ASCEND_SPEED:  2,
  
  init: function(area, spawnInfo) {
    Entity.init.call(this, area, 'deeler');
    //this.uber('init', area, 'deeler');
    this.startAnimation('canopy');
    this.advanceAnimation(0);
    this.canopyY = spawnInfo.y;
  },
  
  updateFixedStep: function(dt) {
    // update hurt timers, etc
    this.updateWhenHurt(dt);
    
    // do nothing while hurt
    if (this.isHurt()) { return; }
    
    // don't update when off screen
    if ( this.getStandardizedOffscreenDist() > 20 ) { return; }
    
    if (this.behaviour === 'canopy') {
      var distanceToPlayer = this.area.playerEntity.x - this.x;
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
    //this.uber('render', ox, oy);
    Entity.render.call(this, ox, oy);
    
    if (this.y > this.canopyY) {
    
      var x = Math.round( this.x );
      var y = Math.round( this.y - 16 );
      var canopyY = Math.round( this.canopyY - 16 );
      
      CANVAS_CTX.strokeStyle = '#fff';
      CANVAS_CTX.lineWidth   = 2;
      CANVAS_CTX.beginPath();
      CANVAS_CTX.moveTo( x - ox, canopyY - oy );
      CANVAS_CTX.lineTo( x - ox, y - oy );
      CANVAS_CTX.stroke();
      CANVAS_CTX.lineWidth = 1;
    }
  },
  
});

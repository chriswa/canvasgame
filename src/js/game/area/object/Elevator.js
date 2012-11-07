R.spawnableSprites['Elevator'] = Object.extend(Enemy, {
  hitbox: { x1: -24, y1: -10, x2: 24, y2: 8 }, // extra pixels on top
  
  isStabbable:   false,
  isDangerous:   false,
  
  activeTimer: 0,
  
  SPEED: 0.2,
  className: 'Elevator', // XXX: this should be set by ALL entities via the register function which should add them to R.areaEntityClasses
  
  init: function(area, spawn) {
    Enemy.init.call(this, area, 'elevator');
  },
  
  onPlayerCollision: function(playerSprite) {
    var ps = playerSprite;
    ps.y = this.y + this.hitbox.y1 - ps.hitbox.y2 + 2; // set player atop our platform, embedded slightly for continual collisions
    ps.vy = 1;
    ps.isOnElevator = true;
    this.activeTimer = 2;
  },
  
  moveUnderPlayer: function() {
    var ps = this.area.playerSprite;
    this.y = ps.y + ps.hitbox.y2 - this.hitbox.y1 - 2;
  },
  
  update: function(dt) {
    this.activeTimer -= 1;
    
    var ps = this.area.playerSprite;
    
    if (this.activeTimer > 0) {
      var dy = 0;
      if (Input.gamepad.held.up)   { dy = -this.SPEED * dt; }
      if (Input.gamepad.held.down) { dy =  this.SPEED * dt; }
      
      // set player atop our platform, embedded slightly for continual collisions
      ps.y = this.y + this.hitbox.y1 - ps.hitbox.y2 + 2;
      
      // move player up or down, as desired - while respecting tile collisions
      var touching = ps.translateWithTileCollisions( 0, dy );
      
      // move ourselves to be perfectly under the player
      this.moveUnderPlayer();
      
      // 
      if (touching.bottom) {
        ps.isOnElevator = false;
      }
      
    }
    
    if (this.activeTimer === 0) {
      ps.isOnElevator = false;
    }
  },
  
  render: function(ox, oy) {
    Enemy.render.call(this, ox, oy);
    Enemy.render.call(this, ox, oy + 80);
  }
  
});

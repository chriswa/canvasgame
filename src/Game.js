// Game object
var Game = {
  hud: null,
  area: null,
  player: null,
  playerSprite: null,
  
  allEntities: null,
  enemiesGroup: null,
  
  
  areaTransition: null,
  
  init: function() {
    
    this.allEntities  = Object.build(EntityGroup);
    this.enemiesGroup = Object.build(EntityGroup);
    
    this.hud = Object.build(HUD);
    
    this.reset();
  },
  reset: function() {
    this.player = Object.build(Player);
    this.loadArea({area: 'test2', x: 146, y: 352});
  },
  loadArea: function(exitObject) {
    
    console.log(["Game.loadArea", exitObject]);
    
    // if the player is leaving an area, we can use which side of it they're on to guess where the player should appear on the next area
    var nextSide = null;
    if (this.playerSprite && this.area) {
      nextSide = (this.playerSprite.x > this.area.cols * this.area.tileSize / 2) ? 'left' : 'right'; // walking off left side enters on right side (and vice versa)
    }
    
    // destroy all entities (including playerSprite)
    _.invoke(this.allEntities.collection, 'destroy');
    // TODO: instead of destroying each entity, consider simply recreating entity groups, thus letting all entities get GC'd
    //this.allEntities  = Object.build(EntityGroup);
    //this.enemiesGroup = Object.build(EntityGroup);
    
    // initialize new area
    this.area = Object.build(Area, exitObject.area);
    
    // spawn a playerSprite
    this.playerSprite = Object.build(PlayerSprite);
    this.playerSprite.reset();
    
    // set the playerSprite's position and velocity
    if (exitObject.x && exitObject.y) {
      this.playerSprite.x = exitObject.x;
      this.playerSprite.y = exitObject.y;
      // TODO: also set velocity
    }
    else {
      var side = exitObject.side || nextSide || 'left';
      
      // find the first solid tile from the bottom
      var tx = (side === 'left') ? 0 : this.area.cols - 1;
      for (var ty = this.area.rows - 1; ty > 2; ty--) {
        if (this.area.getPhysicsTile(tx, ty) < 1) { break; }
      }
      
      // place player
      this.playerSprite.x = (side === 'left') ? -this.playerSprite.hitbox.x1 : ((tx + 1) * this.area.tileSize) - this.playerSprite.hitbox.x2;
      this.playerSprite.y = (ty + 1) * this.area.tileSize - this.playerSprite.hitbox.y2;
      this.playerSprite.vx = (side === 'left') ? 4 : -4;
      
      this.playerSprite.facing = (side === 'left') ? 1 : -1;
      this.playerSprite.startAnimation('walk');
    }
  },
  update: function() {
    
    // if we've queued an area transition, load the new area
    if (this.areaTransition) {
      this.loadArea(this.areaTransition);
      this.areaTransition = null;
    }
    
    // update entities
    this.allEntities.update();
    
    // update area
    this.area.update();
    
    // do collisions
    var p = this.playerSprite;
    this.enemiesGroup.each(function(e) {
      if (e.x + e.hitbox.x2 > p.x + p.hitbox.x1 && e.x + e.hitbox.x1 < p.x + p.hitbox.x2 && e.y + e.hitbox.y2 > p.y + p.hitbox.y1 && e.y + e.hitbox.y1 < p.y + p.hitbox.y2) {
        //e.vy = -5;
        p.collideWithEnemy(e);
      }
    });
    
    // cull entities while have been "killed"
    _.invoke(_.filter(this.allEntities.collection, function(spr) { return spr.readyToCull; }), 'destroy');
  },
  handlePlayerAttack: function(absHitbox) {
    //App.drawDebugRect(absHitbox, '#f00');
    this.enemiesGroup.each(function(e) {
      if (e.x + e.hitbox.x2 > absHitbox.x1 && e.x + e.hitbox.x1 < absHitbox.x2 && e.y + e.hitbox.y2 > absHitbox.y1 && e.y + e.hitbox.y1 < absHitbox.y2) {
        e.kill();
      }
    });
  },
  queueAreaTransition: function(exitObject) {
    this.areaTransition = exitObject;
  },
  render: function(stepInterpolation) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.area.render(stepInterpolation);
    this.allEntities.render(stepInterpolation);
    this.hud.render();
  },
};

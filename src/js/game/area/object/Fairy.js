R.spawnableSprites['Fairy'] = Object.extend(Entity, {
  hitbox: { x1: -8, y1: -15, x2: 8, y2: 15 },
  
  isStabbable:   false,
  isDangerous:   false,
  
  hasPlayedSfx:  false,
  isHealing:     false,
  healTimer:     0,
  
  HEAL_DELAY:    100,
  
  init: function(area, spawn) {
    Entity.init.call(this, area, 'fairy');
  },
  
  onPlayerCollision: function(playerEntity) {
    if (!this.isHealing) {
      this.onComplete();
      this.isHealing           = true;
      playerEntity.frozenTimer = Infinity;
      this.healTimer           = this.HEAL_DELAY;
    }
  },
  
  update: function(dt) {
    if ( !this.hasPlayedSfx && dt > 0 ) {
      this.hasPlayedSfx = true;
      Audio.play('AOL_Fairy');
    }
    
    if (this.isHealing) {
      this.healTimer -= dt;
      if (this.healTimer <= 0) {
        this.healTimer += this.HEAL_DELAY;
        if (Game.player.health >= Game.player.healthMax) {
          this.area.playerEntity.frozenTimer = 0;
          this.kill();
        }
        else {
          Game.player.health += 1;
        }
      }
    }
    
    this.advanceAnimation(dt);
  },
  
  render: function(ox, oy) {
    if (!this.isHealing) {
      Entity.render.call(this, ox, oy);
    }
  }
  
});

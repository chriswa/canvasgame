R.spawnableSprites['Fairy'] = Object.extend(Enemy, {
  hitbox: { x1: -8, y1: -15, x2: 8, y2: 15 },
  
  isCollectable: true,
  isStabbable:   false,
  isDangerous:   false,
  
  hasPlayedSfx:  false,
  isHealing:     false,
  healTimer:     0,
  
  HEAL_DELAY:    100,
  
  init: function(area, spawn) {
    Enemy.init.call(this, area, 'fairy');
  },
  
  onPlayerCollision: function(playerSprite) {
    if (!this.isHealing) {
      this.isHealing           = true;
      playerSprite.frozenTimer = Infinity;
      this.healTimer           = this.HEAL_DELAY;
    }
  },
  
  update: function(dt) {
    if ( !this.hasPlayedSfx && dt > 0 ) {
      this.hasPlayedSfx = true;
      App.sfx.play('AOL_Fairy');
    }
    
    if (this.isHealing) {
      this.healTimer -= dt;
      if (this.healTimer <= 0) {
        this.healTimer += this.HEAL_DELAY;
        if (Game.player.health >= Game.player.healthMax) {
          this.area.playerSprite.frozenTimer = 0;
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
      Enemy.render.call(this, ox, oy);
    }
  }
  
});

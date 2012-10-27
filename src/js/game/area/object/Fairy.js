R.spawnableSprites['Fairy'] = Object.extend(Enemy, {
  hitbox: { x1: 0, y1: 0, x2: 16, y2: 30 },
  
  isCollectable: true,
  isStabbable:   false,
  isDangerous:   false,
  hasPlayedSfx:  false,
  
  init: function(area, spawn) {
    Enemy.init.call(this, area, 'fairy');
    this.x += 8;
  },
  
  onPlayerCollision: function(playerSprite) {
    playerSprite.frozenTimer = 500;
    this.kill();
    Game.player.health = Game.player.healthMax;
  },
  
  update: function(dt) {
    if ( !this.hasPlayedSfx && dt > 0 ) {
      this.hasPlayedSfx = true;
      App.sfx.play('AOL_Fairy');
    }
    this.advanceAnimation(dt);
  },
});

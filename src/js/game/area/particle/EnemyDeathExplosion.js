var EnemyDeathExplosion = Object.extend(Sprite, {
  
  age: 0,
  
  init: function(area, pos) {
    this.area = area;
    Sprite.init.call(this, 'explosion');
    this.x = pos.x;
    this.y = pos.y;
  },
  
  update: function(dt) {
    this.age += dt;
    if (this.age > 500) {
      this.kill();
    }
    else {
      this.advanceAnimation(dt);
    }
  },
  
});

var SampleParticle = Object.extend(Sprite, {
  
  age: 0,
  
  init: function(pos) {
    Sprite.init.call(this, 'fireball');
    this.x = pos.x;
    this.y = pos.y;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.1;
  },
  
  update: function(dt) {
    this.age += dt;
    this.advanceAnimation(dt);
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    if (this.age > 500) {
      this.kill();
    }
  },
  
});

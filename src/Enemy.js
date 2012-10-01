var Enemy = Object.extend(PhysicsSprite, {
  init: function() {
    Sprite.init.apply(this, Array.prototype.slice.call(arguments, 0));
    this.addToGroup(Game.enemiesGroup);
  },
});

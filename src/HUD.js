var HUD = {
  update: function() {
    
  },
  render: function() {
    var p = Game.player;
    var maxHearts = p.healthMax / 2;
    for (var i = 0; i < maxHearts; i++) {
      var slice = 2;
      if (p.health > i * 2 + 1) { slice = 0; }
      if (p.health === i * 2 + 1) { slice = 1; }
      this.blit(slice, 5 + 20 * i, 5);
    }
  },
  blit: function(sliceIndex, x, y) {
    var slice = R.imageSlices['ui'][sliceIndex];
    ctx.drawImage(R.images.ui[0], slice.x, slice.y, slice.w, slice.h, x, y, slice.w, slice.h);
  },
};

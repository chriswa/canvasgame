var AreaHUD = {
  update: function() {
    
  },
  render: function() {
    
    // draw hearts
    var maxHearts = Game.player.healthMax / 2;
    for (var i = 0; i < maxHearts; i++) {
      var sliceFilename = 'hud-heart-empty.png';
      if (Game.player.health > i * 2 + 1)   { sliceFilename = 'hud-heart-full.png'; }
      if (Game.player.health === i * 2 + 1) { sliceFilename = 'hud-heart-half.png'; }
      App.gfx.blitSliceByFilename(sliceFilename, 5 + 20 * i, 5);
    }
    
    // draw keys
    if (Game.player.currentDungeonId) {
      for (var i = 0; i < Game.player.dungeonState[Game.player.currentDungeonId].keys; i++) {
        App.gfx.blitSliceByFilename('key.png', 5 + 20 * i, 25);
      }
    }
    
    // draw extra lives
    //for (var i = 0; i < p.lives; i++) {
    //  App.gfx.blitSliceByFilename('extralife.png', CANVAS.width - 16 - (5 + 20 * i), 5);
    //}
  }
};

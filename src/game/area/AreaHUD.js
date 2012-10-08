var AreaHUD = {
  update: function() {
    
  },
  render: function() {
    var p = Game.player;
    
    // draw hearts
    var maxHearts = p.healthMax / 2;
    for (var i = 0; i < maxHearts; i++) {
      var sliceFilename = 'hud-heart-empty.png';
      if (p.health > i * 2 + 1)   { sliceFilename = 'hud-heart-full.png'; }
      if (p.health === i * 2 + 1) { sliceFilename = 'hud-heart-half.png'; }
      App.blitSliceByFilename(sliceFilename, 5 + 20 * i, 5);
    }
    
    // draw keys
    for (var i = 0; i < p.dungeonFlags.keys; i++) {
      App.blitSliceByFilename('key.png', 5 + 20 * i, 25);
    }
  },
};
var R = {
  
  // imageModifiers
  IMG_ORIGINAL: 0,
  IMG_FLIPX:    1,
  IMG_PINK:     2,
  IMG_CYAN:     4,
  
  //
  areaPaletteShifts: {
    road: {
      0: (92) + (148 <<8) + (252 <<16), // black -> sky blue
    },
  },
  
  //
  spawnableSprites: {}, // spawnable area sprites (this is filled up by the included game/area/sprite/*.js files)
  
};

// add some extra stuff after R.sprites.js builds things
R.beforeLoad = function() {
  R.images['tiles3.png']          = { "imageModifiers": [], };
  R.images['tiles-old.png']       = { "imageModifiers": [], };
  R.images['overworld-tiles.png'] = { "imageModifiers": [], };
  //R.images['ui.png']              = { "imageModifiers": [], };
};

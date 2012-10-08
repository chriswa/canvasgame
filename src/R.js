var R = {
  
  // imageModifiers
  IMG_ORIGINAL: 0,
  IMG_FLIPX:    1,
  IMG_PINK:     2,
  IMG_CYAN:     4,
  
  //
  spawnableSprites: {}, // spawnable area sprites (this is filled up by the included game/area/sprite/*.js files)
  
};

// add some extra stuff after R.sprites.js builds things
R.beforeLoad = function() {
  R.images['tiles']           = { "filename": "res/tiles3.png",          "imageModifiers": [], };
  R.images['tiles-old']       = { "filename": "res/tiles-old.png",       "imageModifiers": [], };
  R.images['overworld-tiles'] = { "filename": "res/overworld-tiles.png", "imageModifiers": [], };
  //R.images['ui'] = { "filename": "res/ui.png",            "imageModifiers": [], };
};

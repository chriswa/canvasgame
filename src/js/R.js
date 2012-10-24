var R = {
  
  // spriteImageModifiers
  IMG_ORIGINAL: 0,
  IMG_FLIPX:    1,
  IMG_PINK:     2,
  IMG_CYAN:     4,
  
  //
  tilesetImages: {
    'overworld-tiles.png': null,
    'tiles-old.png':       null,
    'tiles3.png':          null,
    'tiles-new.png':       null,
    'tiles4.png':          null,
  },
  
  //
  sfx: {
    // game
    'AOL_Die':              1,
    'AOL_Ganon_Laugh':      1,
    
    // overworld
    'AOL_Battle':           1,
    'AOL_Map':              1,
    
    // player
    'AOL_Deflect':          3,
    'AOL_Hurt':             1,
    'AOL_LevelUp_GetItem':  1,
    'AOL_Sword':            3,
    'AOL_Sword_Hit':        3,
    
    // enemies
    'AOL_Kill':             3,
    'AOL_Fairy':            1,
  },
  
  //
  spawnableSprites: {}, // spawnable area sprites (this is filled up by the included game/area/sprite/*.js files)
  
};


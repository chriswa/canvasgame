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
  },
  
  //
  sfx: {
    // game
    'AOL_Die':              null,
    'AOL_Ganon_Laugh':      null,
    
    // overworld
    'AOL_Battle':           null,
    'AOL_Map':              null,
    
    // player
    'AOL_Deflect':          null,
    'AOL_Hurt':             null,
    'AOL_LevelUp_GetItem':  null,
    'AOL_Sword':            null,
    'AOL_Sword_Hit':        null,
    
    // enemies
    'AOL_Kill':             null,
    'AOL_Fairy':            null,
  },
  
  //
  spawnableSprites: {}, // spawnable area sprites (this is filled up by the included game/area/sprite/*.js files)
  
};


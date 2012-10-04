// Player object
var Player = {
  health:    6,
  healthMax: 6,
  dungeonFlags: undefined,
  worldFlags: undefined,
  init: function() {
    this.dungeonFlags = { keys: 0 };
    this.worldFlags   = {};
  }
};

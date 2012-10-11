// Game object
var Game = {
  overworld: null,
  area: null,
  areaHud: null,
  player: null,
  
  areaTransition: null,
  
  state: null,
  
  init: function() {
    App.game = this;
    this.overworld = Object.build(Overworld);
    this.areaHud = Object.build(AreaHUD);
    this.reset();
  },
  gameover: function() {
    this.queueGameOver = true;
  },
  reset: function() {
    //this.player = Object.build(Player);
    this.player = {
      health:       6,
      healthMax:    6,
      overworldX:   52,   // north castle == (28, 25)
      overworldY:   25,
      dungeonFlags: { keys: 0 },
      worldFlags:   {},
    };
    this.overworld.reset();
    this.setState('overworld');
    
    // TESTING
    //this.setState('area', {area: 'test2', x: 150, y: 352}); // in small room with enemies
    //this.setState('area', {area: 'test3', x: 1992, y: 352}); // beside a long, flat stretch
    //this.setState('area', {area: 'test', x: 590, y: 0}); // near octoroks
    //this.setState('area', {area: 'intro1', x: 590, y: 0}); // intro
    //this.overworld.startEncounter({type: 'blob'}, this.overworld.terrainTypes.FOREST); // encounter
  },
  
  update: function(dt) {
    // if we've queued an area transition, load the new area
    this.transitionIfNeeded();
    
    // update state (area/overworld/other)
    this.state.update(dt);
    
    if (this.queueGameOver) {
      this.queueGameOver = false;
      this.setState('noop');
      App.drawTextScreen("GAME OVER");
      setTimeout(function() {
        Game.reset();
      }, 2000);
    }
  },
  queueAreaTransition: function(exitObject) {
    this.areaTransition = exitObject;
  },
  transitionIfNeeded: function() {
    var areaTransition = this.areaTransition;
    if (!areaTransition) { return; }
    this.areaTransition = null;
    
    // we can guess where to enter an area based on which side the player is walking off (not all areaTransitions use this)
    var sideHint = undefined;
    if (this.area) {
      sideHint = (this.area.playerSprite.x > this.area.cols * this.area.tileSize / 2) ? 'right' : 'left'; // walking off left side enters on right side (and vice versa)
    }
    
    // "bridge" style rules for which side to enter from?
    var lastDir = this.overworld.player.lastDir;
    if (areaTransition.sidenorth && lastDir === 'north') { sideHint = areaTransition.sidenorth; }
    if (areaTransition.sidesouth && lastDir === 'south') { sideHint = areaTransition.sidesouth; }
    if (areaTransition.sideeast  && lastDir === 'east' ) { sideHint = areaTransition.sideeast;  }
    if (areaTransition.sidewest  && lastDir === 'west' ) { sideHint = areaTransition.sidewest;  }
    
    // add delay time going back and forth between overworld, but not between "attached" areas 
    var delayTime = 250;
    if (this.area && areaTransition.area !== 'overworld') { delayTime = 0; }
    
    // prepare to do the transition
    var doTransition = function() {
      if (areaTransition.area === 'overworld') {
        // move player to destination if requested
        if (areaTransition.x) { Game.player.overworldX = areaTransition.x; }
        if (areaTransition.y) { Game.player.overworldY = areaTransition.y; }
        this.setState('overworld');
      }
      else {
        this.setState('area', areaTransition, sideHint);
      }
    }.bind(this);
    
    // if there's no delay, just do it
    if (delayTime === 0) {
      doTransition();
    }
    // otherwise, paint it black and set a timeout
    else {
      this.setState('noop');
      App.paintScreen('#000');
      setTimeout(doTransition, delayTime);
    }
    
  },
  render: function() {
    this.state.render();
  },
  
  // FSM
  setState: function(newState) {
    if (this.state && this.state.onleavestate) { this.state.onleavestate(newState); }
    this.state = this.STATES[newState];
    if (this.state.onenterstate) { this.state.onenterstate.apply(this, Array.prototype.slice.call(arguments, 1)); }
  },
  STATES: {
    area: {
      onenterstate: function(exitObject, sideHint) {
        Game.area = Object.build(Area, exitObject, sideHint);
      },
      onleavestate: function() {
        Game.area = null; // not necessary, but cleaner this way!
      },
      update: function(dt) {
        Game.area.update(dt);
      },
      render: function() {
        Game.area.render();
        Game.areaHud.render();
      },
    },
    overworld: {
      onenterstate: function() {
        Game.overworld.player.finishMove();
      },
      update: function(dt) {
        Game.overworld.update(dt);
      },
      render: function() {
        Game.overworld.render();
        Game.areaHud.render();
      },
    },
    noop: {
      update: function(dt) {},
      render: function() {},
    }
  },
};

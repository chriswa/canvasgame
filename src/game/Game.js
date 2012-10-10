// Game object
var Game = {
  overworld: null,
  area: null,
  areaHud: null,
  player: null,
  
  isOverworldActive: null,
  
  areaTransition: null,
  
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
    this.isOverworldActive = true;
    this.overworld.reset();
    //this.loadArea({area: 'test2', x: 150, y: 352}); // in small room with enemies
    //this.loadArea({area: 'test3', x: 1992, y: 352}); // beside a long, flat stretch
    //this.loadArea({area: 'test', x: 590, y: 0}); // near octoroks
    //this.loadArea({area: 'intro1', x: 590, y: 0}); // intro
  },
  loadArea: function(exitObject, sideHint) {
    this.area = Object.build(Area, exitObject, sideHint);
  },
  unloadArea: function() {
    this.area = null;
  },
  update: function(dt) {
    // if we've queued an area transition, load the new area
    this.transitionIfNeeded();
    
    // update area (and sprites owned by it, including the playerSprite)
    if (this.area) {
      this.area.update(dt);
    }
    else if (this.isOverworldActive) {
      this.overworld.update(dt);
    }
    
    if (this.queueGameOver) {
      this.queueGameOver = false;
      this.unloadArea();
      this.isOverworldActive = false;
      App.drawTextScreen("GAME OVER");
      setTimeout(function() {
        Game.reset();
      }, 1000);
    }
  },
  queueAreaTransition: function(exitObject) {
    this.areaTransition = exitObject;
  },
  transitionIfNeeded: function() {
    if (!this.areaTransition) { return; }
    
    // we can guess where to enter an area based on which side the player is walking off (not all areaTransitions use this)
    var sideHint = undefined;
    if (this.area) {
      sideHint = (this.area.playerSprite.x > this.area.cols * this.area.tileSize / 2) ? 'right' : 'left'; // walking off left side enters on right side (and vice versa)
    }
    
    // "bridge" style rules?
    if (this.areaTransition.sidenorth && this.overworld.player.lastDir === 'north') { sideHint = this.areaTransition.sidenorth; }
    if (this.areaTransition.sidesouth && this.overworld.player.lastDir === 'south') { sideHint = this.areaTransition.sidesouth; }
    if (this.areaTransition.sideeast  && this.overworld.player.lastDir === 'east' ) { sideHint = this.areaTransition.sideeast;  }
    if (this.areaTransition.sidewest  && this.overworld.player.lastDir === 'west' ) { sideHint = this.areaTransition.sidewest;  }
    
    // add delay time going back and forth between overworld, not between "attached" areas 
    var delayTime = 250;
    if (this.area && this.areaTransition.area !== 'overworld') { delayTime = 0; }
    
    // set up a timer to do the transition after the delay
    var areaTransition = this.areaTransition;
    setTimeout(function() {
      
      if (areaTransition.area === 'overworld') {
        if (areaTransition.x) { Game.player.overworldX = areaTransition.x; }
        if (areaTransition.y) { Game.player.overworldY = areaTransition.y; }
        this.isOverworldActive = true;
        this.overworld.player.finishMove();
      }
      else {
        this.loadArea(areaTransition, sideHint);
      }
    }.bind(this), delayTime);
    
    // reset everything
    this.unloadArea();
    this.isOverworldActive = false;
    this.areaTransition = null;
    
    // paint it black
    if (delayTime > 0) {
      App.paintScreen('#000');
    }
    
  },
  render: function() {
    if (this.area) {
      this.area.render();
      this.areaHud.render();
    }
    else if (this.isOverworldActive) {
      this.overworld.render();
      this.areaHud.render();
    }
  },
};

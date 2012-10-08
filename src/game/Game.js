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
    //this.loadArea({area: 'test2', x: 150, y: 352}); // in small room with enemies
    //this.loadArea({area: 'test3', x: 1992, y: 352}); // beside a long, flat stretch
    //this.loadArea({area: 'test', x: 590, y: 0}); // near octoroks
    //this.loadArea({area: 'intro1', x: 590, y: 0}); // intro
  },
  loadArea: function(exitObject) {
    this.area = Object.build(Area, exitObject, this.area);
  },
  unloadArea: function() {
    this.area = null;
  },
  update: function(dt) {
    // if we've queued an area transition, load the new area
    if (this.areaTransition) {
      if (this.areaTransition.area === 'overworld') {
        this.unloadArea();
        if (this.areaTransition.x) { Game.player.overworldX = this.areaTransition.x; }
        if (this.areaTransition.y) { Game.player.overworldY = this.areaTransition.y; }
      }
      else {
        this.loadArea(this.areaTransition);
      }
      this.areaTransition = null;
    }
    
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
  render: function() {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
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

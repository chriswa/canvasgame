// Game object
var Game = {
  hud: null,
  area: null,
  player: null,
  playerSprite: null, // actually owned by Area, but a convenient pointer
  
  areaTransition: null,
  
  init: function() {
    App.game = this;
    this.hud = Object.build(HUD);
    this.reset();
  },
  gameover: function() {
    this.queueGameOver = true;
  },
  reset: function() {
    this.player = Object.build(Player);
    //this.loadArea({area: 'test2', x: 150, y: 352}); // in small room with enemies
    //this.loadArea({area: 'test3', x: 1992, y: 352}); // beside a long, flat stretch
    //this.loadArea({area: 'test', x: 590, y: 0}); // near octoroks
    this.loadArea({area: 'intro1', x: 590, y: 0}); // intro
  },
  loadArea: function(exitObject) {
    this.area = Object.build(Area, exitObject, this.area);
  },
  update: function(dt) {
    // if we've queued an area transition, load the new area
    if (this.areaTransition) {
      this.loadArea(this.areaTransition);
      this.areaTransition = null;
    }
    
    // update area (and sprites owned by it, including the playerSprite)
    if (this.area) {
      this.area.update(dt);
    }
    
    if (this.queueGameOver) {
      this.queueGameOver = false;
      this.area = undefined;
      App.drawTextScreen("GAME OVER");
      setTimeout(function() { Game.reset(); }, 1000);
    }
  },
  queueAreaTransition: function(exitObject) {
    this.areaTransition = exitObject;
  },
  render: function() {
    if (this.area) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.area.render();
      this.hud.render();
    }
  },
};

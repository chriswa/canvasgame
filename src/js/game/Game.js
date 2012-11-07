// Game object (singleton)
var Game = Object.extend(FiniteStateMachine, {
  overworld: null,
  area: null,
  areaHud: null,
  player: null,
  
  exitObject: null,
  
  init: function() {
    this.overworld = Object.build(Overworld);
    this.areaHud = Object.build(AreaHUD);
    this.setState(this.states.mainmenu)
    
    // DEVELOPMENT: allow query string to start an area or encounter
    if (App.request['area']) {
      this.startNewGame();
      var exitObject = { area: App.request['area'] };
      if (App.request['side']) { exitObject['side'] = App.request['side']; }
      if (App.request['x'])    { exitObject['x']    = parseInt(App.request['x'], 10); }
      if (App.request['y'])    { exitObject['y']    = parseInt(App.request['y'], 10); }
      this.queueExit(exitObject);
    }
    if (App.request['encounter']) {
      this.startNewGame();
      var terrainType     = this.overworld.terrainTypes[App.request['encounter']] || this.overworld.terrainTypes['FOREST'];
      var encounterObject = { type: 'blob' };
      if (App.request['type']) { encounterObject['type'] = App.request['type']; }
      this.overworld.startEncounter(encounterObject, terrainType);
    }
    if (App.request['overworld']) {
      this.startNewGame();
    }
    if (App.request['editor']) {
      this.startEditor();
    }
    
    // in case App fires a render before an update, make sure our activeState has been set (this seems to only happen on my netbook)
    this.updateState();
  },
  startNewGame: function() {
    this.player = {
      healthMax:          6,
      swordDamage:        1,
      worldState:         {},        // keep track of what's been killed/taken in the world
      dungeonState:       {}         // keep track of keys (not reset when you leave)
    };
    this.continueGame();
  },
  continueGame: function() {
    _.extend(this.player, {
      lives:              3,
      health:             this.player.healthMax,
      overworldX:         52,
      overworldY:         25,
      tempDungeonState:   undefined, // keep track of what's been killed/taken in the current dungeon (which will be reset when you leave)
      currentDungeonId:   undefined,
      lastArea:           undefined // for respawning after player death
    });
    this.overworld.reset();
    this.setState(this.states.overworld);
  },
  
  // update and render are delegated to the active state
  update: function(dt) {
    this.updateState();
    if (this.activeState.update) { this.activeState.update(dt); }
  },
  render: function() {
    if (this.activeState.render) { this.activeState.render(); }
  },
  
  // FSM states
  states: {
    
    //
    mainmenu: {
      onenterstate: function() {
        this.mainmenu = Object.build(MainMenu);
        App.sfx.playMusic("title");
      },
      onleavestate: function() {
        this.mainmenu.destroy();
      },
      update: function(dt) {
        this.mainmenu.update(dt);
      },
      render: function() {
        this.mainmenu.render();
      }
    },
    
    // 
    area: {
      onenterstate: function(newArea) {
        Input.setState(Input.gamepad);
        Game.area = newArea;
        var gp = Game.player;
        if (Game.area.areaData.properties.dungeonId) {
          gp.currentDungeonId = Game.area.areaData.properties.dungeonId;
          if (!gp.dungeonState[gp.currentDungeonId]) {
            gp.dungeonState[gp.currentDungeonId] = {};
          }
        }
        Game.area.startMusic();
      },
      onleavestate: function() {
        Input.setState(Input.none);
      },
      update: function(dt) {
        Game.area.update(dt);
      },
      render: function() {
        Game.area.render();
        Game.areaHud.render();
      }
    },
    
    // 
    overworld: {
      onenterstate: function() {
        App.sfx.playMusic("overworld");
        Input.setState(Input.gamepad);
        Game.overworld.player.finishMove();
        Game.overworld.updateCamera();
        Game.player.tempDungeonState = {};      // reset "oncePerDungeon" flags
        Game.player.currentDungeonId = undefined;
      },
      onleavestate: function() {
        Input.setState(Input.none);
      },
      update: function(dt) {
        Game.overworld.update(dt);
      },
      render: function() {
        Game.overworld.render();
        //Game.areaHud.render();
      }
    },
    
    //
    nextlife: {
      onenterstate: function(newArea) {
        App.sfx.stopMusic();
        this.newArea = newArea;
        //this.newArea.reset();
        App.gfx.drawTextScreen("Lives left: " + Game.player.lives, '#fff');
        setTimeout(function() {
          Game.setState(Game.states.area, newArea);
        }, 1500);
      }
    },
    
    // 
    gameover: {
      onenterstate: function() {
        App.sfx.stopMusic();
        App.sfx.play('AOL_Ganon_Laugh');
        App.gfx.drawTextScreen("GAME OVER");
        setTimeout(function() {
          Game.setState(Game.states.mainmenu);
        }, 3000);
      }
    },
    
    // 
    overworldWipe: {
      onenterstate: function(nextTransition, newArea) {
        App.sfx.stopMusic();
        this.stateTimer     = 0;
        this.nextTransition = nextTransition;
        this.newArea        = newArea;
        Input.setState(Input.gamepad);
      },
      onleavestate: function() {
        Input.setState(Input.none);
      },
      update: function(dt) {
        this.stateTimer += dt;
        if (this.stateTimer > 500) {
          this.nextTransition();
        }
        else if (this.newArea && this.stateTimer > 325) {
          this.newArea.update(dt);
        }
      },
      render: function() {
        var h = 0;
        if (this.stateTimer < 275) {
          h = Math.max(1, this.stateTimer / 225);
        }
        else {
          h = (500 - this.stateTimer) / 225;
          
          // render destination
          if (this.newArea) { this.newArea.render(); } else { Game.overworld.render(); }
        }
        CANVAS_CTX.fillStyle = '#000';
        var rectHeight = (CANVAS.height/2) * h;
        CANVAS_CTX.fillRect(0, 0, CANVAS.width, rectHeight);
        CANVAS_CTX.fillRect(0, CANVAS.height - rectHeight, CANVAS.width, rectHeight);
      }
    }
    
  }, // (end of FSM states)
  
  // API
  queuePlayerDeath: function() {
    Game.player.lives -= 1;
    if (Game.player.lives > 0) {
      Game.player.health = Game.player.healthMax;
      this.queueState(Game.states.nextlife, Object.build(Area, Game.player.lastArea.exitObject));
    }
    else {
      this.queueState(Game.states.gameover);
    }
  },
  
  queueExit: function(exitObject) {
    
    // clone exitObject so we can safely modify it
    exitObject = _.clone(exitObject);
    
    var doTransition;
    var newArea;      // or null if the target is the overworld
    
    // moving to the overworld?
    if (exitObject.area === 'overworld') {
      
      // move player to overworld coords if requested
      if (exitObject.x && exitObject.y) {
        Game.overworld.movePlayerTo(exitObject.x, exitObject.y);
      }
      else {
        Game.overworld.player.finishMove();
        Game.overworld.updateCamera();
      }
      
      // prepare transition code
      doTransition = function() {
        Game.queueState(Game.states.overworld);
      };
    }
    
    // not the overworld, moving to an area?
    else {
      
      // for area exitObjects which don't specify any side information, guess based on which side of an area the player is leaving (i.e. walking off left side enters on right side and vice versa)
      if (this.area) {
        var ps = this.area.playerSprite;
        exitObject.sideHint = (ps.x > this.area.maxX / 2) ? 'left' : 'right';
        if (ps.y + ps.hitbox.y1 < 0) {
          exitObject.sideHint = 'bottom'; // player went off top of area
        }
        else if (ps.y + ps.hitbox.y2 > this.area.maxY) {
          exitObject.sideHint = 'top'; // player went off bottom of area
        }
      }
      
      // overworld exitObjects which supply .going* properties depend on which direction the player was travelling when they entered the tile
      var lastDir = this.overworld.player.lastDir;
      var prop = 'going' + lastDir;
      if (exitObject[prop]) { exitObject.sideHint = exitObject[prop]; }
      
      //
      Game.player.lastArea = { exitObject: exitObject };
      var newArea = Object.build(Area, exitObject);
      
      // prepare transition code
      doTransition = function() {
        Game.queueState(Game.states.area, newArea);
      };
    }
    
    // if the player is moving between two areas (or overworld spots!), do the transition instantly
    var isInArea   = this.activeState === this.states.area;
    var isDestArea = exitObject.area !== 'overworld';
    if (isInArea === isDestArea) {
      doTransition();
    }
    
    // otherwise, do a timed animation
    else {
      if (exitObject.encounter === 'fairy') {
        // do nothing: the fairy itself will make a sound
      }
      else if (exitObject.encounter) {
        App.sfx.play('AOL_Battle');
      }
      else {
        App.sfx.play('AOL_Map');
      }
      this.queueState(Game.states.overworldWipe, doTransition, newArea);
    }
    
  },
  
  startEditor: function() {
    if (App.isMobile) { alert('Editor is not supported on mobile'); return; }
    $('#debug-panel').hide();
    $('.editor').show();
    alert('TODO');
  }
  
});

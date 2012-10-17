// Game object (singleton)
var Game = {
  overworld: null,
  area: null,
  areaHud: null,
  player: null,
  
  exitObject: null,
  
  activeState: null,
  
  state: null,
  
  init: function() {
    this.overworld = Object.build(Overworld);
    this.areaHud = Object.build(AreaHUD);
    this.reset();
  },
  reset: function() {
    //this.player = Object.build(Player);
    this.player = {
      lives:        3,
      health:       6,
      healthMax:    6,
      overworldX:   52,   // zelda's palace == (28, 25)
      overworldY:   25,
      dungeonFlags: {},
      worldFlags:   {},
      lastArea:     undefined // for respawning after player death
    };
    this.overworld.reset();
    this.setState('overworld');
    
    // TESTING
    //this.queueExit({area: 'northeast_tunnel', x: 690, y: 352}); // octorok and bot
    //this.queueExit({area: 'testbotspawner'});
    //this.overworld.startEncounter({type: 'blob'}, this.overworld.terrainTypes.FOREST); // encounter
  },
  
  // update and render are delegated to the active state
  update: function(dt) {
    this.updateState();
    if (this.activeState.update) { this.activeState.update(dt); }
  },
  render: function() {
    if (this.activeState.render) { this.activeState.render(); }
  },
  
  // FSM
  queuedState: undefined,
  queueState: function(newState) {
    this.queuedState = Array.prototype.slice.call(arguments, 0);
  },
  updateState: function() {
    if (this.queuedState) {
      this.setState.apply(this, this.queuedState);
      this.queuedState = undefined;
    }
  },
  setState: function(newState) {
    if (this.activeState && this.activeState.onleavestate) { this.activeState.onleavestate(newState); }
    this.activeState = this.states[newState];
    if (this.activeState.onenterstate) { this.activeState.onenterstate.apply(this.activeState, Array.prototype.slice.call(arguments, 1)); }
  },
  
  // FSM states
  states: {
    
    // 
    area: {
      onenterstate: function(newArea) {
        Game.area = newArea;
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
        Game.overworld.player.finishMove();
        Game.overworld.updateCamera();
        Game.player.dungeonFlags = {};      // reset "oncePerDungeon" flags
      },
      update: function(dt) {
        Game.overworld.update(dt);
      },
      render: function() {
        Game.overworld.render();
        Game.areaHud.render();
      }
    },
    
    //
    nextlife: {
      onenterstate: function(newArea) {
        this.newArea = newArea;
        App.drawTextScreen("Lives left: " + Game.player.lives, '#fff');
        setTimeout(function() {
          Game.setState('area', newArea);
        }, 1500);
      }
    },
    
    // 
    gameover: {
      onenterstate: function() {
        App.playSfx('AOL_Ganon_Laugh');
        App.drawTextScreen("GAME OVER");
        setTimeout(function() {
          Game.reset();
        }, 3000);
      }
    },
    
    // 
    overworldWipe: {
      onenterstate: function(nextTransition, newArea) {
        this.stateTimer     = 0;
        this.nextTransition = nextTransition;
        this.newArea        = newArea;
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
          h = this.stateTimer / 225;
        }
        else {
          h = (500 - this.stateTimer) / 225;
          
          // render destination
          if (this.newArea) { this.newArea.render(); } else { Game.overworld.render(); }
        }
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, (canvas.height/2) * h);
        ctx.fillRect(0, canvas.height - (canvas.height/2) * h, canvas.width, (canvas.height/2) * h);
      }
    }
    
  }, // (end of FSM states)
  
  // API
  queuePlayerDeath: function() {
    Game.player.lives -= 1;
    if (Game.player.lives > 0) {
      Game.player.health = Game.player.healthMax;
      this.queueState('nextlife', Object.build(Area, Game.player.lastArea.exitObject, Game.player.lastArea.sideHint));
    }
    else {
      this.queueState('gameover');
    }
  },
  queueGameover: function() {
    this.queueState('gameover');
  },
  
  queueExit: function(exitObject) {
    
    var doTransition;
    var newArea;      // or null if the target is the overworld
    
    // moving to the overworld?
    if (exitObject.area === 'overworld') {
      
      // move player to destination if requested
      if (exitObject.x && exitObject.y) {
        Game.overworld.movePlayerTo(exitObject.x, exitObject.y);
      }
      else {
        Game.overworld.player.finishMove();
        Game.overworld.updateCamera();
      }
      
      // prepare transition code
      doTransition = function() {
        Game.queueState('overworld');
      };
    }
    
    // not the overworld, moving to an area?
    else {
      
      // for area exitObjects which don't specify any side information, guess based on which side of an area the player is leaving (i.e. walking off left side enters on right side and vice versa)
      var sideHint = undefined;
      var oldArea  = this.area;
      if (oldArea) {
        sideHint = (oldArea.playerSprite.x > oldArea.maxX / 2) ? 'right' : 'left';
      }
      
      // overworld exitObjects which supply .side* properties depend on which direction the player entered the square from
      var lastDir = this.overworld.player.lastDir;
      if (exitObject.sidenorth && lastDir === 'north') { sideHint = exitObject.sidenorth; }
      if (exitObject.sidesouth && lastDir === 'south') { sideHint = exitObject.sidesouth; }
      if (exitObject.sideeast  && lastDir === 'east' ) { sideHint = exitObject.sideeast;  }
      if (exitObject.sidewest  && lastDir === 'west' ) { sideHint = exitObject.sidewest;  }
      
      //
      Game.player.lastArea = { exitObject: exitObject, sideHint: sideHint };
      var newArea = Object.build(Area, exitObject, sideHint);
      
      // prepare transition code
      doTransition = function() {
        Game.queueState('area', newArea);
      };
    }
    
    // if the player is going between two areas, simply queue the transition now
    if (this.activeState === this.states.area && exitObject.area !== 'overworld') {
      doTransition();
    }
    
    // otherwise, do a timed animation
    else {
      if (exitObject.encounter === 'fairy') {
        // do nothing: the fairy itself will make a sound
      }
      else if (exitObject.encounter) {
        App.playSfx('AOL_Battle');
      }
      else {
        App.playSfx('AOL_Map');
      }
      this.queueState('overworldWipe', doTransition, newArea);
    }
    
  }
  
};

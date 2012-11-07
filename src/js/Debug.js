var Debug = {
  
  showStatusbar: true,
  showHitboxes: false,
  clickToTeleport: false,
  
  shapesToDraw: [],
  statusTextToDraw: [],
  
  logFrameTimer: 0,
  loggingEnabled: false,
  
  init: function() {
    
    this.fpsCounter1 = Object.build(FPSCounter, 100);
    this.fpsCounter2 = Object.build(FPSCounter, 10);
    this.fpsCounter3 = Object.build(FPSCounter, 1);
    
    // fill area
    $('#areaDropdown').append('<option></option>');
    for (var areaId in R.areas) {
      if (areaId === 'overworld') { continue; }
      $('#areaDropdown').append('<option>'+areaId+'</option>');
    }
    
    // hook Game.setState to update UI
    var originalSetState = Game.setState;
    Game.setState = function(newState, newArea) {
      if (newState === Game.states.area) {
        $('#areaDropdown').val(newArea.areaId);
        $('#leaveToOverworld').removeAttr('disabled');
        $('#godmode').removeAttr('disabled');
      }
      else {
        $('#areaDropdown').val('');
        $('#leaveToOverworld').attr('disabled', 'disabled');
        $('#godmode').attr('disabled', 'disabled');
      }
      originalSetState.apply(Game, Array.prototype.slice.call(arguments));
    };
    
    //
    $('#areaDropdown').change(function() {
      if (!$(this).val()) { return; }
      Game.queueExit({ area: $(this).val() });
    })
    
    // clicking on the canvas teleports you to that point
    $(CANVAS).click(function(e) {
      if (Debug.clickToTeleport) {
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;
        var area = Game.area;
        if (Game.activeState === Game.states.area) {
          area.playerSprite.x = x + area.renderOffsetX - 16;
          area.playerSprite.y = y + area.renderOffsetY - 32;
          area.playerSprite.vx = area.playerSprite.vy = 0;
        }
        else if (Game.activeState === Game.states.overworld) {
          Game.player.overworldX = Math.floor((x + Game.overworld.renderOffsetX) / 32);
          Game.player.overworldY = Math.floor((y + Game.overworld.renderOffsetY) / 32);
        }
      }
    });
    
  },
  
  drawRect: function(rect, colour) {
    if (!Debug.showHitboxes) { return; }
    this.shapesToDraw.push({type: 'rect', rect: rect, colour: colour || '#f0f'});
  },
  
  update: function() {
    this.shapesToDraw = [];
    if (this.logFrameTimer > 0) {
      this.log("--- Frame start ---");
      this.logFrameTimer--;
    }
  },
  
  startTemporaryLogging: function(nFrames) {
    this.logFrameTimer = nFrames;
  },
  
  log: function() {
    if ( !this.logFrameTimer && !this.loggingEnabled ) { return; }
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift("Debug.log");
    console.log(args);
  },
  
  render: function() {
    if (Game.area) {
      _.each(this.shapesToDraw, function(shape) {
        CANVAS_CTX.strokeStyle = shape.colour;
        if (shape.type === 'rect') {
          var rect = shape.rect;
          CANVAS_CTX.strokeRect(0.5 + rect.x1 - Game.area.renderOffsetX, 0.5 + rect.y1 - Game.area.renderOffsetY, rect.x2 - rect.x1, rect.y2 - rect.y1);
        }
      });
    }
    
    Debug.statusbarPrint('FPS: ' + this.fpsCounter1.update(), 0);
    Debug.statusbarPrint(this.fpsCounter2.update(), 8);
    Debug.statusbarPrint(this.fpsCounter3.update(), 11);
    
    if (this.showStatusbar) { this.renderStatusbar(); }
  },
  
  statusbarPrint: function(text, column, colour) {
    if (!colour) { colour = '#fff'; }
    this.statusTextToDraw.push({ text: text, column: column, colour: colour });
  },
  
  renderStatusbar: function() {
    var statusbarTop = App.isMobile ? 0 : CANVAS.height - 10;
    
    CANVAS_CTX.fillStyle = '#333';
    CANVAS_CTX.fillRect(0, statusbarTop, CANVAS.width, 10);
    CANVAS_CTX.font      = 'bold 10px monospace';
    CANVAS_CTX.textAlign = 'left';
    
    _.each(this.statusTextToDraw, function(value) {
      CANVAS_CTX.fillStyle = value.colour;
      CANVAS_CTX.fillText(value.text, value.column * 6, statusbarTop + 9);
    });
    this.statusTextToDraw = [];
  },
  
  show: function() {
    $('.production-toggle').toggle();
  },
  
  setTimestep: function(key) {
    if (key === '1/30') {
      App.SIM_STEP_MIN = 1000 / 30;
      App.SIM_STEP_MAX = 1000 / 30;
    }
    else if (key === '1/60') {
      App.SIM_STEP_MIN = 1000 / 60;
      App.SIM_STEP_MAX = 1000 / 60;
    }
    else {
      App.SIM_STEP_MIN = 1000 / 60;
      App.SIM_STEP_MAX = 1000 / 30;
    }
  }
  
};

//
var FPSCounter = {
  MAX_TICKS: undefined,
  tickIndex: 0,
  tickSum:   0,
  tickList:  undefined,
  init: function(maxTicks) {
    this.MAX_TICKS = maxTicks;
    this.lastUpdate = now();
    this.tickList = _.map(_.range(this.MAX_TICKS), function(i) { return 100000; });
    this.tickSum  = this.MAX_TICKS * 100000;
  },
  update: function() {
    var thisFrameFPS = (this.now = now()) - this.lastUpdate;
    this.lastUpdate = this.now;
    
    this.tickSum -= this.tickList[this.tickIndex];
    this.tickSum += thisFrameFPS;
    this.tickList[this.tickIndex] = thisFrameFPS;
    if (++this.tickIndex === this.MAX_TICKS) {
      this.tickIndex = 0;
    }
    var fps = (1000 / (this.tickSum / this.MAX_TICKS)).toFixed(0);
    return fps;
  }
};
/*
var FPSCounter = {
  fps: 0,
  now: null,
  lastUpdate: 0,
  fpsFilter: 100, // debounce: the higher this value, the less the FPS will be affected by quick changes
  measure: function() {
    var thisFrameFPS = 1000 / ((this.now = now()) - this.lastUpdate);
    if (!isFinite(thisFrameFPS)) { return this.fps; } // no time passed, skip this check
    this.fps += (thisFrameFPS - this.fps) / this.fpsFilter;
    this.lastUpdate = this.now;
    return this.fps;
  }
};
*/

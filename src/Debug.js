var Debug = {
  
  showStatusbar: true,
  showHitboxes: false,
  clickToTeleport: false,
  
  shapesToDraw: [],
  statusTextToDraw: [],
  
  logFrameTimer: 0,
  loggingEnabled: false,
  
  init: function() {
    
    // fill area
    for (var areaId in R.areas) {
      if (areaId === 'overworld') { continue; }
      $('#areaDropdown').append('<option>'+areaId+'</option>');
    }
    
    // hook App.game.loadArea to update dropdown
    var originalLoadArea = App.game.loadArea;
    App.game.loadArea = function(exitObject) {
      $('#areaDropdown').val(exitObject.area);
      originalLoadArea.apply(App.game, Array.prototype.slice.call(arguments));
    };
    
    // clicking on the canvas teleports you to that point
    $(canvas).click(function(e) {
      if (Debug.clickToTeleport) {
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;
        var area = App.game.area;
        if (area) {
          area.playerSprite.x = x + area.renderOffsetX - 16;
          area.playerSprite.y = y + area.renderOffsetY - 32;
          area.playerSprite.vx = area.playerSprite.vy = 0;
        }
        else {
          Game.player.overworldX = Math.floor((x + Game.overworld.renderOffsetX) / 32);
          Game.player.overworldY = Math.floor((y + Game.overworld.renderOffsetY) / 32);
        }
      }
    });
    
  },
  
  teleportToArea: function(areaId) {
    App.game.loadArea({ area: areaId });
  },
  
  drawRect: function(rect, colour) {
    if (!Debug.showHitboxes) { return; }
    this.shapesToDraw.push({type: 'rect', rect: rect, colour: colour || '#f0f'});
  },
  
  update: function() {
    this.shapesToDraw = [];
    this.statusTextToDraw = [];
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
    _.each(this.shapesToDraw, function(shape) {
      ctx.strokeStyle = shape.colour;
      if (shape.type === 'rect') {
        var rect = shape.rect;
        ctx.strokeRect(0.5 + rect.x1 - Game.area.renderOffsetX, 0.5 + rect.y1 - Game.area.renderOffsetY, rect.x2 - rect.x1, rect.y2 - rect.y1);
      }
    });
    
    var fps = App.fpsRender.measure().toFixed(1);
    this.statusbarPrint('FPS: ' + fps, 0);
    
    if (this.showStatusbar) { this.renderStatusbar(); }
  },
  
  statusbarPrint: function(text, column, colour) {
    if (!colour) { colour = '#fff'; }
    this.statusTextToDraw.push({ text: text, column: column, colour: colour });
  },
  
  renderStatusbar: function() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    ctx.font      = 'bold 10px monospace';
    ctx.textAlign = 'left';
    
    _.each(this.statusTextToDraw, function(value) {
      ctx.fillStyle = value.colour;
      ctx.fillText(value.text, value.column * 6, canvas.height - 2);
    });
  },
  
  show: function() {
    $('.production-toggle').toggle();
  },
  
};

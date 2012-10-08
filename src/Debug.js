var Debug = {
  
  showHitboxes: false,
  clickToTeleport: false,
  
  shapesToDraw: [],
  
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
      originalLoadArea(exitObject);
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
  },
  
  render: function() {
    _.each(this.shapesToDraw, function(shape) {
      ctx.strokeStyle = shape.colour;
      if (shape.type === 'rect') {
        var rect = shape.rect;
        ctx.strokeRect(0.5 + rect.x1 - Game.area.renderOffsetX, 0.5 + rect.y1 - Game.area.renderOffsetY, rect.x2 - rect.x1, rect.y2 - rect.y1);
      }
    });
  },
  
  show: function() {
    $('.production-toggle').toggle();
  },
  
};

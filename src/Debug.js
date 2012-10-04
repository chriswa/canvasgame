var Debug = {
  
  showHitboxes: false,
  
  shapesToDraw: [],
  
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
    $('#debug-panel').show();
  },
  
};

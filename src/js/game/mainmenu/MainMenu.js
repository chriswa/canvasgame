var MainMenu = {
  
  selectedOptionIndex: 0,
  selectionSprite: null,
  
  init: function() {
    this.selectionSprite = Object.build(Sprite, 'octorok');
    this.selectionSprite.x = 200;
    this.selectionSprite.y = CANVAS.height / 2 + 30 - 8;
  },
  
  update: function(dt) {
    this.selectionSprite.advanceAnimation(dt);
  },
  
  render: function() {
    App.paintScreen('#000');
    this.drawText("Zeldesque",  '#fff', '80px', -80);
    this.drawText("[ Play ]",        this.selectedOptionIndex === 0 ? '#ff9' : '#9ff', '30px', 30);
    this.drawText("[ Editor ]",      this.selectedOptionIndex === 1 ? '#ff9' : '#9ff', '30px', 80);
    this.selectionSprite.render(0, 0);
  },
  
  drawText: function(text, colour, size, y) {
    var midX = CANVAS.width / 2;
    var midY = CANVAS.height / 2;
    GFX.font      = 'bold ' + size + ' sans-serif';
    GFX.fillStyle = colour;
    GFX.textAlign = 'center';
    GFX.fillText(text, midX, midY + y);
  }
};

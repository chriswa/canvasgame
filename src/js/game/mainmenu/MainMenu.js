var MainMenu = {
  
  init: function() {
    var midX = CANVAS.width / 2;
    var midY = CANVAS.height / 2;
    
    Input.setState(Input.gui);
    Input.gui.addButton("New Game", { x1: midX - 60, x2: midX + 60, y1: midY + 10, y2: midY +  50 }, function() { Game.startNewGame(); });
    Input.gui.addButton("Editor",   { x1: midX - 60, x2: midX + 60, y1: midY + 60, y2: midY + 100 }, function() { alert("Under construction!"); });
  },
  
  destroy: function() {
  },
  
  update: function(dt) {
  },
  
  render: function() {
    App.gfx.paintScreen('#000');
    this.drawText("Zeldesque", '#fff', '80px', -80);
//    this.drawText("[ Play ]",        this.selectedOptionIndex === 0 ? '#ff9' : '#9ff', '30px', 30);
//    this.drawText("[ Editor ]",      this.selectedOptionIndex === 1 ? '#ff9' : '#9ff', '30px', 80);
  },
  
  drawText: function(text, colour, size, y) {
    var midX = CANVAS.width / 2;
    var midY = CANVAS.height / 2;
    CANVAS_CTX.font      = 'bold ' + size + ' sans-serif';
    CANVAS_CTX.fillStyle = colour;
    CANVAS_CTX.textAlign = 'center';
    CANVAS_CTX.fillText(text, midX, midY + y);
  }
};

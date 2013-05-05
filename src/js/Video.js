var Video = {
  
  //
  paintScreen: function(colour) {
    CANVAS_CTX.fillStyle = colour;
    CANVAS_CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
  },
  
  // 
  drawPausedScreen: function() {
    Video.paintScreen('rgba(0, 0, 0, 0.5)')
    CANVAS_CTX.fillStyle = 'rgba(255, 255, 255, 0.5)';
    CANVAS_CTX.beginPath();
    CANVAS_CTX.moveTo(CANVAS.width * 0.40, CANVAS.height * 0.35);
    CANVAS_CTX.lineTo(CANVAS.width * 0.60, CANVAS.height * 0.50);
    CANVAS_CTX.lineTo(CANVAS.width * 0.40, CANVAS.height * 0.65);
    CANVAS_CTX.fill();
  },
  
  drawTextScreen: function(text, colour, backgroundColour) {
    colour           = colour           || '#900';
    backgroundColour = backgroundColour || '#000';
    Video.paintScreen(backgroundColour);
    CANVAS_CTX.font      = 'bold 50px sans-serif';
    CANVAS_CTX.fillStyle = colour;
    CANVAS_CTX.textAlign = 'center';
    CANVAS_CTX.fillText(text, CANVAS.width / 2, CANVAS.height / 2 + 16);
  },
  
  blitSliceByFilename: function(sliceFilename, x, y, w, h) {
    var slice = R.spriteSlicesByOriginalFilename[sliceFilename];
    var textureName = slice[4];
    if (!w) { w = slice[2]; }
    if (!h) { h = slice[3]; }
    CANVAS_CTX.drawImage(R.spriteTextures[textureName][0], slice[0], slice[1], slice[2], slice[3], x, y, w, h);
  }
  
};

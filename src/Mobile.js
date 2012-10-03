var Mobile = {
  
  isMobile: undefined,
  
  init: function(callback, force) {
    
    // mobile device support?
    this.isMobile = ('ontouchstart' in window) || force;
    if (this.isMobile) {
      
      $('#canvas').attr('width', 598).attr('height', 340).css({ border: 'none', margin: 0 }); // height=340 seems perfect
      $('#statusbar').width($('#canvas').width() - 20);
      
      var wasPressing = {};
      var lastDpadTouch = undefined;
      var buttons = {
        left:   { x:   0, y: 200, w:  50, h: 190 },
        right:  { x: 100, y: 175, w:  75, h: 215 },
        down:   { x:   0, y: 300, w: 175, h:  90 },
        up:     { x:   0, y: 175, w: 175, h:  75 },
        jump:   { x:   0, y:   0, w:   0, h:   0 },
        attack: { x:   0, y:   0, w:   0, h:   0 },
      };
      var renderAge = 0;
      var hasPressedJump   = false;
      var hasPressedAttack = false;
      window.extraRenderFunction = function() {
        renderAge++;
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillStyle   = "rgba(255, 0, 0, 1)";
        
        ctx.beginPath();
        
        //ctx.stroke();
        
        // draw dpad rectangles
        if (!lastDpadTouch) {
          //ctx.strokeRect(0.5+0, 0.5+200, 150, 299);
          //ctx.strokeRect(0.5+50, 0.5+250, 50, 50);
          var size = Math.sin(renderAge / 10) * 5 + 50;
          App.blitSliceByFilename('dpad-symbol.png', 75-size/2, 275-size/2, size, size);
        }
        
        //
        if (wasPressing.jump)   { hasPressedJump   = true; }
        if (wasPressing.attack) { hasPressedAttack = true; }
        if (!hasPressedJump) {
          var size = Math.sin(renderAge / 10) * 3 + 24;
          App.blitSliceByFilename('btn-a.png', 480-size/2, 290-size/2, size, size);
        }
        if (!hasPressedAttack) {
          var size = Math.sin(renderAge / 10) * 3 + 24;
          App.blitSliceByFilename('btn-b.png', 550-size/2, 220-size/2, size, size);
        }
        
        // draw action button separator line
        //ctx.moveTo(0.5+600, 0.5+340);
        //ctx.lineTo(0.5+600-140, 0.5+340-140);
        //ctx.closePath();
        

        // draw dpad activity feedback
        if (lastDpadTouch) {
          var dpadOffset = [0, 150]; // 50, 150
          App.blitSliceByFilename('dpad.png', dpadOffset[0], dpadOffset[1]);
          if (wasPressing.up)    { App.blitSliceByFilename('dpad-up.png',    dpadOffset[0] + 17, dpadOffset[1] +  0); }
          if (wasPressing.down)  { App.blitSliceByFilename('dpad-down.png',  dpadOffset[0] + 17, dpadOffset[1] + 32); }
          if (wasPressing.left)  { App.blitSliceByFilename('dpad-left.png',  dpadOffset[0] +  0, dpadOffset[1] + 17); }
          if (wasPressing.right) { App.blitSliceByFilename('dpad-right.png', dpadOffset[0] + 32, dpadOffset[1] + 17); }
          var x = lastDpadTouch[0] / 3 + dpadOffset[0];
          var y = lastDpadTouch[1] / 3 + dpadOffset[1];
          var danger = Math.max(Math.abs(lastDpadTouch[0] - 75), Math.abs((lastDpadTouch[1] > 100 ? lastDpadTouch[1] - 50 : lastDpadTouch[1]) - 75));
          var radius = 2;
          if (danger > 50) { radius = Math.min((danger - 50) / 25, 1) * 8 + 2; }
          ctx.moveTo(x, y);
          ctx.arc(x, y, radius, 0, Math.PI * 2, true);
          ctx.fill();
        }
        
        /*
        // draw jump button activity
        if (wasPressing.jump) {
          var x = 600;
          var y = 340;
          ctx.moveTo(x, y);
          ctx.arc(x, y, 150, 1.25 * Math.PI, Math.PI * 0.25, true);
        }
        
        // draw attack button activity
        if (wasPressing.attack) {
          var x = 600;
          var y = 340;
          ctx.moveTo(x, y);
          ctx.arc(x, y, 150, Math.PI * 0.25, 1.25 * Math.PI, true);
        }
        */
        
        
      };

      var multitoucher = function(event) {
        var isPressing = {};
        lastDpadTouch = undefined;
        for (var i = 0; i < event.touches.length; i++) {
          var touch = event.touches[i];
          var x = touch.pageX;
          var y = touch.pageY;
          
          if (y < 50 && x > 275 && x < 325) { $('#canvas').hide(); window.location.reload(); }
          
          for (var buttonName in buttons) {
            var button = buttons[buttonName];
            if (x > button.x && x < button.x + button.w && y > button.y && y < button.y + button.h) {
              isPressing[buttonName] = true;
            }
          }
          if (x > 0 && x < 175 && y > 175) { lastDpadTouch = [x - 0, y - 200]; }
          if (x > 400 && y > 140) { isPressing[ (x - 400 > y - 140) ? 'attack' : 'jump' ] = true; }
          
          //ctx.arc(touch.pageX, touch.pageY, 20, 0, 2*Math.PI, true);
          //ctx.fill();
          //ctx.stroke();
        }
        for (var buttonName in buttons) {
          var button = buttons[buttonName];
          if (isPressing[buttonName] && !wasPressing[buttonName]) { Input.touchDown( buttonName ); }
          if (!isPressing[buttonName] && wasPressing[buttonName]) { Input.touchUp( buttonName ); }
        }
        wasPressing = isPressing;
      }
      document.addEventListener('touchmove', multitoucher);
      document.addEventListener('touchstart', multitoucher);
      document.addEventListener('touchend', multitoucher);
      
      /*$('.touch').on('touchstart', function(event) {
        event.preventDefault();
        var keyCode = $(this).data('keycode');
        Input.touchDown(keyCode);
        return false;
      });
      $('.touch').on('touchend', function(event) {
        event.preventDefault();
        var keyCode = $(this).data('keycode');
        Input.touchUp(keyCode);
        return false;
      });*/
      
      $('.mobile-toggle').toggle();
    }
    
    callback();
  }
};

var Mobile = {
  
  isMobile: undefined,
  
  render: function() {},
  
  init: function(callback, force) {
    
    // mobile device support?
    this.isMobile = ('ontouchstart' in window) || force;
    if (this.isMobile) {
      
      // galaxy nexus is 598 x 360 (?)
      $('#canvas').attr('width', 598).attr('height', 360).css({ border: 'none', margin: 0 });
      // iphone 4 is 320 x 460
      //$('#canvas').attr('width', 480).attr('height', 300).css({ border: 'none', margin: 0 });
      
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
      this.render = function() {
        renderAge++;
        
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#fff';
        
        // draw dpad
        // up
        ctx.fillStyle = wasPressing.up ? '#fff' : '#000';
        ctx.beginPath(); ctx.moveTo(75+0.5, 275+0.5); ctx.lineTo(50+0.5, 250+0.5); ctx.lineTo(50+0.5, 200+0.5); ctx.lineTo(100+0.5, 200+0.5); ctx.lineTo(100+0.5, 250+0.5); ctx.lineTo(75+0.5, 275+0.5); ctx.fill(); ctx.stroke();
        // down
        ctx.fillStyle = wasPressing.down ? '#fff' : '#000';
        ctx.beginPath(); ctx.moveTo(75+0.5, 275+0.5); ctx.lineTo(50+0.5, 300+0.5); ctx.lineTo(50+0.5, 350+0.5); ctx.lineTo(100+0.5, 350+0.5); ctx.lineTo(100+0.5, 300+0.5); ctx.lineTo(75+0.5, 275+0.5); ctx.fill(); ctx.stroke();
        // left
        ctx.fillStyle = wasPressing.left ? '#fff' : '#000';
        ctx.beginPath(); ctx.moveTo(75+0.5, 275+0.5); ctx.lineTo(50+0.5, 250+0.5); ctx.lineTo(0+0.5, 250+0.5); ctx.lineTo(0+0.5, 300+0.5); ctx.lineTo(50+0.5, 300+0.5); ctx.lineTo(75+0.5, 275+0.5); ctx.fill(); ctx.stroke();
        // right
        ctx.fillStyle = wasPressing.right ? '#fff' : '#000';
        ctx.beginPath(); ctx.moveTo(75+0.5, 275+0.5); ctx.lineTo(100+0.5, 250+0.5); ctx.lineTo(150+0.5, 250+0.5); ctx.lineTo(150+0.5, 300+0.5); ctx.lineTo(100+0.5, 300+0.5); ctx.lineTo(75+0.5, 275+0.5); ctx.fill(); ctx.stroke();
        
        // draw attack/jump buttons
        // attack
        ctx.fillStyle = wasPressing.attack ? '#fff' : '#000';
        ctx.beginPath(); ctx.arc(550, 240, 40, 0, Math.PI*2, true); ctx.fill(); ctx.stroke();
        // jump
        ctx.fillStyle = wasPressing.jump ? '#fff' : '#000';
        ctx.beginPath(); ctx.arc(480, 310, 40, 0, Math.PI*2, true); ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.font      = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("attack", 550, 240 + 3);
        ctx.fillText("jump", 480, 310 + 3);
        
        ctx.globalAlpha = 1;
        
      };

      var refreshButtonTimeout = null;
      var multitoucher = function(event) {
        var isPressing = {};
        lastDpadTouch = undefined;
        var isHoldingReset = false;
        for (var i = 0; i < event.touches.length; i++) {
          var touch = event.touches[i];
          var x = touch.pageX;
          var y = touch.pageY;
          
          if (y < 50 && x < 50) {
            Debug.showStatusbar = !Debug.showStatusbar;
          }
          
          if (y < 50 && x > 275 && x < 325) {
            isHoldingReset = true;
            if (!refreshButtonTimeout) {
              refreshButtonTimeout = setTimeout(function() {
                App.pause();
                App.drawTextScreen("Refresh!", "#000", "#f0f");
                setTimeout(function() { window.location.reload(); }, 0);
              }, 750);
            }
          }
          
          for (var buttonName in buttons) {
            var button = buttons[buttonName];
            if (x > button.x && x < button.x + button.w && y > button.y && y < button.y + button.h) {
              isPressing[buttonName] = true;
            }
          }
          if (x > 0 && x < 175 && y > 175) { lastDpadTouch = [x - 0, y - 200]; }
          if (x > 400 && y > 140) { isPressing[ (x - 400 > y - 140) ? 'attack' : 'jump' ] = true; }
          
        }
        for (var buttonName in buttons) {
          var button = buttons[buttonName];
          if (isPressing[buttonName] && !wasPressing[buttonName]) { Input.touchDown( buttonName ); }
          if (!isPressing[buttonName] && wasPressing[buttonName]) { Input.touchUp( buttonName ); }
        }
        wasPressing = isPressing;
        if (!isHoldingReset && refreshButtonTimeout) {
          clearTimeout(refreshButtonTimeout);
          refreshButtonTimeout = null;
        }
      }
      document.addEventListener('touchmove', multitoucher);
      document.addEventListener('touchstart', multitoucher);
      document.addEventListener('touchend', multitoucher);
      
    }
    
    callback();
  }
};

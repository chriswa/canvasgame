<?php
  /*
    
    http://localhost/dropbox/canvasgame/index.php
    http://dl.dropbox.com/u/29873255/canvasgame/index.html
    http://dl.dropbox.com/u/29873255/aolbackup/index.html
    http://jsfiddle.net/XxnuD/3/
  
    reference URLs for tiled:
      https://github.com/bjorn/tiled/wiki/Automapping
      https://github.com/bjorn/tiled/wiki/Keyboard-Shortcuts
    
    httpd.conf code:
      Alias /dropbox "C:/Users/Chris/Dropbox/Public/"
      <Directory "C:/Users/Chris/Dropbox/Public/">
        Options Indexes FollowSymLinks
        AllowOverride all
        Order allow,deny
        Allow from all
      </Directory>
    
    TODO:
      - sfx
        - hitting an enemy which is already "hurt" and will ignore the hit shouldn't cause a sword_hit noise
        - multiple samples need to be available for some sfx (e.g. sword, sword_hit, enemydeath, deflect)
        - sword_hit doesn't need to play if enemydeath plays
      - Sprite coord improvements: maybe x,y should be the centre and all my animation slice offsets should be moved. sprite hitboxes could have width, height, left, right, top, bottom methods
        - Sprite.drawOffsetX, Sprite.drawOffsetY
        - all Sprite-derived classes should be changed to have a hitbox that centres on (0,0) [or the origin should be at (middle, feet)?] and use drawOffsets!
      - getting hit from the back should push you forward, not backward
      - fix keys (tie them to dungeons with a uniqueId on the entrance area?)
      - elevators!
      - audio on android? (or at least don't waste time downloading the samples)
      - make it work in ie?
    ONGOING:
      - add a couple more enemies (especially bigger enemies -- more satisfying to kill!)
      
  */
  
  // build R.*.js
  $startTime = time();
  require_once "build/index.php";
  $buildTime = time() - $startTime;
  
  //
  function recurseDir($initialDir, $filePattern) {
    if (!$filePattern) { $filePattern = '//'; }
    $results = array();
    $queue = array('src');
    while ($queue) {
      $file = array_shift($queue);
      if ($file === '.' || $file === '..') { continue; }
      if (is_dir($file)) {
        $queue = array_merge($queue, glob("$file/*"));
      }
      else {
        if (preg_match($filePattern, $file)) {
          array_push($results, $file);
        }
      }
    }
    return $results;
  }
  
  // capture page to be cached into index.html for publicly-accessible URL (i.e. http://dl.dropbox.com/u/29873255/canvasgame/index.html)
  ob_start();
  
?>
<!--DOCTYPE html-->
<html>
<head>

<title>canvasgame</title>
<link rel="Shortcut Icon" href="index.ico" />
<link rel="stylesheet" href="index.css" type="text/css" media="all" />

</head>
<body>

<!-- STATIC LOADING BOX -->
<table id="static-loading" width="100%" height="100%">
  <tr><td valign="middle" align="center" style="font: bold 50px sans-serif;">Loading...</td></tr>
</table>

<!-- DEBUG PANEL -->
<div class="development-toggle" style="float: left;"><a href="#" onclick="$('.production-toggle').toggle(); $('.development-toggle').toggle(); return false;" style="position: absolute; color: #eee; font: 10px bold monospace; padding: 5px;">X</a></div>
<div id="debug-panel" class="development-toggle mobile-off" style="background-color: #fff; padding: 10px; border: 1px solid #ddd; margin: 10px; position: absolute; text-align: left; display: none; width: 260px;">
  
  <div style="float: right;"><a href="#" onclick="$('.production-toggle').toggle(); $('.development-toggle').toggle(); return false;" style="color: #ccc; font: 10px bold monospace; padding: 5px; margin-right: -6px;">X</a></div>
  
  <button onclick="Game.reset();">Reset Game</button>
  <br/>
  
  <select id="areaDropdown"></select>
  <button id="leaveToOverworld" onclick="Game.setState('overworld');" disabled="disabled">Leave</button>
  <br/>
  
  <label><input type="checkbox" onclick="Debug.clickToTeleport = $(this).is(':checked');"> Click to teleport</label>
  <button onclick="Game.player.health = Game.player.healthMax;">Heal</button>
  <button id="godmode" onclick="Game.area.playerSprite.invincibleTimer = Infinity; $(this).attr('disabled', true)" disabled="disabled">Godmode</button>
  <br/>
  
  Speed: <input id="simSpeed" value="1.00000" onchange="var s = parseFloat($(this).val()); if (s > 0) { App.SIM_SPEED = s; }" onkeydown="$(this).change();" size="8">
  <button onclick="$('#simSpeed').val(($('#simSpeed').val() * 2).toFixed(5)).change();">+</button>
  <button onclick="$('#simSpeed').val(($('#simSpeed').val() / 2).toFixed(5)).change();">-</button><br/>
  
  Time Step: <select onchange="Debug.setTimestep($(this).val());">
    <option>variable</option>
    <option>1/30</option>
    <option>1/60</option>
  </select><br/>
  
  Timing: <select onchange="Debug.updateLoop = $(this).val();">
    <option>setTimeout(0)</option>
    <option>requestAnimationFrame</option>
    <option>aggressive</option>
  </select><br/>
  
  <label><input type="checkbox" onclick="Debug.showHitboxes = $(this).is(':checked');"> Show hitboxes</label><br/>
  
</div>

<!-- CANVAS -->
<canvas id="canvas" width="640" height="480" class="default-on" style="display: none;">
  <div id="nocanvas">
    This page uses the <a href="http://en.wikipedia.org/wiki/Canvas_element">HTML5 Canvas Element</a>,
    which is supported by virtually all modern web browsers and the newest Internet Explorer.
    Please upgrade your browser and reload this page.
  </div>
</canvas>

<!-- INSTRUCTIONS -->
<div class="default-on mobile-off" style="display: none;">

  <table style="margin: auto; margin-top: 10px;" id="controls">
    <tr><th><span>Move &amp; Crouch</span></th><td><span>arrow keys</span></td></tr>
    <tr><th><span>Jump</span></th><td><span>spacebar <i>or</i> shift <i>or</i> Z</span></td></tr>
    <tr><th><span>Attack</span></th><td><span>ctrl <i>or</i> X</span></td></tr>
  </table>
  
  <div class="production-toggle" style="background-color: #ddd; padding: 10px; border: 1px solid #999; display: inline-block; margin-top: 10px;">
    <strong>THIS IS THE DEVELOPMENT VERSION!</strong><br/>If things are broken, <a href="http://dl.dropbox.com/u/29873255/aolbackup/index.html">try the latest stable version</a>
  </div>
  
</div>

<script>
  var BUILD_TIME_ELAPSED = <?php echo $buildTime ?>;
  var BUILD_DATE = <?php echo time() ?>;
</script>

<!-- INCLUDE SCRIPTS -->
<?php /* not even sure if this IE-specific canvas shim is useful... */ ?>
<!--[if lt IE 9]>
  <script src="lib/excanvas.compiled.js"></script>
<![endif]-->
<?php foreach (glob('lib/*.js') as $jsFile): ?>
  <?php if ($jsFile == 'lib/excanvas.compiled.js') { continue; } ?>
  <script src="<?php echo $jsFile ?>"></script>
<?php endforeach ?>
<?php
  // include all src/*.js files
  $jsFiles = array_unique(array_merge(
    
    // load files which define base classes first!
    array(
      'src/util.js',
      'src/R.js',
      'src/game/Sprite.js',
      'src/game/area/PhysicsSprite.js',
      'src/game/area/Enemy.js',
    ),
    
    // now load all other .js files
    recurseDir('src', '/\.js$/')
  ));
?>
<?php foreach ($jsFiles as $jsFile): ?>
  <script src="<?php echo $jsFile ?>"></script>
<?php endforeach ?>

</body>
</html>

<?php
  $html = ob_get_clean();
  file_put_contents('index.html', $html);
  echo $html;
?>
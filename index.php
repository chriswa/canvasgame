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
      
      - consider dropping or improving SpriteGroup
      - elevators!
      
  */
  
  // build R.*.js
  $startTime = time();
  require_once "build/index.php";
  $buildTime = time() - $startTime;
  
  //
  function recurseDir($initialDir) {
    $results = array();
    $queue = array('src');
    while ($queue) {
      $file = array_shift($queue);
      if ($file === '.' || $file === '..') { continue; }
      if (is_dir($file)) { $queue = array_merge($queue, glob("$file/*")); }
      else { array_push($results, $file); }
    }
    return $results;
  }
  
  // capture page to be cached into index.html for publicly-accessible URL (i.e. http://dl.dropbox.com/u/29873255/canvasgame/index.html)
  ob_start();
  
?>
<link rel="Shortcut Icon" href="index.ico" />
<link rel="stylesheet" href="index.css" type="text/css" media="all" />

<!-- INCLUDE SCRIPTS -->
<?php /* not even sure if this IE-specific canvas shim is useful... */ ?>
<!--[if lt IE 9]>
  <script src="excanvas.compiled.js"></script>
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
    recurseDir('src')
  ));
?>
<?php foreach ($jsFiles as $jsFile): ?>
  <script src="<?php echo $jsFile ?>"></script>
<?php endforeach ?>

<!-- INIT CODE -->
<script>
  
  console.log("Build took: " + (<?php echo $buildTime ?>).toFixed(1) + "ms");
  
  var forceMobile = true;
  
  var isProduction = (window.location.href === "http://dl.dropbox.com/u/29873255/aolbackup/index.html");
  
  // init App
  App.BUILD_TIME = <?php echo time() ?>;
  window.onload = function() {
    Mobile.init(function() {
      App.init();
      
      if (isProduction) {
        Debug.showStatusbar = false;
        $('.production-toggle').toggle();
        if (Mobile.isMobile) { $('.production-toggle.mobile-toggle').toggle(); }
      }
      
    }, forceMobile);
  };
  
</script>

<!-- DEBUG PANEL -->
<div id="debug-panel" class="mobile-toggle production-toggle" style="background-color: #fff; padding: 10px; border: 1px solid #ddd; margin: 10px; position: absolute; text-align: left;">
  
  <div style="float: right;"><a href="#" onclick="$('.production-toggle').toggle(); return false;" style="color: #ccc; font: 10px bold monospace; padding: 5px; margin-right: -6px;">X</a></div>
  
  <button onclick="Game.reset();">Reset Game</button>
  Area: <select id="areaDropdown" onchange="Debug.teleportToArea($(this).val());"></select>
  <br/>
  
  <label><input type="checkbox" onclick="Debug.clickToTeleport = $(this).is(':checked');"> Click to teleport</label><br/>
  
  Simulation Speed: <input id="simSpeed" value="1.0000000000" onchange="var s = parseFloat($(this).val()); if (s > 0) { App.SIM_SPEED = s; }" onkeydown="$(this).change();">
  <button onclick="$('#simSpeed').val(($('#simSpeed').val() * 2).toFixed(10)).change();">+</button>
  <button onclick="$('#simSpeed').val(($('#simSpeed').val() / 2).toFixed(10)).change();">-</button><br/>
  
  Time Step: <select onchange="Debug.timestep = $(this).val();">
    <option>variable</option>
    <option>1/30</option>
    <option>1/60</option>
  </select><br/>
  
  Render Strategy: <select onchange="Debug.updateLoop = $(this).val();">
    <option>setTimeout</option>
    <option>requestAnimationFrame</option>
    <option>aggressive</option>
  </select><br/>
  
  <label><input type="checkbox" onclick="Debug.showHitboxes = $(this).is(':checked');"> Show hitboxes</label><br/>
  
</div>

<!-- CANVAS -->
<canvas id="canvas" width="640" height="480">
  <div id="nocanvas">
    This page uses the <a href="http://en.wikipedia.org/wiki/Canvas_element">HTML5 Canvas Element</a>,
    which is supported by virtually all modern web browsers and the newest Internet Explorer.
    Please upgrade your browser and reload this page.
  </div>
</canvas>

<!-- INSTRUCTIONS -->
<div class="mobile-toggle">

  <table style="margin: auto; margin-top: 10px;" id="controls">
    <!--
    <tr><th>Move</th>  <td>&lt;left&gt; and &lt;right&gt;</td></tr>
    <tr><th>Crouch</th><td>&lt;down&gt;</td></tr>
    <tr><th>Jump</th>  <td>&lt;shift&gt; or &lt;Z&gt;</td></tr>
    <tr><th>Attack</th><td>&lt;ctrl&gt;  or &lt;X&gt;</td></tr>
    -->
    <tr><th><span>Move &amp; Crouch</span></th><td><span>arrow keys</span></td></tr>
    <tr><th><span>Jump</span></th><td><span>spacebar <i>or</i> shift <i>or</i> Z</span></td></tr>
    <tr><th><span>Attack</span></th><td><span>ctrl <i>or</i> X</span></td></tr>
  </table>
  
  <div class="production-toggle" style="background-color: #ddd; padding: 10px; border: 1px solid #999; display: inline-block; margin-top: 10px;">
    <strong style="color: red;">THIS IS THE DEVELOPMENT VERSION!</strong><br/>If things are broken, <a href="http://dl.dropbox.com/u/29873255/aolbackup/index.html">try the latest stable version</a>
  </div>
  
</div>

<?php
  $html = ob_get_clean();
  file_put_contents('index.html', $html);
  echo $html;
?>
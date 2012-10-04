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
      - "particle" effects (enemy killed, projectile destroyed) these are simply sprites, (maybe with no animation code?)
      - elevators!
      
  */
  
  
  // build R.js
  require_once "build_resources.php";
  
  // capture page to be cached into index.html for publicly-accessible URL (i.e. http://dl.dropbox.com/u/29873255/canvasgame/index.html)
  ob_start();
  
?>
<style>

  BODY { background-color: #eeeeee; text-align: center; margin: 0px; }
  #canvas {
    background-color: #fff;
    margin-top: 10px;
    border: 10px solid black;
    image-rendering: optimizeSpeed;
    image-rendering:-o-crisp-edges;
    image-rendering:-webkit-optimize-contrast;
    -ms-interpolation-mode: nearest-neighbor;
  }
  #controls TH {
    text-align: left;
    padding-right: 30px;
  }
  #controls TD {
    text-align: center;
  }
</style>

<?php /* not even sure if this is useful... */ ?>
<!--[if lt IE 9]>
  <script src="excanvas.compiled.js"></script>
<![endif]-->
<?php foreach (glob('lib/*.js') as $jsFile): ?>
  <?php if ($jsFile == 'lib/excanvas.compiled.js') { continue; } ?>
  <script src="<?php echo $jsFile ?>"></script>
<?php endforeach ?>

<?php
  $jsFiles = array_unique(array_merge(
    
    // load files which define base classes first!
    array(
      'src/util.js',
      'src/R.js',
      'src/Sprite.js',
      'src/PhysicsSprite.js',
      'src/Enemy.js',
    ),
    
    // now load all other .js files
    glob('src/*.js'),
    glob('src/enemies/*.js')
  ));
?>
<?php foreach ($jsFiles as $jsFile): ?>
  <script src="<?php echo $jsFile ?>"></script>
<?php endforeach ?>

<script>
  
  var forceMobile = false;
  
  if (window.location.href === "http://dl.dropbox.com/u/29873255/aolbackup/index.html") { $(function() { $('.production-toggle').toggle(); }); }
  
  window.onload = function() {
    Mobile.init(function() {
      App.init( Game );
    }, forceMobile);
  };
  
</script>

<div id="debug-panel" class="mobile-toggle production-toggle" style="background-color: #fff; padding: 10px; border: 1px solid #ddd; margin: 10px; position: absolute; text-align: left;">
  <button onclick="Game.reset();">Reset Game</button><br/>
  
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

<canvas id="canvas" width="640" height="480">
  <div id="nocanvas">
    This page uses the <a href="http://en.wikipedia.org/wiki/Canvas_element">HTML5 Canvas Element</a>,
    which is supported by virtually all modern web browsers and the newest Internet Explorer.
    Please upgrade your browser and reload this page.
  </div>
</canvas>

<div id="statusbar production-toggle" style="width: 640px; margin: auto; text-align: left; background-color: #999; color: white; height: 20px; padding: 0 10px 0px;">
  <div id="running" style="float: left; width: 160px;">
    <span style="width: 80px;">
      <span id="fps-render">??</span> FPS
    </span>
    <span style="width: 80px;">
      <span id="skipped">??</span>
    </span>
  </div>
  <div style="float: left; width: 90px;">x: <span id="playerX"></span></div>
  <div style="float: left; width: 90px;">y: <span id="playerY"></span></div>
  <div style="float: left; width: 90px;">vx: <span id="playerVX"></span></div>
  <div style="float: left; width: 90px;">vy: <span id="playerVY"></span></div>
</div>

<div style="clear: both;"></div>

<div class="mobile-toggle">

<table style="margin: auto; margin-top: 5px;" id="controls">
  <!--
  <tr><th>Move</th>  <td>&lt;left&gt; and &lt;right&gt;</td></tr>
  <tr><th>Crouch</th><td>&lt;down&gt;</td></tr>
  <tr><th>Jump</th>  <td>&lt;shift&gt; or &lt;Z&gt;</td></tr>
  <tr><th>Attack</th><td>&lt;ctrl&gt;  or &lt;X&gt;</td></tr>
  -->
  <tr><th>Arrow keys</th> <td>move and crouch</td></tr>
  <tr><th>Spacebar</th>   <td>jump</td></tr>
  <tr><th>Ctrl</th>       <td>attack</td></tr>
</table>

<p class="production-toggle">
  <strong style="color: red;">THIS IS THE DEVELOPMENT VERSION!</strong><br/>If things are broken, <a href="http://dl.dropbox.com/u/29873255/aolbackup/index.html">try the latest stable version</a>
</p>
<p class="production-toggle" style="display: none;">
  This is the latest stable version.<br/>If you're feeling adventurous,<br/><a href="http://dl.dropbox.com/u/29873255/canvasgame/index.html">try the development version</a>
</p>

</div>

<?php
  $html = ob_get_clean();
  file_put_contents('index.html', $html);
  echo $html;
?>
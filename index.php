<?php
  
  // ================================================================================================================
  // index.php runs the make/ process and then displays the game, which is composed of src/web/index.html
  // with <script src> tags appended for all the js files in src/js/ (in dependancy-respecting order)
  // ----------------------------------------------------------------------------------------------------------------
  // it also generates ./index.html, so that the game can be run from a web server without php support (e.g. dropbox)
  // ----------------------------------------------------------------------------------------------------------------
  // the make process builds the maps in src/maps/ and the sprite data generated by tools/sprites/
  // ================================================================================================================
  
  
  // build R.*.js
  $startTime = time();
  require_once "make/index.php";
  $buildTime = time() - $startTime;
  
  //
  function recurseDir($initialDir, $filePattern) {
    if (!$filePattern) { $filePattern = '//'; }
    $results = array();
    $queue = array($initialDir);
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
  
  include "src/web/index.html";
  
?>

<script>
  var BUILD_TIME_ELAPSED = <?php echo $buildTime ?>;
  var BUILD_DATE = <?php echo time() ?>;
</script>

<!-- INCLUDE SCRIPTS -->
<?php /* not even sure if this IE-specific canvas shim is useful... */ ?>
<!--[if lt IE 9]>
  <script src="src/web/excanvas.compiled.js"></script>
<![endif]-->
<?php foreach (glob('src/web/*.js') as $jsFile): ?>
  <?php if ($jsFile == 'src/web/excanvas.compiled.js') { continue; } ?>
  <script src="<?php echo $jsFile ?>"></script>
<?php endforeach ?>
<?php
  // include all src/js/*.js files
  $jsFiles = array_unique(array_merge(
    
    // load files which define base classes first!
    array(
      'src/js/util.js',
      'src/js/R.js',
      'src/js/game/Sprite.js',
      'src/js/game/area/PhysicsSprite.js',
      'src/js/game/area/Enemy.js',
    ),
    
    // now load all other src/js/*/*.js files
    recurseDir('src/js', '/\.js$/'),
    
    // and finally, built/js/*.js files
    recurseDir('built/js', '/\.js$/')
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
<script src="lib/jquery.min.js"></script>
<style>
a, a:visited { color: blue; text-decoration: none; }
</style>
<?php
  
  $INCLUDE = array(
    'src/App.js',
    'src/ResourceManager.js',
    'src/Game.js',
    'src/Input.js',
    'src/Mobile.js',
    'src/Debug.js',
    'src/HUD.js',
    'src/Area.js',
    'src/Player.js',
    'src/SpriteGroup.js',
    'src/Sprite.js',
    'src/PhysicsSprite.js',
    'src/PlayerSprite.js',
    'src/Enemy.js',
  );
  
  $IGNORE = array(
    'src/util.js',
    'src/R.js'
  );
  
  $jsFiles = array_unique(array_merge(
    $INCLUDE,
    glob('src/*.js'),
    glob('src/enemies/*.js')
  ));
  
  $jsFiles = array_diff($jsFiles, $IGNORE);
  
  foreach ($jsFiles as $jsFilename) {
    
    // skip?
    if (preg_match('#^src/R\..*\.js$#', $jsFilename)) { continue; }
    
    $jsLines = file($jsFilename);
    $currentClassName = '???';
    foreach ($jsLines as $lineIndex => $line) {
      if (preg_match('/^var ([A-Z]\w*)\s*=.*{\s*$/', $line, $matches)) {
        if ($currentClassName !== '???') { echo "</div></div>\n"; }
        $currentClassName = $matches[1];
        ?>
          <div>
          <strong><a href="#" onclick="$(this).closest('div').find('.methods').toggle(); return false;"><?php echo $currentClassName ?></a></strong>
          <div class="methods" style="display: none; padding: 2px 10px; margin-bottom: 5px; background-color: #eee">
        <?php
      }
      elseif (preg_match('/^\s*(\w+):\s*function(\([^)]*\))\s*{\s*$/', $line, $matches)) {
        ?>
          <a target="_blank" href="ace.php?file=<?php echo $jsFilename ?>&line=<?php echo $lineIndex + 1 ?>"><?php echo $currentClassName . '.' . $matches[1] ?></a><?php echo $matches[2] ?><br/>
        <?php
      }
      elseif (preg_match('/^\s*function\s+(\w+)(\([^)]*\))\s*{\s*$/', $line, $matches)) {
        ?>
          <a target="_blank" href="ace.php?file="><?php echo $matches[1] ?></a><?php echo $matches[2] ?><br/>
        <?php
      }
    }
    if ($currentClassName !== '???') { echo "</div></div>\n"; }
    
  }

?>

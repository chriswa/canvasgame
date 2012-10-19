<?php

require_once "jsmin.php";

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

chdir('..');

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

header("Content-type: text/plain");

$js = '';
foreach ($jsFiles as $jsFile) {
  $js .= file_get_contents($jsFile) . "\n";
}

$js = JSMin::minify($js);

file_put_contents('tools/all.js', $js);
echo $js;

?>

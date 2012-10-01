<?php
  $jsFiles = array_unique(array_merge(
    
    // load files which define base classes first!
    array(
      'src/util.js',
      'src/Sprite.js',
      'src/PhysicsSprite.js',
      'src/Enemy.js',
    ),
    
    glob('src/*.js'),
    glob('src/enemies/*.js')
  ));
  
  foreach ($jsFiles as $jsFile) {
    echo "\n\n";
    echo "// **********************************************************\n";
    echo "// * $jsFile\n";
    echo "// **********************************************************\n";
    echo "\n";
    echo file_get_contents($jsFile);
  }
?>
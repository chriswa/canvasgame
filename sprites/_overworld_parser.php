<?php
  
  $colourToTile = array(
    0        => 16, // 0,0,0
    9975297  => 5, // 152,54,1
    33023    => 1, // 0,128,255
    16711680 => 12, // 255,0,0
    11665663 => 13, // 178,0,255
    14465795 => 15, // 220,187,3
    16504324 => 2, // 251,214,4
    16251351 => 6, // 247,249,215
    32896    => 7, // 0,128,128
    32768    => 4, // 0,128,0
    16734217 => 8, // 255,88,9
    7595520  => 3, // 115,230,0
  );
  
  $src = imagecreatefrompng("c:\\users\\chris\\desktop\\overworld.png");
  $width  = imagesx($src);
  $height = imagesy($src);
  
  echo "height = $height<br/>";
  echo "width  = $width<br/>";
  echo "data:<br/>";
  
  foreach (range(0, $height - 1) as $y) {
    foreach (range(0, $width - 1) as $x) {
      $rgb = imagecolorat($src, $x, $y);
      //$colours = imagecolorsforindex($src, $rgb);
      //$colourId = $colours['red'] . ',' . $colours['green'] . ',' . $colours['blue'];
      echo ', ';
      echo $colourToTile[$rgb];
    }
  }
  
  
?>

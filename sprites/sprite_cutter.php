<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
<script>
$(function() {
  $('img').click(function() {
    var text = $('#indexes').text();
    if (text.length) { text += ', '; }
    $('#indexes').text(text + $(this).data('index'));
  });
});
</script>
<?php
  foreach (glob('cutter_input/*.png') as $filename) {
    
    list($filelabel, $fileext) = explode('.', $filename);
    $filelabel = basename($filelabel);
    $dir = "cutter_output_$filelabel";
    @mkdir($dir);
    
    echo "<h1>Cutting Sprites</h1><h3>$filename &#x2192; $dir/*.png</h3>\n";
    
    $src = imagecreatefrompng($filename);
    $width  = imagesx($src);
    $height = imagesy($src);
    
    $im = imagecreatetruecolor($width, $height);
    imagesavealpha($im, true);
    $im_trans = imagecolorallocatealpha($im, 0, 0, 0, 127);
    imagefill($im, 0, 0, $im_trans);
    imagecopy($im, $src, 0, 0, 0, 0, $width, $height);
    imagealphablending($im, false); // for painting alpha over top of things!
  
    $imageIndex = 0;
    
    foreach (range(0, $height - 1) as $y) {
      foreach (range(0, $width - 1) as $x) {
        if (isPixel($x, $y)) {
          //echo "Finding a sprite, starting at $x, $y\n";
          list($x1, $y1, $w, $h) = findSprite($x, $y);
          
          // copy rectangle to new image
          $dest = imagecreatetruecolor($w, $h);
          imagesavealpha($dest, true);
          $background_trans = imagecolorallocatealpha($dest, 0, 0, 0, 127);
          imagefill($dest, 0, 0, $background_trans);
          imagecopy($dest, $im, 0, 0, $x1, $y1, $w, $h);
          $destFilepath = "$dir/" . $imageIndex . ".png";
          imagepng($dest, $destFilepath);
          
          imagefilledrectangle($im, $x1, $y1, $x1+$w-1, $y1+$h-1, $im_trans);
          
          echo "<img src='$destFilepath' style='margin: 5px; border: 1px dotted #ccc;' data-index='$imageIndex'>";
          //echo "[ 0, 0, $x1, $y1, $w, $h ], // $imageIndex<br/>\n";
          
          $imageIndex++;
        }
      }
    }
    
    echo "<h3>Created $imageIndex images.</h3>";
  }
  
  
  
  function isPixel($x, $y) {
    global $im;
    $rgb = imagecolorat($im, $x, $y);
    $colors = imagecolorsforindex($im, $rgb);
    return ($colors['alpha'] !== 127);
  }
  
  function findSprite($x, $y) {
    global $im;
    $x1 = $x;
    $y1 = $y;
    $x2 = $x;
    $y2 = $y;
    $isDone = false;
    while (!$isDone) {
      $isDone = true;
      if (containsPixel($x1, $y1 - 1, $x2, $y1 - 1)) { $y1--; $isDone = false; }
      if (containsPixel($x1, $y2 + 1, $x2, $y2 + 1)) { $y2++; $isDone = false; }
      if (containsPixel($x1 - 1, $y1, $x1 - 1, $y2)) { $x1--; $isDone = false; }
      if (containsPixel($x2 + 1, $y1, $x2 + 1, $y2)) { $x2++; $isDone = false; }
    }
    return array($x1, $y1, $x2 - $x1 + 1, $y2 - $y1 + 1);
  }
  
  function containsPixel($x1, $y1, $x2, $y2) {
    global $im, $width, $height;
    foreach (range($y1, $y2) as $y) {
      foreach (range($x1, $x2) as $x) {
        if ($x < 0 || $x >= $width || $y < 0 || $y >= $height) { continue; }
        if (isPixel($x, $y)) { return true; }
      }
    }
    return false;
  }
  
?>
<div id="indexes" onclick="$(this).text('');"></div>
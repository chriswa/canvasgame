<?php

require_once "init.php";

$textureName = array_pop($PATH);

$texture = &$DATA['textures'][$textureName];

if (@$_REQUEST['pack']) {
  $algorithm = @$_REQUEST['pack'];
  @list($slicesPacked, $width, $height, $filled) = packTexture($textureName, $algorithm);
  if ($slicesPacked) {
    $alerts = "<p style='color: green;'>SUCCESS: $algorithm filled $filled% packing $slicesPacked slices";
  }
  else {
    $alerts = "<p style='color: red;'>FAIL: $algorithm";
  }
  
  if ($slicesPacked) {
    
    $sourceImage = imagecreatefrompng("../../built/spritesheets/$textureName.png");
    
    imagepng(flip_image_horizontally($sourceImage), "../../built/spritesheets/$textureName-x.png");
    
    $pinkImage = colourize_image($sourceImage, 'pink');
    imagepng($pinkImage, "../../built/spritesheets/$textureName-pink.png");
    imagepng(flip_image_horizontally($pinkImage), "../../built/spritesheets/$textureName-pink-x.png");
    
    $cyanImage = colourize_image($sourceImage, 'cyan');
    imagepng($cyanImage, "../../built/spritesheets/$textureName-cyan.png");
    imagepng(flip_image_horizontally($cyanImage), "../../built/spritesheets/$textureName-cyan-x.png");
    
    $wackyImage = colourize_image($sourceImage, 'wacky');
    imagepng($wackyImage, "../../built/spritesheets/$textureName-wacky.png");
    imagepng(flip_image_horizontally($wackyImage), "../../built/spritesheets/$textureName-wacky-x.png");
    
  }
}
else {
  $alerts = '<p>Select an algorithm...</p>';
}

function pink($r, $g, $b, $a) {
  $r2 = 255 - $b;
  $g2 = 255 - $r;
  $b2 = 255 - $g;
  return array($r2, $g2, $b2, $a);
}
function cyan($r, $g, $b, $a) {
  $r2 = $g;
  $g2 = $b;
  $b2 = $r;
  return array($r2, $g2, $b2, $a);
}
function wacky($r, $g, $b, $a) {
  $r2 = $b;
  $g2 = $r;
  $b2 = $g;
  return array($r2, $g2, $b2, $a);
}

?>

<?php showHeader(); ?>

<p>
  <a href="../..">home</a>
  &mdash; <strong><a href=".">pack(<?php echo $textureName ?>)</a></strong>
</p>

<h2>Pack Texture</h2>

<div id="alerts">
  <?php echo @$alerts; ?>
</div>

<p>
  <strong>Algorithm:</strong>
  <a href="?pack=height">height</a>
  | <a href="?pack=width">width</a>
  | <a href="?pack=maxside">maxside</a>
  | <a href="?pack=random">random</a>
</p>

<?php foreach (array('', '-pink', '-cyan', '-wacky') as $suffix): ?>
  <a href="<?php echo "$BASEURL/../../built/spritesheets/$textureName$suffix.png"   ?>" class="imgcontainer" style="display: inline-block;"><img src="<?php echo "$BASEURL/../../built/spritesheets/$textureName$suffix.png?"   . time() ?>"></a>
  <a href="<?php echo "$BASEURL/../../built/spritesheets/$textureName$suffix-x.png" ?>" class="imgcontainer" style="display: inline-block;"><img src="<?php echo "$BASEURL/../../built/spritesheets/$textureName$suffix-x.png?" . time() ?>"></a><br/>
  <div style="height: 4px;"></div>
<?php endforeach ?>

<script>
$(function() {
  $('#alerts').effect('highlight');
});
</script>

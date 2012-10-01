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
  }
  else {
    $alerts = '<p>Select an algorithm...</p>';
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

<a href="<?php echo "$BASEURL/textures/$textureName.png" ?>" class="imgcontainer" style="display: inline-block;"><img src="<?php echo "$BASEURL/textures/$textureName.png?" . time() ?>"></a>

<script>
$(function() {
  $('#alerts').effect('highlight');
});
</script>

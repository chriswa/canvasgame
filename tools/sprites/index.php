<?php
  
  if (!preg_match('#/cms/#', $_SERVER['REQUEST_URI'])) {
    header('Location: cms/');
    exit;
  }
  
  require_once "init.php";
  
  $textureDirs = array_map('basename', array_filter(glob('../../src/sprites/textures/*'), 'is_dir'));
  
  foreach ($textureDirs as $textureName) {
    if (!@$DATA['textures'][$textureName]) { $DATA['textures'][$textureName] = array('characters' => array()); }
  }
  saveData();
  
  if (@$_REQUEST['pack']) {
    packTexture(@$_REQUEST['pack']);
  }
  
  $texturesNeedingPack = array();
  foreach ($textureDirs as $textureName) {
    if (!file_exists("../../built/spritesheets/$textureName.png"))  { $texturesNeedingPack[$textureName] = true; continue; }
    if (!file_exists("../../src/sprites/textures/$textureName.json")) { $texturesNeedingPack[$textureName] = true; continue; }
    $sliceFiles      = glob("../../src/sprites/textures/$textureName/*.png");
    $newestSliceTime = max(array_map('filemtime', $sliceFiles));
    $packTime        = @filemtime("../../built/spritesheets/$textureName.png");
    if ($newestSliceTime > $packTime) {
      $texturesNeedingPack[$textureName] = true;
      continue;
    }
    $json = json_decode(file_get_contents("../../src/sprites/textures/$textureName.json"), true);
    $sliceFilenames = array();
    foreach ($sliceFiles as $filepath) {
      $pathParts = explode('/', $filepath);
      $sliceFilenames[] = end($pathParts);
    }
    if (array_diff(array_keys($json), $sliceFilenames) || array_diff($sliceFilenames, array_keys($json))) {
      $texturesNeedingPack[$textureName] = true;
      continue;
    }
  }
  
?>

<?php showHeader(); ?>

<p>
  <strong><a href=".">home</a></strong>
</p>

<h2>Textures</h2>

<ul style="list-style-type: none;">
  <?php foreach ($DATA['textures'] as $textureName => $texture): ?>
    <li>
      <?php if (!in_array($textureName, $textureDirs)): ?>
        <span class="imgcontainer" style="display: inline-block; margin: 2px; color: white;">&nbsp;?&nbsp;</span>
        <span class="imgcontainer" style="display: inline-block; margin: 2px; color: white;">&nbsp;?&nbsp;</span>
        <?php echo $textureName ?>
        (directory is missing)
      <?php else: ?>
        
        <a href="../pack/<?php echo $textureName ?>/" class="imgcontainer" style="display: inline-block;"><img src="<?php echo "$BASEURL/../../built/spritesheets/$textureName" ?>.png" height=70></a>
        
        <?php $arbitrarySlice = array_value(array_value(array_value(first(array_value(first(@$texture['characters']), 'animations')), 'frames'), 0), 'slice') ?>
        <?php if ($arbitrarySlice): ?>
          <span class="imgcontainer" style="display: inline-block; margin: 2px;"><img src="<?php echo "$BASEURL/../../src/sprites/textures/$textureName/$arbitrarySlice" ?>"></span>
        <?php else: ?>
          <span class="imgcontainer" style="display: inline-block; margin: 2px; color: white;">&nbsp;?&nbsp;</span>
        <?php endif ?>
        
        <a href="<?php echo $textureName ?>/"><?php echo $textureName ?></a>
        
        <span style="color: red;"><?php echo @$texturesNeedingPack[$textureName] ? "NEEDS PACK!" : '' ?></span>
      <?php endif ?>
    </li>
  <?php endforeach ?>
</ul>

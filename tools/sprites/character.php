<?php
  
  require_once "init.php";
  
  $characterName = array_pop($PATH);
  $textureName   = array_pop($PATH);
  
  $texture   = &$DATA['textures'][$textureName];
  $character = &$texture['characters'][$characterName];
  
  if (@$_REQUEST['delete']) {
    unset($texture['characters'][$characterName]);
    saveData();
    header("Location: ../");
    exit;
  }
  
  if (@$_REQUEST['save']) {
    $newName = @$_REQUEST['name'];
    unset($texture['characters'][$characterName]);
    $texture['characters'][$newName] = $character;
    saveData();
    header("Location: ../$newName/");
    exit;
  }
  
  if (@$_REQUEST['add'] && @$_REQUEST['name']) {
    $name = @$_REQUEST['name'];
    $character['animations'][$name] = array(
      'loop'   => true,
      'frames' => array(),
    );
    ksort($character['animations']);
    saveData();
    header("Location: $name/");
    exit;
  }
  
?>

<?php showHeader(); ?>

<p>
  <a href="../..">home</a>
  &mdash; <a href=".."><?php echo $textureName ?></a>
  &mdash; <strong><a href="."><?php echo $characterName ?></a></strong>
</p>

<div style="border: 1px solid black; background-color: #eee; padding: 0 15px;">
  <form method="POST">
    <input type="hidden" name="save" value="1">
    <dl>
      <dt>Character Name</dt>
      <dd><input name="name" value="<?php echo $characterName ?>"></dd>
    </dl>
    <input type="submit" value="Save" style="margin-left: 200px;">
    <input type="submit" name="delete" value="Delete" onclick="return confirm('Delete this character?');">
  </form>
</div>

<h2>Animations</h2>

<div style="float: left;">
  <ul style="list-style-type: none">
    <?php foreach ($character['animations'] as $animationName => $animation): ?>
      <li>
        <a href="#" class="play" data-name="<?php echo $animationName ?>">&#9654;</a>
        <a href="<?php echo $animationName ?>/"><?php echo $animationName ?></a>
      </li>
    <?php endforeach ?>
    <li>
      <form method="POST">
        <input type="hidden" name="add" value="1">
        <input type="text" name="name" placeholder="New animation...">
        <input type="submit" value="Add Animation">
      </form>
    </li>
  </ul>
</div>

<div style="float: left; margin-left: 50px;">
  <canvas id="canvas" width="300" height="300"></canvas>
</div>
<div style="clear: both;"></div>
<img src="<?php echo "$BASEURL/../../built/spritesheets/$textureName.png" ?>" id="texture" style="display: none;">

<script>
var slices = <?php echo file_get_contents("../../src/sprites/textures/$textureName.json") ?>;
var thisAnimations = <?php echo json_encode($character['animations']); ?>;
$(function() {
  // initialize Preview canvas (it will be started by redrawAll())
  Preview.init();
  
  //
  for (var key in thisAnimations) {
    Preview.startAnimation( thisAnimations[key]['frames'] );
    break;
  }
  
  //
  $('.play').click(function() {
    Preview.startAnimation( thisAnimations[$(this).data('name')]['frames'] );
    return false;
  });
});
</script>

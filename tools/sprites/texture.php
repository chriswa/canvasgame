<?php
  
  require_once "init.php";
  
  $textureName = array_pop($PATH);
  
  $texture = &$DATA['textures'][$textureName];
  
  if (@$_REQUEST['add'] && @$_REQUEST['name']) {
    $name = @$_REQUEST['name'];
    $texture['characters'][$name] = array(
      'favourites' => array(),
      'animations' => array(),
    );
    ksort($texture['characters']);
    saveData();
    header("Location: $name/");
    exit;
  }
  
?>

<?php showHeader(); ?>

<p>
  <a href="..">home</a>
  &mdash; <strong><a href="."><?php echo $textureName ?></a></strong>
</p>

<h2>Characters</h2>

<ul style="list-style-type: none;">
  <?php foreach ($texture['characters'] as $characterName => $character): ?>
    <li>
      <a href="<?php echo $characterName ?>/">
        <?php $arbitrarySlice = array_value(array_value(array_value(first(@$character['animations']), 'frames'), 0), 'slice') ?>
        <?php if ($arbitrarySlice): ?>
          <span class="imgcontainer" style="display: inline-block; margin: 2px;"><img src="<?php echo "$BASEURL/../../src/sprites/textures/$textureName/$arbitrarySlice" ?>"></span><?php echo $characterName ?>
        <?php else: ?>
          <span class="imgcontainer" style="display: inline-block; margin: 2px; color: white;">&nbsp;?&nbsp;</span><?php echo $characterName ?>
        <?php endif ?>
      </a>
    </li>
  <?php endforeach ?>
  <li>
    <form method="POST">
      <input type="hidden" name="add" value="1">
      <input type="text" name="name" placeholder="New character...">
      <input type="submit" value="Add Character">
    </form>
  </li>
</ul>

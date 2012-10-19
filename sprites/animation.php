<?php
  
  require_once "init.php";
  
  $animationName = array_pop($PATH);
  $characterName = array_pop($PATH);
  $textureName   = array_pop($PATH);
  
  $texture   = &$DATA['textures'][$textureName];
  $character = &$texture['characters'][$characterName];
  $animation = &$character['animations'][$animationName];
  
  list($textureWidth, $textureHeight) = getimagesize("textures/$textureName.png");
  
  if (@$_REQUEST['delete']) {
    unset($character['animations'][$animationName]);
    saveData();
    header("Location: ../");
    exit;
  }
  
  if (@$_REQUEST['save']) {
    $newName = @$_REQUEST['name'];
    $animation['loop'] = @$_REQUEST['loop'];
    unset($character['animations'][$animationName]);
    $character['animations'][$newName] = $animation;
    saveData();
    header("Location: ../$newName/");
    exit;
  }
  
  // ajax!
  if (@$_REQUEST['saveFrames']) {
    $character['animations'][$animationName]['frames'] = json_decode(@$_REQUEST['saveFrames']);
    saveData();
    exit;
  }
  
  /*
  if (@$_REQUEST['add']) {
    $lastFrame = @end($animation['frames']);
    $animation['frames'][] = array(
      'slice'     => $_REQUEST['add'],
      'x'         => 0,                       // TODO: get default from favourites!
      'y'         => 0,                       // TODO: get default from favourites!
      'x_flipped' => 0,                       // TODO: get default from favourites!
      'duration'  => coalesce(@$lastFrame['duration'], 5),
    );
    saveData();
  }
  
  if (array_key_exists('frameUpdate', $_REQUEST)) {
    $frameIndex = @$_REQUEST['frameUpdate'];
    $key        = @$_REQUEST['key'];
    $value      = @$_REQUEST['value'];
    if (in_array($key, array('x', 'x_flipped', 'y', 'duration'))) { $value = intval($value); }
    $animation['frames'][$frameIndex][$key] = $value;
    saveData();
  }
  
  if (array_key_exists('remove', $_REQUEST)) {
    array_splice($animation['frames'], @$_REQUEST['remove'], 1);
    saveData();
  }
  */
  
  //showme($DATA);
  
?>

<?php showHeader(); ?>

<script>

var slices = <?php echo file_get_contents("textures/$textureName.json") ?>;
var thisAnimationFrames = <?php echo json_encode($animation['frames']); ?>;

function sliceSelector(sliceDialogCallback) {
  sliceSelector.callback = sliceDialogCallback;
  $('#sliceDialog').dialog('open');
}

$(function() {
  
  // initialize slice dialog
  $('#sliceDialog').dialog({
    autoOpen: false,
    modal: true,
    width: <?php echo $textureWidth + 40 ?>,
    height: <?php echo $textureHeight + 60 ?>,
    resizable: false,
  });
  $('#sliceDialog img').click(function(e) {
    var offset = $(this).offset();
    var x = e.clientX - offset.left;
    var y = e.clientY - offset.top;
    for (var slice in slices) {
      var sliceCoords = slices[slice];
      if (sliceCoords[0] <= x && x <= sliceCoords[0] + sliceCoords[2] && sliceCoords[1] <= y && y <= sliceCoords[1] + sliceCoords[3]) {
        sliceSelector.callback(slice);
        $('#sliceDialog').dialog('close');
        break;
      }
    }
  });
  
});
</script>

<p>
  <a href="../../..">home</a>
  &mdash; <a href="../.."><?php echo $textureName ?></a>
  &mdash; <a href=".."><?php echo $characterName ?></a>
  &mdash; <strong><a href="."><?php echo $animationName ?></a></strong>
</p>

<div style="border: 1px solid black; background-color: #eee; padding: 0 15px;">
<form method="POST">
  <input type="hidden" name="save" value="1">
  <dl>
    <dt>Animation Name</dt>
    <dd><input name="name" value="<?php echo $animationName ?>"></dd>
    <dt>Loop?</dt>
    <dd><label><input type="checkbox" name="loop" value="1" <?php echo $animation['loop'] ? 'checked="checked"' : '' ?>"> Animation repeats forever</label></dd>
  </dl>
  <input type="submit" value="Save" style="margin-left: 200px;">
  <input type="submit" name="delete" value="Delete" onclick="if (confirm('Delete this animation?')) { $('#applyFrames').attr('disabled', 'disabled'); return true; } else { return false; }">
</form>
</div>

<h2>Frames</h2>

<div style="float: left;">
  <table>
    <thead>
      <th>offset</th><th></th><th>offset</th><th>offset</th><th></th><th></th><th></th></tr>
      <th>Y</th><th></th><th>X</th><th>X(flip)</th><th></th><th>duration</th><th></th></tr>
    </thead>
    <tbody id="frames">
    </tbody>
    <tfoot>
      <tr id="tmpl" style="display: none;">
        <td><input name="y"></td>
        <td class="imgcontainer"><img src=""></td>
        <td><input name="x"></td>
        <td><input name="x_flipped"></td>
        <td class="imgcontainer"><img src="" class="flip"></td>
        <td><input name="duration"></td>
        <td><button class="remove">X</button></td>
      </tr>
    </tfoot>
  </table>
  <br/>
  <button id="add">Add</button>
  <button id="applyFrames" style="margin-left: 200px;">Apply</button>
  <button id="saveFrames">Save</button>
</div>

<div style="float: left; margin-left: 50px;">
  <canvas id="canvas" width="300" height="300"></canvas>
</div>
<div style="clear: both;"></div>

<script>
var sliceImgBaseUrl = '<?php echo "$BASEURL/textures/$textureName/" ?>';
$(function() {
  // initialize Preview canvas (it will be started by redrawAll())
  Preview.init();
  
  // init table
  redrawAll();
  $('#applyFrames').attr('disabled', 'disabled');
  
  //
  window.onbeforeunload = function() {
    if (!$('#applyFrames').attr('disabled')) {
      return "Unsaved changes to frames!";
    }
  }
  
  // when save frames button is clicked, save all frames with ajax
  $('#applyFrames').click(function() {
    $.post('.', { saveFrames: JSON.stringify( thisAnimationFrames ) }, function() {
      $('#applyFrames').attr('disabled', 'disabled');
    });
  });
  
  // when save frames button is clicked, save all frames with ajax
  $('#saveFrames').click(function() {
    $.post('.', { saveFrames: JSON.stringify( thisAnimationFrames ) }, function() {
      $('#applyFrames').attr('disabled', 'disabled');
      location.href = '..';
    });
  });
  
  // when add button is clicked, open slice dialog to pick a new one
  $('#add').click(function() {
    sliceSelector(function(sliceName) {
      var slice = slices[sliceName];
      console.log(slice);
      var duration = thisAnimationFrames.length ? thisAnimationFrames[thisAnimationFrames.length-1].duration : 167;
      thisAnimationFrames.push({ x: Math.floor(slice[2] / 2), x_flipped: Math.floor(slice[2] / 2), y: Math.floor(-slice[3] / 2), duration: duration, slice: sliceName });
      redrawAll();
    });
  });
  
  // when a frame's remove button is clicked, remove it
  $('#frames .remove').live('click', function() {
    var frameIndex = getFrameIndex(this);
    thisAnimationFrames.splice(frameIndex, 1);
    redrawAll();
  });
  
  // when a frame's image is clicked, open slice dialog to change it
  $('#frames img').live('click', function() {
    var frameIndex = getFrameIndex(this);
    sliceSelector(function(slice) {
      thisAnimationFrames[frameIndex].slice = slice;
      redrawAll();
    });
  });
  
  // when a frame's textfield changes, save its value
  $('#frames input').live('change', function() {
    if ($(this).val().length === 0) { $(this).val("0"); }
    var frameIndex = getFrameIndex(this);
    var key = $(this).attr('name');
    thisAnimationFrames[frameIndex][key] = parseInt($(this).val(), 10);
    //redrawAll();
    $('#applyFrames').removeAttr('disabled');
    Preview.startAnimation(thisAnimationFrames);
  });
  $('#frames input').live('keydown', function() {
    $('#applyFrames').removeAttr('disabled');
  });
  
});
function getFrameIndex(el) {
  el = $(el);
  return(el.closest('tbody').find('tr').index(el.closest('tr')));
}
function redrawAll() {
  $('#applyFrames').removeAttr('disabled');
  Preview.startAnimation(thisAnimationFrames);
  $('#frames').empty();
  $('#frames').closest('table').find('td,th').each(function() { $(this).width('auto'); });
  for (var key in thisAnimationFrames) {
    appendRow(thisAnimationFrames[key]);
  }
  $('#frames').closest('table').find('td,th').each(function() { $(this).width($(this).width()); });
  $('#tmpl').closest('table').find('tbody').sortable({ stop: sortComplete }).disableSelection();
}
function sortComplete(ui) {
  var newAnimationFrames = [];
  var newRowIndex = 0;
  $('#frames tr').each(function() {
    var oldRowIndex = $(this).data('rowIndex');
    newAnimationFrames.push(thisAnimationFrames[oldRowIndex]);
    $(this).data('rowIndex', newRowIndex);
    newRowIndex++;
  });
  thisAnimationFrames = newAnimationFrames;
  redrawAll();//
}
function appendRow(f) {
  var rowIndex = $('#frames tr').length;
  var row = $('#tmpl').clone().attr('id', '').data('rowIndex', rowIndex).show().appendTo('#frames');
  row.find('input[name=x]').val(f.x);
  row.find('input[name=x_flipped]').val(f.x_flipped);
  row.find('input[name=y]').val(f.y);
  row.find('input[name=duration]').val(f.duration);
  row.find('img').attr('src', sliceImgBaseUrl + f.slice);
  return row;
}
</script>

<div id="sliceDialog" title="Choose a slice" style="display: none;">
  <img src="<?php echo "$BASEURL/textures/$textureName.png" ?>" id="texture">
</div>

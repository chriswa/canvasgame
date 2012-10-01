<?php

$BASEURL = '/dropbox/canvasgame/sprites';

function showHeader() {
  global $BASEURL;
  ?>
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery.ui.base.css" type="text/css" media="all" />
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery.ui.theme.css" type="text/css" media="all" />
    <link rel="stylesheet" href="<?php echo $BASEURL ?>/init.css" type="text/css" media="all" />
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script>
    <script src="<?php echo $BASEURL ?>/init.js"></script>
  <?php
}
  
// 
loadData();

//
$PATH = explode('/', $_SERVER['REQUEST_URI']);
array_pop($PATH);

// 
function loadData() {
  global $DATA;
  $DATA = json_decode(file_get_contents('data.json'), true);
}

// 
function saveData() {
  global $DATA;
  file_put_contents('data.json', json_encode($DATA));
}

//
function getSlices($textureName) {
  $files = glob("textures/$textureName/*");
  $files = array_diff($files, array_map('is_dir', $files)); // get files only
  $files = array_map('basename', $files);
  sort($files);
  return $files;
}

// 
function packTexture($texture, $algorithm) {
  
  $blocks = array();
  $sort = array();
  foreach (glob("textures/$texture/*.png") as $slice) {
    list($w, $h) = getimagesize($slice);
    $blocks[] = array(
      'slice' => $slice,
      'w'     => $w,
      'h'     => $h,
    );
    if     ($algorithm == 'height')  { $sort[] = $h; }
    elseif ($algorithm == 'width')   { $sort[] = $w; }
    elseif ($algorithm == 'maxside') { $sort[] = max($w, $h); }
    elseif ($algorithm == 'random')  { $sort[] = rand(); }
  }
  
  if (!$blocks) { die("no slices found in textures/$texture/*.png"); }
  
  array_multisort(
    $sort, SORT_DESC,
    $blocks
  );
  
  $p = new Packer();
  $p->fit($blocks);
  
  $max_w = 0;
  $max_h = 0;
  foreach ($blocks as $block) {
    if (!@$block['fit']) { return 0; }
    $max_w = max($max_w, $block['fit']['x'] + $block['w']);
    $max_h = max($max_h, $block['fit']['y'] + $block['h']);
  }
  
  $sheetImage = imagecreatetruecolor($max_w, $max_h);
  imagesavealpha($sheetImage, true);
  $im_trans = imagecolorallocatealpha($sheetImage, 0, 0, 0, 127);
  imagefill($sheetImage, 0, 0, $im_trans);
  foreach ($blocks as $block) {
    $sliceImage = imagecreatefrompng($block['slice']);
    //print_r(array($block['slice'], $block['fit']['x'], $block['fit']['y'], 0, 0, $block['w'], $block['h']));
    imagecopy($sheetImage, $sliceImage, $block['fit']['x'], $block['fit']['y'], 0, 0, $block['w'], $block['h']);
    imagedestroy($sliceImage);
  }
  imagepng($sheetImage, "textures/$texture.png");
  
  $json = array();
  foreach ($blocks as $block) {
    $pathParts = explode('/', $block['slice']);
    $filename = end($pathParts);
    $json[$filename] = array($block['fit']['x'], $block['fit']['y'], $block['w'], $block['h']);
  }
  file_put_contents("textures/$texture.json", json_encode($json));
  
  $filledSpace = 0;
  foreach ($blocks as $block) {
    $filledSpace += $block['w'] * $block['h'];
  }
  $percentageFilled = $filledSpace / ($max_w * $max_h);
  
  return array(count($blocks), $max_w, $max_h, number_format($percentageFilled * 100, 1));
}


// adapted from https://github.com/jakesgordon/bin-packing/blob/master/js/packer.growing.js
class Packer {
  public $root;
  
  public function fit(&$blocks) {
    $len = count($blocks);
    $w = $len > 0 ? $blocks[0]['w'] : 0;
    $h = $len > 0 ? $blocks[0]['h'] : 0;
    $this->root = array( 'x' => 0, 'y' => 0, 'w' => $w, 'h' => $h );
    foreach ($blocks as $blockIndex => $block) {
      if ($node = &$this->findNode($this->root, $block['w'], $block['h'])) {
        $blocks[$blockIndex]['fit'] = $this->splitNode($node, $block['w'], $block['h']);
      }
      else {
        $blocks[$blockIndex]['fit'] = $this->growNode($block['w'], $block['h']);
      }
    }
    unset($block);
  }
  
  function &findNode(&$root, $w, $h) {
    if (@$root['used']) {
      $retval = &$this->findNode($root['right'], $w, $h);
      if ($retval) {
        return $retval;
      }
      $retval = &$this->findNode($root['down'], $w, $h);
      return $retval;
    }
    else if (($w <= $root['w']) && ($h <= $root['h'])) {
      return $root;
    }
    else {
      $junk = array();
      return $junk;
    }
  }

  function &splitNode(&$node, $w, $h) {
    $node['used']  = true;
    $node['down']  = array( 'x' => $node['x'],      'y' => $node['y'] + $h, 'w' => $node['w'],      'h' => $node['h'] - $h );
    $node['right'] = array( 'x' => $node['x'] + $w, 'y' => $node['y'],      'w' => $node['w'] - $w, 'h' => $h              );
    return $node;
  }
  
  function &growNode($w, $h) {
    $canGrowDown  = ($w <= $this->root['w']);
    $canGrowRight = ($h <= $this->root['h']);
    
    $shouldGrowRight = $canGrowRight && ($this->root['h'] >= ($this->root['w'] + $w)); // attempt to keep square-ish by growing right when height is much greater than width
    $shouldGrowDown  = $canGrowDown  && ($this->root['w'] >= ($this->root['h'] + $h)); // attempt to keep square-ish by growing down  when width  is much greater than height
    
    if      ($shouldGrowRight) { return $this->growRight($w, $h); }
    else if ($shouldGrowDown)  { return $this->growDown($w, $h); }
    else if ($canGrowRight)    { return $this->growRight($w, $h); }
    else if ($canGrowDown)     { return $this->growDown($w, $h); }
    else                       {
      // need to ensure sensible root starting size to avoid this happening
      //die("grow fail?");
      $junk = array();
      return $junk;
    }
  }
  
  function &growRight($w, $h) {
    $this->root = array(
      'used'  => true,
      'x'     => 0,
      'y'     => 0,
      'w'     => $this->root['w'] + $w,
      'h'     => $this->root['h'],
      'down'  => $this->root,
      'right' => array( 'x' => $this->root['w'], 'y' => 0, 'w' => $w, 'h' => $this->root['h'] )
    );
    if ($node = &$this->findNode($this->root, $w, $h)) {
      return $this->splitNode($node, $w, $h);
    }
    else {
      $junk = array();
      return $junk;
    }
  }
  
  function &growDown($w, $h) {
    $this->root = array(
      'used'  => true,
      'x'     => 0,
      'y'     => 0,
      'w'     => $this->root['w'],
      'h'     => $this->root['h'] + $h,
      'down'  => array( 'x' => 0, 'y' => $this->root['h'], 'w' => $this->root['w'], 'h' => $h ),
      'right' => $this->root
    );
    if ($node = &$this->findNode($this->root, $w, $h)) {
      return $this->splitNode($node, $w, $h);
    }
    else {
      $junk = array();
      return $junk;
    }
  }
  
}

//
function showme($var) {
  echo "<xmp>" . print_r($var, true) . "</xmp>\n";
}

// array_pluck: (aka array_collect) utility function which returns specific key/column from an array
function array_pluck($recordList, $targetField) {
  $result = array();
  foreach ($recordList as $recordKey => $record) {
    if (!array_key_exists($targetField, $record)) { continue; }
    $result[ $recordKey ] = $record[$targetField];
  }
  return $result;
}

// array_groupBy:
//   eg. $recordsByNum = array_groupBy($records, 'num');
//   eg. $recordsByCategory = array_groupBy($records, 'category', true);
//       foreach ($recordsByCategory as $category => $categoryRecords) { ;;; }
function array_groupBy($recordList, $indexField, $resultsAsArray = false) {
  $result = array();
  foreach ($recordList as $recordKey => $record) {

    // get index value or skip this record
    if (!array_key_exists($indexField, $record)) { continue; }
    $indexValue = $record[$indexField];

    // add this record to the result array
    if ($resultsAsArray) {
      if (!@$result[ $indexValue ]) { $result[ $indexValue ] = array(); }
      $result[ $indexValue ][ $recordKey ] = $record;
    }
    else {
      $result[ $indexValue ] = $record;
    }

  }
  return $result;
}

// return the specified array value (this exists for function composition!)
// $num   = array_value($array, 'num'); // @$array['num']
// $width = array_value($record, 'photos', 0, 'width'); // @$record['photos'][0]['width']
function array_value($array, $key) {
  if (func_num_args() == 2) {
    return @$array[$key];
  }
  else {
    $keys = func_get_args();
    array_shift($keys); // get rid of the first element
    foreach ($keys as $key) {
      $array = @$array[$key];
    }
    return $array;
  }
}

// returns the first argument which evaluates to true (similar to MySQL's COALESCE() which returns the first non-null argument) or the last argument
function coalesce() {
  $lastArg = null;
  foreach (func_get_args() as $arg) {
    if ($arg) {
      return $arg;
    }
    $lastArg = $arg;
  }
  return $lastArg;
}

//
function isAjaxRequest() {
  $isAjaxRequest = strtolower(@$_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
  return $isAjaxRequest;
}

//
function first($array) {
  return @reset($array);
}

?>

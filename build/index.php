<?php

require_once "lib/util.php";
require_once "lib/sprites.php";
require_once "lib/maps.php";

$runningSeparately = str_replace('\\', '/', __FILE__) === str_replace('\\', '/', $_SERVER['SCRIPT_FILENAME']);
if ($runningSeparately) {
  chdir('..');
}

$feedback = '';

$feedback .= build_sprites();
$feedback .= build_maps();

if ($runningSeparately) {
  echo $feedback;
}

?>

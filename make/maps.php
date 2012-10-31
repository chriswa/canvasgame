<?php

$UNIQUE_SPAWN_ID = 1000;

//
function build_maps() {
  $feedback = "<h3>Building maps...</h3>\n";
  
  $R = array();
  $R['areas'] = array();
  
  // load areas from src/maps/*.tmx
  foreach (glob('src/maps/*.tmx') as $mapFile) {
    preg_match('#src/maps/(.*)\.\w+$#', $mapFile, $matches);
    $filelabel = $matches[1];
    
    $feedback .= "$filelabel<br/>\n";
    
    $map = xmlParser_stringToNodeTree(file_get_contents($mapFile));
    //showme($map->toString());
    $backgroundFirstGid     = null;
    $backgroundTilesetImage = null;
    $backgroundTileData     = null;
    $physicsFirstGid        = null;
    $physicsTileData        = null;
    $objects                = array();
    
    // parse tilesets
    foreach ($map->findMany('tileset') as $tileset) {
      $tilesetName = $tileset->attr['name'];
      $image = $tileset->find('image');
      
      // get firstGid
      if ($tilesetName === 'physicsTiles') {
        $physicsFirstGid = $tileset->attr['firstgid'];
      }
      else {
        $backgroundFirstGid = $tileset->attr['firstgid'];
        
        // also get $backgroundTilesetImage for background tileset
        if (preg_match('#\.\./res/tileset/(.*)#', $image->attr['source'], $matches)) {
          $backgroundTilesetImage = $matches[1];
        }
      }
    }
    
    // parse layers
    foreach ($map->findMany('layer') as $layer) {
      $data = $layer->find('data');
      
      // decode tile data
      $tiles = null;
      if ($data->attr['encoding'] === 'base64' && $data->attr['compression'] === 'zlib') {
        $tiles = array_values(unpack('V*', gzuncompress(base64_decode($data->value))));
      }
      elseif ($data->attr['encoding'] === 'csv') {
        $tiles = array_map('intval', explode(',', $data->value));
      }
      else { die("Resource $mapFile - unknown tile data encoding/compression"); }
      
      // get $physicsTiles or $backgroundTileData ()
      if ($layer->attr['name'] === 'physics') {
        $physicsTileData = array_map(create_function('$tileIndex', 'return $tileIndex ? ($tileIndex - ' . $physicsFirstGid . ' + 1) : 0;'), $tiles);
      }
      elseif ($layer->attr['name'] === 'background') {
        $backgroundTileData = array_map(create_function('$tileIndex', 'return $tileIndex ? ($tileIndex - ' . $backgroundFirstGid . ') : 0;'), $tiles);
      }
      else { die("Resource $mapFile - an object has an unknown tile layer name '{$layer->attr['name']}'"); }
    }
    
    // parse objects
    foreach ($map->findList('objectgroup') as $object) {
      $properties = $object->findList('properties');
      $props = array();
      foreach ($properties as $property) {
        $props[ $property->attr['name'] ] = @$property->attr['value'];
      }
      
      $obj = $object->attr;
      $obj['properties'] = $props;
      handleObject($obj, $objects);
    }
    
    //
    $mapProperties = array();
    $properties = $map->kidByTag('properties');
    if ($properties) {
      foreach ($properties->kids as $property) {
        $mapProperties[$property->attr['name']] = $property->attr['value'];
      }
    }
    
    $area = array(
      'image'      => $backgroundTilesetImage,
      'bgColour'   => coalesce(@$map->attr['backgroundcolor'], '#000000'),
      'tileSize'   => (int)$map->attr['tilewidth'],
      'cols'       => (int)$map->attr['width'],
      'background' => $backgroundTileData,
      'properties' => $mapProperties,
    );
    #$area = array_merge($area, $areaProperties);
    if ($physicsTileData)   { $area['physics'] = $physicsTileData; }
    if (@$objects['exit'])  { $area['exits']   = $objects['exit']; }
    if (@$objects['spawn']) { $area['spawns']  = $objects['spawn']; }
    $R['areas'][$filelabel] = $area;
    
    // end of loop
    
    /*
    list($xml, $xmlIndex) = parse_xml_file($mapFile);
    $tileLayers = array();
    $objects    = array();
    $object     = null;
    $properties = array();
    $areaProperties = array();
    $mapBackgroundColour = '#000000';
    $physicsTileIndexOffset    = -1;
    $backgroundTileIndexOffset = -1;
    $layerName  = '';
    foreach ($xml as $tag) {
      $attr = @$tag['attributes'];
      
      // map background colour?
      if ($tag['tag'] === 'map') {
        if (@$attr['backgroundcolor']) {
          $mapBackgroundColour = $attr['backgroundcolor'];
        }
      }
      
      // properties may belong to objects or the map itself
      elseif ($tag['tag'] === 'property') {
        $properties[ $attr['name'] ] = $attr['value'];
      }
      
      // tilesets
      elseif ($tag['tag'] === 'tileset' && $tag['type'] === 'open') { //  <tileset firstgid="225" name="tiles-new" tilewidth="32" tileheight="32">
        if ($attr['name'] === 'physicsTiles') {
          $physicsTileIndexOffset = intval($attr['firstgid']);
        }
        else {
          if ($backgroundTileIndexOffset !== -1) { die("Resource $mapFile - more than one tileset (other than physicsTiles) is not allowed"); }
          $backgroundTileIndexOffset = intval($attr['firstgid']);
        }
      }
      elseif ($tag['tag'] === 'image') { // <image source="res/tiles3.png" width="256" height="256"/>
        
        $areaProperties = $properties;
        
        if (preg_match('#\.\./res/(.*)#', $attr['source'], $matches)) {
          $imageFilename = $matches[1];
        }
      }
      
      // layers
      elseif ($tag['tag'] === 'layer') {
        $layerName = @$attr['name'];
      }
      elseif ($tag['tag'] === 'data') {
        $data = $tag['value'];
        $tiles = null;
        if ($attr['encoding'] === 'base64' && $attr['compression'] === 'zlib') {
          $tiles = array_values(unpack('V*', gzuncompress(base64_decode($tag['value']))));
        }
        elseif ($attr['encoding'] === 'csv') {
          $tiles = array_map('intval', explode(',', $tag['value']));
        }
        else {
          die("Resource $mapFile - unknown tile data encoding/compression");
        }
        
        if ($layerName === 'physics') {
          $tiles = array_map(create_function('$tileIndex', 'return $tileIndex ? ($tileIndex - ' . $physicsTileIndexOffset . ' + 1) : 0;'), $tiles);
        }
        elseif ($layerName === 'background') {
          $tiles = array_map(create_function('$tileIndex', 'return $tileIndex ? ($tileIndex - ' . $backgroundTileIndexOffset . ') : 0;'), $tiles);
        }
        else {
          die("Resource $mapFile - an object has an unknown tile layer name '$layerName'");
        }
        $tileLayers[$layerName] = $tiles;
      }
      
      // objectgroups
      elseif ($tag['tag'] === 'object') {
        
        // if this is an open tag, we'll need to wait for the close tag (and collect properties in the meantime)
        if ($tag['type'] === 'open' || $tag['type'] === 'complete') {
          $object = $attr;
          $properties = array();
        }
        
        if ($tag['type'] === 'close' || $tag['type'] === 'complete') {
          $object['properties'] = $properties;
          handleObject($object, $objects);
        }
      }
      
    }
    
    $area = array(
      'image'      => $imageFilename,
      'bgColour'   => $mapBackgroundColour,
      'tileSize'   => (int)$xml[0]['attributes']['tilewidth'],
      'cols'       => (int)$xml[0]['attributes']['width'],
      'background' => $tileLayers['background'],
    );
    $area = array_merge($area, $areaProperties);
    if (@$tileLayers['physics']) { $area['physics'] = $tileLayers['physics']; }
    if (@$objects['exit'])       { $area['exits']   = $objects['exit']; }
    if (@$objects['spawn'])      { $area['spawns']  = $objects['spawn']; }
    $R['areas'][$filelabel] = $area;
    */
  }
  
  file_put_contents('built/js/R.areas.js', "// DO NOT EDIT THIS FILE: it is automatically generated by make/maps.php\n\n_.extend(R, \n" . json_encode($R) . "\n);\n");
  
  return $feedback;
}

// 
function handleObject($object, &$objectsOut) {
  if (!@$object['name']) { die("Resource $mapFile - an object is missing a name"); }
  if (!@$object['type']) { die("Resource $mapFile - an object is missing a type"); }
  
  if ($object['type'] === 'exit') {
    handleExitObject($object, $objectsOut);
  }
  elseif ($object['type'] === 'spawn' || $object['type'] === 'hardSpawn') {
    handleSpawnObject($object, $objectsOut);
  }
  else {
    die("Resource $mapFile - an object has an unknown type '{$object['type']}'");
  }
}

// 
function handleExitObject($object, &$objectsOut) {
  if (array_key_exists('x', $object['properties'])) { $object['properties']['x'] = (double)$object['properties']['x']; }
  if (array_key_exists('y', $object['properties'])) { $object['properties']['y'] = (double)$object['properties']['y']; }
  
  $objectsOut['exit'][] = array_merge(array(
    'area'   => $object['name'],
    'hitbox' => array( 'x1' => (double)$object['x'], 'y1' => (double)$object['y'], 'x2' => (double)$object['x'] + (double)$object['width'], 'y2' => (double)$object['y'] + (double)$object['height'] ),
  ), $object['properties']);
}

// 
function handleSpawnObject($object, &$objectsOut) {
  global $UNIQUE_SPAWN_ID;
  
  $spawn = array_merge(array(
    'class' => $object['name'],
    'x'     => (double)$object['x'] + (double)$object['width']  / 2,
    'y'     => (double)$object['y'] + (double)$object['height'] / 2,
  ), $object['properties']);
  
  if ($object['type'] === 'hardSpawn') { $spawn['hard'] = true; }
  
  $once = @$spawn['once'];
  unset($spawn['once']);
  if ($once === 'dungeon') {
    $spawn['oncePerDungeon'] = ++$UNIQUE_SPAWN_ID;
  }
  elseif ($once === 'ever') {
    $spawn['onceEver'] = ++$UNIQUE_SPAWN_ID;
  }
  elseif ($once) {
    die("Resource $mapFile - an object has an unknown 'once' property (should be either 'dungeon' or 'ever')");
  }
  
  $objectsOut['spawn'][] = $spawn;
}

?>

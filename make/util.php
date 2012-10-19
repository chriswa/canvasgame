<?php

// 
function showme($var) {
  echo "<xmp>" . print_r($var, true) . "</xmp>\n";
}

// 
function coalesce() {
  $lastArg = null;
  foreach (func_get_args() as $arg) {
    if ($arg) { return $arg; }
    $lastArg = $arg;
  }
  return $lastArg;
}

// 
function minusOne($n) { return $n - 1; }

// 
function clampToOne($n) { return $n ? 1 : 0; }

// 
function parse_xml_file($filepath) {
  $xml      = null;
  $xmlIndex = null;
  $parser   = xml_parser_create();
  xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
  xml_parse_into_struct($parser, file_get_contents($filepath), $xml, $xmlIndex);
  xml_parser_free($parser);
  return array($xml, $xmlIndex);
}

//
//function permissiveJsonLoad($filename) {
//  $json = file_get_contents($filename);
//  $json = preg_replace('/^[^{]*/', '', $json);     // remove prefixed "var X ="
//  $json = preg_replace('/;\s*$/', '', $json);      // remove trailing ";"
//  $json = preg_replace('#/\*.*?\*/#s', '', $json); // remove "/* comments */"
//  $json = preg_replace('#//.*#', '', $json);       // remove '// comments"
//  $json = preg_replace('/,\s*\]/s', ']', $json);   // remove trailing commas in arrays
//  $json = preg_replace('/,\s*\}/s', '}', $json);   // remove trailing commas in objects
//  return json_decode($json, true);
//}

// 
function xmlParser_stringToNodeTree($xmlString) {
  $xmlString = preg_replace('/^\s*<' . '\?xml[^?]*\?>/', '', $xmlString);
  $xmlStruct = null;
  $xmlIndex  = null;
  $parser    = xml_parser_create();
  xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
  xml_parser_set_option($parser, XML_OPTION_SKIP_WHITE, 1);
  $success = xml_parse_into_struct($parser, $xmlString, $xmlStruct, $xmlIndex);
  
  if (!$success) {
    echo "XML parsing error!\n";
    echo "Line Number:  " . xml_get_current_line_number($parser) . "\n";
    echo "Error Code:   " . xml_get_error_code($parser) . "\n";
    echo "Error String: " . xml_error_string(xml_get_error_code($parser)) . "\n";
    echo "XML Data:\n" . $xmlString;
    die();
  }
  
  xml_parser_free($parser);
  
  $stack = array(new xmlParser_XMLNode('_ROOT', null));
  foreach ($xmlStruct as $tag) {
    $type = $tag['type']; // either <open>, </close>, or <complete/>
    
    // get node (either from the current tag, or off the stack if this is a </close> tag)
    $node = null;
    if ( $type === 'close' ) {
      $node = array_shift($stack);
    }
    else {
      $node = new xmlParser_XMLNode($tag['tag'], $stack[0]);
      if (@$tag['attributes']) { $node->attr  = $tag['attributes']; }
      if (@$tag['value'])      { $node->value = trim($tag['value']); }
    }
    
    // if this is an <open> tag, put the node on the stack
    if ( $type === 'open' ) {
      array_unshift($stack, $node);
    }
    // otherwise, add the node to the immediate parent on the stack
    else {
      $stack[0]->kids[] = $node;
    }
  }
  
  // return the fake root node's first child as the first node
  $root = $stack[0]->kids[0];
  $root->parent = null;
  return $root;
}

class xmlParser_XMLNode {
  
  var $name, $attr, $kids, $parent;
  
  function __construct($name, $parent) {
    $this->name   = $name;
    $this->parent = $parent;
    $this->attr   = array();
    $this->kids   = array();
  }
  
  function find($targetTagName) {
    foreach ($this->kids as $kid) {
      if ($kid->name === $targetTagName) {
        return $kid;
      }
      else {
        $result = $kid->find($targetTagName);
        if ($result) { return $result; }
      }
    }
    return null;
  }
  
  function findMany($targetTagName) {
    $results = array();
    foreach ($this->kids as $kid) {
      if ($kid->name === $targetTagName) {
        $results[] = $kid;
      }
      else {
        $results = array_merge($results, $kid->findMany($targetTagName));
      }
    }
    return $results;
  }
  
  function findValue($targetTagName) {
    $result = $this->find($targetTagName);
    return $result ? $result->value : null;
  }
  
  function findList($targetTagName) {
    $result = $this->find($targetTagName);
    return $result ? $result->kids : array();
  }
  
  function closest($targetTagName) {
    $result = $this->parent;
    while (true) {
      if ($result === null) { return null; }
      if ($result->name === $targetTagName) { return $result; }
      $result = $result->parent;
    }
  }
  
  function toString($indent = '') {
    $name = $this->name;
    $attrs = '';
    foreach ($this->attr as $key => $value) {
      $attrs .= ' ' . $key . '="' . htmlspecialchars($value) . '"';
    }
    $str = '';
    if (!$this->kids) {
      if (isset($this->value)) {
        $str = "$indent<$name$attrs>" . htmlspecialchars($this->value) . "</$name>\n";
      }
      else {
        $str = "$indent<$name$attrs />\n";
      }
    }
    else {
      $str = "$indent<$name$attrs>\n";
      foreach ($this->kids as $kid) {
        $str .= $kid->toString($indent . '  ');
      }
      $str .= "$indent</$name>\n";
    }
    return $str;
  }
  
}


?>
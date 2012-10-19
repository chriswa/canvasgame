<!DOCTYPE html>
<html lang="en">
<head>
<title>Ace: <?php echo @$_REQUEST['file'] ?></title>
<style type="text/css" media="screen">
  #editor { position: absolute; top: 0; right: 0; bottom: 0; left: 0; }
</style>
</head>
<body>
<div id="editor"><?php echo htmlspecialchars(file_get_contents(@$_REQUEST['file'])) ?></div>
<script src="http://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
<script>
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/textmate");
  editor.getSession().setMode("ace/mode/javascript");
  editor.setShowPrintMargin(false);
  <?php if (@$_REQUEST['line']): ?>
    editor.gotoLine(<?php echo @$_REQUEST['line'] ?>, 0, true);
    <?php if (@$_REQUEST['line'] > 6): ?>
    setTimeout( function() {
      editor.scrollToLine(<?php echo @$_REQUEST['line'] - 5 ?>, true, true);
    }, 500);
    editor.session.on('loadMode', function(e) { console.log(e); });
    <?php endif ?>
  <?php endif ?>
</script>
</body>
</html>

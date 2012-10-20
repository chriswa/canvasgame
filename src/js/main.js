//console.log("Build took: " + BUILD_TIME_ELAPSED.toFixed(1) + "ms");

// globals
var CANVAS, GFX, REQUEST;

// init App
window.onload = function() {
  
  // load request object from ?query=string
  REQUEST = loadQueryString();
  
  // initialize Mobile first, since it may need to resize the canvas (and allow it to be forced on from query string)
  Mobile.init(REQUEST['mobile']);
  
  // guess production mode from URL (and allow it to be forced from query string)
  var isProduction = (window.location.href === "http://dl.dropbox.com/u/29873255/aolbackup/index.html");
  if (REQUEST['production'])  { isProduction = true; }
  if (REQUEST['development']) { isProduction = false; }

  // initialize App
  App.init(isProduction);
  
};

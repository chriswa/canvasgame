//console.log("Build took: " + BUILD_TIME_ELAPSED.toFixed(1) + "ms");

// globals
var CANVAS, CANVAS_CTX;

// init App
window.onload = function() {
  
  // guess production mode from URL (and allow it to be forced from query string)
  var isProduction = (window.location.href === "http://chriswa.com/zelda2/");

  // initialize App
  App.init(isProduction);
  
};

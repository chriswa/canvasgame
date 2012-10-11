console.log("Build took: " + BUILD_TIME_ELAPSED.toFixed(1) + "ms");

var forceMobile = false;

var isProduction = (window.location.href === "http://dl.dropbox.com/u/29873255/aolbackup/index.html");

// init App
window.onload = function() {
  Mobile.init(function() {
    App.init();
    
    if (isProduction) {
      Debug.showStatusbar = false;
      $('.production-toggle').toggle();
    }
    else {
      $('.development-toggle').toggle();
    }
    if (Mobile.isMobile) { $('.mobile-off').hide(); }
    
  }, forceMobile);
};

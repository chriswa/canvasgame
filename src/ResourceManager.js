var ResourceManager = {
  init: function(callback) {
    R.beforeLoad();
    this.loadImages( function() {
      
      _.each(R.images, function(img, key, obj) {
        img[ R.IMG_PINK ]                            = ResourceManager.colourizeImage(img[ R.IMG_ORIGINAL ], 'pink');
        img[ R.IMG_CYAN ]                            = ResourceManager.colourizeImage(img[ R.IMG_ORIGINAL ], 'cyan');
        img[ R.IMG_PINK | R.IMG_CYAN ]               = ResourceManager.colourizeImage(img[ R.IMG_ORIGINAL ], 'wacky');
        img[ R.IMG_FLIPX ]                           = ResourceManager.flipImageHorizontally(img[ R.IMG_ORIGINAL ]);
        img[ R.IMG_PINK | R.IMG_FLIPX ]              = ResourceManager.flipImageHorizontally(img[ R.IMG_PINK ]);
        img[ R.IMG_CYAN | R.IMG_FLIPX ]              = ResourceManager.flipImageHorizontally(img[ R.IMG_CYAN ]);
        img[ R.IMG_PINK | R.IMG_CYAN | R.IMG_FLIPX ] = ResourceManager.flipImageHorizontally(img[ R.IMG_PINK | R.IMG_CYAN ]);
      });
      
      callback();
    });
  },
  
  loadImages: function(callback) {
    // count resources as they load and call callback after the last one
    var loaded      = 0;
    var totalToLoad = 0;
    var resourceLoad = function() {
      if (++loaded === totalToLoad) {
        callback();
      }
    };
    
    // load images
    totalToLoad += _.keys(R.images).length; // increment totalToLoad
    _.each(R.images, function(value, key, obj) {
      var filepath = 'res/' + key;
      var img = new Image();
      img.onload = resourceLoad;
      img.src = filepath + '?' + now();
      obj[key][0] = img;
    });
    
  },
  
  //
  flipImageHorizontally: function(img) {
    var canvas = this.cloneImage(img);
    var ctx    = canvas.getContext('2d');
    
    ctx.translate(img.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    
    return canvas;
  },
  
  //
  colourizeImage: function(img, mode) {
    var canvas = this.cloneImage(img);
    var ctx    = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // invert colors
    var imgData = ctx.getImageData(0, 0, img.width, img.height);
    if (mode === 'pink') {
      for (var i = 0; i < imgData.data.length; i += 4) {
        var r = imgData.data[i], g = imgData.data[i+1], b = imgData.data[i+2];
        imgData.data[i]   = 255-b;
        imgData.data[i+1] = 255-r;
        imgData.data[i+2] = 255-g;
      }
    }
    else if (mode === 'cyan') {
      for (var i = 0; i < imgData.data.length; i += 4) {
        var r = imgData.data[i], g = imgData.data[i+1], b = imgData.data[i+2];
        imgData.data[i]   = g;
        imgData.data[i+1] = b;
        imgData.data[i+2] = r;
      }
    }
    else if (mode === 'wacky') {
      for (var i = 0; i < imgData.data.length; i += 4) {
        var r = imgData.data[i], g = imgData.data[i+1], b = imgData.data[i+2];
        imgData.data[i]   = b;
        imgData.data[i+1] = r;
        imgData.data[i+2] = g;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    
    return canvas;
  },
  
  //
  cloneImage: function(img) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', img.width);
    canvas.setAttribute('height', img.height);
    //$(canvas).appendTo('body');
    return canvas;
  },


};

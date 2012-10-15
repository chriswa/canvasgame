var ResourceManager = {
  init: function(callback) {
    
    var progressCallback = function(percentComplete) {
      ctx.fillStyle = '#999';
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width / 2 - 115 + 230 * percentComplete, 0);
      ctx.lineTo(canvas.width / 2 - 115 + 230 * percentComplete, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.clip();
      ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2 + 16);
      ctx.restore();
    };
    
    this.loadImages( progressCallback, callback );
  },
  
  loadImages: function(progressCallback, callback) {
    // count resources as they load and call callback after the last one
    var loaded      = 0;
    var totalToLoad = 0;
    var resourceLoad = function() {
      loaded += 1;
      progressCallback(loaded / totalToLoad);
      if (loaded === totalToLoad) {
        callback();
      }
    };
    
    var loadImage = function(filepath, obj, key) {
      var img    = new Image();
      img.onload = resourceLoad;
      img.src    = filepath + '?' + BUILD_DATE; // attempt to avoid caching between builds
      obj[key]   = img;
    };
    
    // first, determine how many images we need to load (for progressCallback)
    totalToLoad += _.keys(R.tilesetImages).length;
    _.each(R.spriteTextures, function(value, key, obj) {
      totalToLoad += Math.pow(2, value.imageModifiers.length);
    });
    
    // now start loading things
    _.each(R.tilesetImages, function(value, key, obj) {
      loadImage('res/' + key, obj, key);
    });
    _.each(R.spriteTextures, function(value, key, obj) {
      var textureName = key.split('.')[0];
      var imageModifiers = _.reduce(value.imageModifiers, function(acc, num) { return acc | num; }, 0);
      loadImage('res/' + textureName + '.png',         obj[key], R.IMG_ORIGINAL);
      if (imageModifiers & R.IMG_FLIPX) {
        loadImage('res/' + textureName + '-x.png',       obj[key], R.IMG_FLIPX);
      }
      if (imageModifiers & R.IMG_PINK) {
        loadImage('res/' + textureName + '-pink.png',    obj[key], R.IMG_PINK);
      }
      if (imageModifiers & R.IMG_PINK && imageModifiers & R.IMG_FLIPX) {
        loadImage('res/' + textureName + '-pink-x.png',  obj[key], R.IMG_PINK | R.IMG_FLIPX);
      }
      if (imageModifiers & R.IMG_CYAN) {
        loadImage('res/' + textureName + '-cyan.png',    obj[key], R.IMG_CYAN);
      }
      if (imageModifiers & R.IMG_CYAN && imageModifiers & R.IMG_FLIPX) {
        loadImage('res/' + textureName + '-cyan-x.png',  obj[key], R.IMG_CYAN | R.IMG_FLIPX);
      }
      if (imageModifiers & R.IMG_PINK && imageModifiers & R.IMG_CYAN) {
        loadImage('res/' + textureName + '-wacky.png',   obj[key], R.IMG_PINK | R.IMG_CYAN);
      }
      if (imageModifiers & R.IMG_PINK && imageModifiers & R.IMG_CYAN && imageModifiers & R.IMG_FLIPX) {
        loadImage('res/' + textureName + '-wacky-x.png', obj[key], R.IMG_PINK | R.IMG_CYAN | R.IMG_FLIPX);
      }
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
    else if (mode === 'reverse') {
      for (var i = 0; i < imgData.data.length; i += 4) {
        var r = imgData.data[i], g = imgData.data[i+1], b = imgData.data[i+2];
        imgData.data[i]   = 255-r;
        imgData.data[i+1] = 255-g;
        imgData.data[i+2] = 255-b;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    
    return canvas;
  },
  
  //
  replaceColours: function(img, colourTransformMap) {
    var canvas = this.cloneImage(img);
    var ctx    = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    var imgData = ctx.getImageData(0, 0, img.width, img.height);
    for (var i = 0; i < imgData.data.length; i += 4) {
      var rgb = imgData.data[i] + (imgData.data[i+1] << 8) + (imgData.data[i+2] << 16);
      rgb = colourTransformMap[rgb] || rgb;
      imgData.data[i]   = rgb & 0xff;
      imgData.data[i+1] = (rgb >> 8) & 0xff;
      imgData.data[i+2] = (rgb >> 16) & 0xff;
    }
    ctx.putImageData(imgData, 0, 0);
    
    return canvas;
  },
  
  //
  cloneImage: function(img) {
    var canvas = document.createElement('canvas');
    canvas.width  = img.width;
    canvas.height = img.height;
    //$(canvas).appendTo('body');
    return canvas;
  },
  
  // for bugs on galaxy nexus
  finalizeTexture: function(canvas) {
    if (!Mobile.isMobile) { return canvas; }
    var image = document.createElement('img');
    image.src = canvas.toDataURL("image/png");
    return image;
  },


};

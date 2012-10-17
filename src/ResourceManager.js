var ResourceManager = {
  init: function(onComplete) {
    
    this.audioFormat = document.createElement('audio').canPlayType('audio/mpeg') ? 'mp3' : 'ogg';
    
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
    
    var loaded, totalToLoad;
    var onResourceLoad = function() {
      loaded += 1;
      progressCallback(loaded / totalToLoad);
      if (loaded === totalToLoad) {
        onComplete();
      }
    };
    var loadList = this.generateLoadList(onResourceLoad);
    loaded       = 0;
    totalToLoad  = loadList.length;
    
    _.each(loadList, function(loadElement) { loadElement(onResourceLoad); });
  },
  
  generateLoadList: function(onResourceLoad) {
    var loadList = [];
    
    // sound effects
    _.each(R.sfx, function(value, key, obj) {
      loadList.push( _.bind( this.loadAudio, this, 'res/sfx/' + key, value, obj, key, onResourceLoad) );
    }, this);
    
    // tileset images
    _.each(R.tilesetImages, function(value, key, obj) {
      loadList.push( _.bind( this.loadImage, this, 'res/' + key, obj, key, onResourceLoad) );
    }, this);
    
    // sprite textures (images)
    _.each(R.spriteTextures, function(value, key, obj) {
      var textureName = key.split('.')[0];
      var imageModifiers = _.reduce(value.imageModifiers, function(acc, num) { return acc | num; }, 0);
      if (true) {
        loadList.push( _.bind( this.loadImage, this, 'res/' + textureName + '.png', obj[key], R.IMG_ORIGINAL, onResourceLoad) );
      }
      if (imageModifiers & R.IMG_FLIPX) {
        loadList.push( _.bind( this.loadImage, this, 'res/' + textureName + '-x.png', obj[key], R.IMG_FLIPX, onResourceLoad) );
      }
      if (imageModifiers & R.IMG_PINK) {
        loadList.push( _.bind( this.loadImage, this, 'res/' + textureName + '-pink.png', obj[key], R.IMG_PINK, onResourceLoad) );
      }
      if (imageModifiers & (R.IMG_PINK | R.IMG_FLIPX)) {
        loadList.push( _.bind( this.loadImage, this, 'res/' + textureName + '-pink-x.png', obj[key], R.IMG_PINK | R.IMG_FLIPX, onResourceLoad) );
      }
      if (imageModifiers & R.IMG_CYAN) {
        loadList.push( _.bind( this.loadImage, this, 'res/' + textureName + '-cyan.png', obj[key], R.IMG_CYAN, onResourceLoad) );
      }
      if (imageModifiers & (R.IMG_CYAN | R.IMG_FLIPX)) {
        loadList.push( _.bind( this.loadImage, this, 'res/' + textureName + '-cyan-x.png', obj[key], R.IMG_CYAN | R.IMG_FLIPX, onResourceLoad) );
      }
      if (imageModifiers & (R.IMG_PINK | R.IMG_CYAN)) {
        loadList.push( _.bind( this.loadImage, this, 'res/' + textureName + '-wacky.png', obj[key], R.IMG_PINK | R.IMG_CYAN, onResourceLoad) );
      }
      if (imageModifiers & (R.IMG_PINK | R.IMG_CYAN | R.IMG_FLIPX)) {
        loadList.push( _.bind( this.loadImage, this, 'res/' + textureName + '-wacky-x.png', obj[key], R.IMG_PINK | R.IMG_CYAN | R.IMG_FLIPX, onResourceLoad) );
      }
    }, this);
    
    return loadList;
  },
  
  loadImage: function(filepath, obj, key, onLoad) {
    var img    = new Image();
    img.onload = onLoad;
    img.src    = filepath + '?' + BUILD_DATE; // attempt to avoid caching between builds
    obj[key]   = img;
  },
  
  loadAudio: function(filepath, quantity, obj, key, onLoad) {
    var audio = document.createElement('audio');
    var listener = audio.addEventListener('canplaythrough', function (e) {
      this.removeEventListener('canplaythrough', listener, false)
      onLoad();
    }, false);
    audio.addEventListener('error', function (ev) {
      alert('audio error loading ' + filepath + '.' + ResourceManager.audioFormat);
      console.log(ev)
    }, false);
    audio.autobuffer = true;
    audio.preload    = 'auto';
    audio.src        = filepath + '.' + ResourceManager.audioFormat;
    //onLoad();
    audio.load();
    audio.setAttribute('name', key);
    obj[key] = [ audio ];
    for ( var i = 0; i < quantity - 1; i += 1 ) {
      obj[key].push( audio.cloneNode(true) );
    }
  },
  
  /*
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
  */
  
};

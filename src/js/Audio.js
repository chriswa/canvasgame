var Audio = {
  
  play: function(filename) {
    if (App.isMobile) { return undefined; }
    if (!App.audioEnabled) { return undefined; }
    var samples = R.sfx[filename];
    for (var i = 0; i < samples.length; i += 1) {
      var sample = samples[i];
      if (sample.paused || sample.ended) {
        sample.currentTime = 0;
        sample.play();
        return sample;
      }
    }
    samples[0].pause();
    samples[0].currentTime = 0.1; // force the next line to seek!
    samples[0].currentTime = 0;
    samples[0].play();
    return samples[0];
  },
  
  toggleAudio: function() {
    $('#toggleAudio').children().toggle();
    App.audioEnabled = !App.audioEnabled;
    if (App.audioEnabled) {
      if (this.currentMusicFilename) { this.playMusic(this.currentMusicFilename); }
    }
    else {
      this._stopMusic();
    }
  },
  
  cached: {},
  currentlyPlaying: undefined,
  currentMusicFilename: undefined,
  _stopMusic: function() {
    if (this.currentlyPlaying) {
      this.currentlyPlaying.pause();
      this.currentlyPlaying = undefined;
    }
  },
  stopMusic: function() {
    this.currentMusicFilename = undefined;
    this._stopMusic();
  },
  playMusic: function(filename) {
    if (filename === this.currentMusicFilename) { return; } // don't restart if already playing
    this.currentMusicFilename = filename; // store this even if !App.audioEnabled
    if (App.isMobile) { return; }
    if (!App.audioEnabled) { return; }
    var that = this;
    
    this._stopMusic();
    
    var cached = this.cached[filename];
    if (cached) {
      if (this.currentlyPlaying === cached.audio) { return; } // don't restart music
      cached.audio.currentTime = 0;
      cached.audio.play();
      that.currentlyPlaying = cached.audio;
      return;
    }
    
    var audio = document.createElement('audio');
    audio.addEventListener('error', function (ev) {
      console.log("audio error: " + ev)
    }, false);
    
    // loop
    audio.addEventListener('ended', function(){
      console.log('ended');
      audio.currentTime = 0;
      audio.play();
    }, false);
    
    audio.autobuffer = true;
    audio.preload    = 'auto';
    audio.src        = 'res/music/' + filename + '.' + ResourceManager.audioFormat;
    
    // play now
    audio.play();
    this.currentlyPlaying = audio;
    
    this.cached[filename] = { audio: audio };
  },
  pauseMusic: function() {
    if (App.isMobile) { return; }
    if (!App.audioEnabled) { return; }
    if (this.currentlyPlaying) {
      this.currentlyPlaying.pause();
    }
  },
  unpauseMusic: function() {
    if (App.isMobile) { return; }
    if (!App.audioEnabled) { return; }
    if (this.currentlyPlaying) {
      this.currentlyPlaying.play();
    }
  },
  restartMusic: function() {
    if (App.isMobile) { return; }
    if (!App.audioEnabled) { return; }
    if (this.currentlyPlaying) {
      this.currentlyPlaying.currentTime = 0;
      this.currentlyPlaying.play();
    }
  }
  
};

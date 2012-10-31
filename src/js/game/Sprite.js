var Sprite = {
  
  uniqueId: null,
  readyToCull: false,
  groups: null,
  
  characterName: null,
  animation: null,
  animationName: '',
  texture: null,
  slice: null,
  frameIndex: null,
  frameDelayRemaining: 0,
  imageModifier: R.IMG_ORIGINAL,
  x: 0.0,
  y: 0.0,
  vx: 0.0,
  vy: 0.0,
  
  // support for fixed-step updates
  FIXED_STEP: 1000 / 60,
  simTime: 0,
  age: 0,
  
  drawOffsetX: 0,
  drawOffsetY: 0,
  
  init: function(characterName) {
    this.uniqueId = getUniqueId();
    this.groups = [];
    this.setAnimationCharacter(characterName);
    this.startAnimation(_.keys(R.spriteCharacters[this.characterName].sequences)[0]); // start arbitrary animation so the object is in a healthy state, ready to be rendered
    this.advanceAnimation(0);
  },
  
  // support for fixed-step updates
  update: function(dt) {
    this.simTime += dt;
    while (this.simTime >= this.FIXED_STEP) {
      this.updateFixedStep(this.FIXED_STEP);
      this.simTime -= this.FIXED_STEP;
      this.age++;
    }
  },
  
  destroy: function() {
    var self = this;
    _.each(this.groups, function(group) {
      delete group.collection[self.uniqueId];
    });
  },
  
  render: function(ox, oy) {
    var slice = this.slice;
    var frame = this.animation.frames[this.frameIndex];
    if (!slice || !frame || this.imageModifier === -1) { return; } 
    
    var x = Math.round( this.x + this.drawOffsetX );
    var y = Math.round( this.y + this.drawOffsetY );
    
    var t = this.texture[this.imageModifier];
    
    if (this.imageModifier & R.IMG_FLIPX) {
      CANVAS_CTX.drawImage(t, this.texture[1].width - slice[0] - slice[2], slice[1], slice[2], slice[3], x - frame.x_flipped - ox, y + frame.y - oy, slice[2], slice[3]);
    }
    else {
      CANVAS_CTX.drawImage(t, slice[0], slice[1], slice[2], slice[3], x - frame.x - ox, y + frame.y - oy, slice[2], slice[3]);
    }
  },
  
  
  addToGroup: function(group) {
    group.collection[this.uniqueId] = this;
    this.groups.push(group);
  },
  
  setAnimationCharacter: function(characterName) {
    if (!R.spriteCharacters[characterName]) { throw new Error("setAnimationCharacter: characterName unknown: " + characterName); }
    this.characterName = characterName;
    this.texture       = R.spriteTextures[R.spriteCharacters[this.characterName].image];
  },
  startAnimation: function(animationName) {
    this.animationName = animationName;
    this.animation = R.spriteCharacters[this.characterName].sequences[this.animationName];
    if (!this.animation) { throw new Error("Sprite: character " + this.characterName + " has no animation named " + this.animationName); }
    this.frameIndex = 0;
    this.frameDelayRemaining = this.animation.frames[this.frameIndex].duration;
  },
  playAnimation: function(animationName) {
    if (this.animationName !== animationName) {
      this.startAnimation(animationName);
    }
  },
  
  // this should be called from update code
  advanceAnimation: function(dt) {
    this.frameDelayRemaining -= dt;
    while (this.frameDelayRemaining < 0) {
      
      // provide an optional event for sprites
      if (this.onAnimationFrameAdvance) {
        this.onAnimationFrameAdvance(this.animationName, this.frameIndex);
      }
      
      this.frameIndex++;
      if (this.frameIndex === this.animation.frames.length) {
        if (this.animation.loop) {
          this.frameIndex = 0;
        }
        else {
          this.frameIndex--;
          this.frameDelayRemaining = Infinity;
        }
      }
      this.frameDelayRemaining += this.animation.frames[this.frameIndex].duration;
    }
    this.slice = R.spriteSlices[R.spriteCharacters[this.characterName].image][this.animation.frames[this.frameIndex].slice];
  },

  // this may be safely called from anywhere
  kill: function() {
    this.readyToCull = true;
  },
  
};

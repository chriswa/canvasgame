var Sprite = {
  
  uniqueId: null,
  alive: true,                    // when set to false, this Sprite is ready to be culled by SpriteGroup.cull()!
  groups: null,
  
  facing: 1,                      // 1 = right, -1 = left and X_FLIP the sprite
  characterName: null,
  animation: null,
  animationName: '',
  texture: null,
  slice: null,
  frameIndex: null,
  frameDelayRemaining: 0,
  x: 0.0,
  y: 0.0,
  vx: 0.0,
  vy: 0.0,
  
  // support for fixed-step updates
  FIXED_STEP: 1000 / 60,
  simTime: 0,
  age: 0,
  
  // lifecycle
  // =========
  
  // initialize animation system (all derived classes must call this with {{BaseClass}}.init.call(this, characterName, animationName);)
  init: function(characterName, animationName) {
    this.uniqueId = getUniqueId();
    this.groups = [];
    if (!characterName) { throw new Error("Sprite.init expects an animation characterName"); }
    this.setAnimationCharacter(characterName, animationName);
  },
  
  // end this Sprite's existence. this may be safely called at any time
  kill: function() {
    this.alive = false;
  },
  
  // _destroy should only be called by SpriteGroup.cull()!
  // clean up all SpriteGroup references
  // NOTE: Sprite-derived classes should instead call kill() and wait for SpriteGroup owner to cull
  _destroy: function() {
    var self = this;
    _.each(this.groups, function(group) {
      delete group.collection[self.uniqueId];
    });
    this.groups = [];
  },
  
  // add ourselves to a SpriteGroup
  addToGroup: function(group) {
    group.collection[this.uniqueId] = this;
    this.groups.push(group);
  },
  
  // support for fixed-step updates (calls updateFixedStep every FIXED_STEP dt that passes)
  update: function(dt) {
    this.simTime += dt;
    while (this.simTime >= this.FIXED_STEP) {
      this.updateFixedStep(this.FIXED_STEP);
      this.simTime -= this.FIXED_STEP;
      this.age++;
    }
  },
  
  // animation
  // =========
  
  // called from init, set the animation character (and optionally animation sequence)
  setAnimationCharacter: function(characterName, animationName) {
    if (!R.spriteCharacters[characterName]) { console.trace(); throw new Error("setAnimationCharacter: characterName unknown: " + characterName); }
    this.characterName = characterName;
    this.texture       = R.spriteTextures[R.spriteCharacters[this.characterName].image];
    
    // start an animation so we are ready to be rendered (if animationName wasn't supplied, pick an arbitrary one)
    if (!animationName) { animationName = _.keys(R.spriteCharacters[this.characterName].sequences)[0]; }
    this.startAnimation(animationName);
  },
  
  // start or restart an animation sequence
  startAnimation: function(animationName) {
    this.animationName = animationName;
    this.animation = R.spriteCharacters[this.characterName].sequences[this.animationName];
    if (!this.animation) { throw new Error("Sprite: character " + this.characterName + " has no animation named " + this.animationName); }
    this.frameIndex = 0;
    this.frameDelayRemaining = this.animation.frames[this.frameIndex].duration;
    this.advanceAnimation(0);
  },
  
  // start an animation sequence, but not if it's already playing
  playAnimation: function(animationName) {
    if (this.animationName !== animationName) {
      this.startAnimation(animationName);
    }
  },
  
  // advance the current animation forward by dt (this should be usually called from update code)
  advanceAnimation: function(dt) {
    this.frameDelayRemaining -= dt;
    while (this.frameDelayRemaining <= 0) {
      
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
          
          // provide an optional event for sprites
          if (this.onAnimationComplete) {
            this.onAnimationComplete(this.animationName, this.frameIndex);
          }
          
        }
      }
      this.frameDelayRemaining += this.animation.frames[this.frameIndex].duration;
    }
    this.slice = R.spriteSlices[R.spriteCharacters[this.characterName].image][this.animation.frames[this.frameIndex].slice];
  },
  
  // render the current animation frame, optionally with "colour", flipping horizontally if this.facing is -1
  render: function(ox, oy, colour) {
    if (!colour) { colour = 0; }
    if (colour < 0 || colour > 3) { throw new Error('Invalid colour'); }
    
    var slice = this.slice;
    var frame = this.animation.frames[this.frameIndex];
    if (!slice || !frame) { throw new Error('Invalid slice or frame'); } 
    
    var x = Math.round( this.x );
    var y = Math.round( this.y );
    
    var im = (colour << 1) | (this.facing === -1 ? R.IMG_FLIPX : 0);
    var t = this.texture[im];
    
    if (this.facing === -1) {
      CANVAS_CTX.drawImage(t, this.texture[1].width - slice[0] - slice[2], slice[1], slice[2], slice[3], x - frame.x_flipped - ox, y + frame.y - oy, slice[2], slice[3]);
    }
    else {
      CANVAS_CTX.drawImage(t, slice[0], slice[1], slice[2], slice[3], x - frame.x - ox, y + frame.y - oy, slice[2], slice[3]);
    }
  },

};

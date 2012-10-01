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
  
  init: function(characterName) {
    this.uniqueId = getUniqueId();
    this.groups = [];
    this.addToGroup(Game.allEntities);
    this.setAnimationCharacter(characterName);
    this.startAnimation(_.keys(R.animationGroups[this.characterName].sequences)[0]); // start arbitrary animation so the object is in a healthy state
  },
  destroy: function() {
    var self = this;
    _.each(this.groups, function(group) {
      delete group.collection[self.uniqueId];
    });
  },
  addToGroup: function(group) {
    group.collection[this.uniqueId] = this;
    this.groups.push(group);
  },
  
  setAnimationCharacter: function(characterName) {
    this.characterName = characterName;
    this.texture       = R.images[R.animationGroups[this.characterName].image];
  },
  startAnimation: function(animationName) {
    this.animationName = animationName;
    this.animation = R.animationGroups[this.characterName].sequences[this.animationName];
    this.frameIndex = 0;
    this.frameDelayRemaining = this.animation.frames[this.frameIndex].duration;
  },
  playAnimation: function(animationName) {
    if (this.animationName !== animationName) {
      this.startAnimation(animationName);
    }
  },
  advanceAnimation: function() {
    this.frameDelayRemaining--;
    if (this.frameDelayRemaining === 0) {
      this.frameIndex++;
      if (this.frameIndex === this.animation.frames.length) {
        if (this.animation.loop) {
          this.frameIndex = 0;
        }
        else {
          this.frameIndex--;
        }
      }
      this.frameDelayRemaining = this.animation.frames[this.frameIndex].duration;
    }
    this.slice = R.imageSlices[R.animationGroups[this.characterName].image][this.animation.frames[this.frameIndex].slice];
  },
  
  update: function() {
    this.advanceAnimation();
    this.oldX = this.prevX;
    this.oldY = this.prevY;
    this.prevX = this.x;
    this.prevY = this.y;
  },
  render: function(stepInterpolation) {
    var slice = this.slice;
    var frame = this.animation.frames[this.frameIndex];
    if (!slice || !frame || this.imageModifier === -1) { return; } 
    
    // deal with stepInterpolation
    if (this.oldX === undefined) { this.oldX = this.x; this.oldY = this.y; }
    var x = Math.round( this.x * stepInterpolation + this.oldX * (1-stepInterpolation) );
    var y = Math.round( this.y * stepInterpolation + this.oldY * (1-stepInterpolation) );
    
    var t = this.texture[this.imageModifier];
    
    if (this.imageModifier & R.IMG_FLIPX) {
      ctx.drawImage(t, this.texture[1].width - slice[0] - slice[2], slice[1], slice[2], slice[3], x - frame.x_flipped - Game.area.renderOffsetX, y + frame.y - Game.area.renderOffsetY, slice[2], slice[3]);
    }
    else {
      ctx.drawImage(t, slice[0], slice[1], slice[2], slice[3], x - frame.x - Game.area.renderOffsetX, y + frame.y - Game.area.renderOffsetY, slice[2], slice[3]);
    }
  },
  
  kill: function() {
    this.readyToCull = true;
  },
};

var PlayerSprite = Object.extend(PhysicsSprite, {
  
  // physics things
  //gravity: 1.6, // more than other things!
  facing: 1,
  hitbox: { x1: 4, y1: 4, x2: 28, y2: 64, STANDING_Y1: 4, CROUCHING_Y1: 14 }, // sprite is 0, 0, 32, 64
  JUMP_IMPULSE: 11,
  JUMP_IMPULSE_RUN_COMPONENT: 0,
  JUMP_EXTRA_TIMER: 15,
  JUMP_EXTRA_INCR: 0.5,
  JUMP_EXTRA_RUN_COMPONENT: 0.03,
  JUMP_X_INCR: 0.4,
  JUMP_X_DECAY: 0.95,
  WALK_INCR: 0.8,
  WALK_DECAY: 0.9,
  IDLE_DECAY: 0.8,
  HURT_TIME: 12,
  HURT_INVINCIBLE_TIME: 45,
  hurtTimer: 0,
  invincibleTimer: 0,
  jumpTimer: 999,
  isAirborne: true,
  isWalking: false,
  framesSinceTouchingBottom: 99,
  isAttacking: false,
  isCrouching: false,
  attackTimer: 0,
  
  //
  init: function() {
    PhysicsSprite.init.call(this, 'link');
    this.reset();
  },
  
  // 
  reset: function() {
    this.hurtTimer = 0;
    this.invincibleTimer = 0;
    this.jumpTimer = 999;
    this.isAirborne = true;
    this.isWalking = false;
    this.framesSinceTouchingBottom = 99;
    this.isAttacking = false;
    this.isCrouching = false;
    this.attackTimer = 0;
    this.startAnimation('stand');
  },
  
  // 
  collideWithEnemy: function(enemy) {
    if (this.invincibleTimer === 0) {
      Game.player.health -= 1;
      this.hurtTimer = this.HURT_TIME;
      this.invincibleTimer = this.HURT_INVINCIBLE_TIME;
      this.playAnimation('hurt');
      this.vx = this.facing * -2;
      this.vy = -5;
      this.isAttacking = false;
    }
  },
  
  // 
  update: function() {
    
    $('#playerX' ).text(this.x.toFixed(2));
    $('#playerY' ).text(this.y.toFixed(2));
    $('#playerVX').text(this.vx.toFixed(2));
    $('#playerVY').text(this.vy.toFixed(2));

    // 
    if (this.invincibleTimer > 0) {
      this.invincibleTimer--;
    }
    
    // if you're hurt, you can't do anything at all (even change your facing)
    if (this.hurtTimer > 0) {
      this.hurtTimer--;
    }
    
    else {
    
      // player can always change their facing
      if      (Input.keyDown.left)  { this.facing = -1;  }
      else if (Input.keyDown.right) { this.facing =  1; }
      
      // just landed from a jump/fall
      if (this.isAirborne && this.touchingBottom) {
        this.isAirborne = false;
        this.startAnimation('stand');
        this.isAttacking = false;
      }
      
      // unintentionally falling
      if (!this.isAirborne && !this.touchingBottom) {
        this.isAirborne = true;
        this.jumpTimer = 999; // prevent "jump extra" effects
      }
      
      // start attack?
      if (Input.keyPressed.attack && !this.isAttacking) {
        this.isAttacking = true;
        this.isCrouching = Input.keyDown.down && !this.isAirborne;
        if (this.isCrouching) {
          this.startAnimation('crouch-attack');
        }
        else {
          this.startAnimation('attack');
        }
        this.attackTimer = 0;
      }
      
      // attack >:D
      if (this.isAttacking) {
        if (this.isCrouching) {
          this.updateCrouchingAttack();
        }
        else {
          this.updateUprightAttack();
        }
        this.updateInAir();
        if (this.touchingBottom) { this.vx = 0; }
      }
      
      // horizontal controls (different behaviour depending on whether we're on the ground)
      else {
        if (this.touchingBottom) { this.updateOnGround(); }
        else                     { this.updateInAir(); }
      }
      
      // allow jump if on ground or recently on ground
      if (Input.keyPressed.jump && this.framesSinceTouchingBottom < 5) {
        this.hitbox.y1 = this.hitbox.STANDING_Y1; // stop crouching if necessary
        this.vy = -this.JUMP_IMPULSE - (Math.abs(this.vx) * this.JUMP_IMPULSE_RUN_COMPONENT);
        this.framesSinceTouchingBottom = 99; // prevent a second jump!
        this.isAirborne = true;
        this.jumpTimer = 0;
        this.playAnimation('jump');
      }
      
    }
    
    this.imageModifier = (this.facing === 1) ? R.IMG_ORIGINAL : R.IMG_FLIPX;
    
    // call overridden method (physics and animation)
    PhysicsSprite.update.call(this);
    
    //
    if (this.outOfBounds) {
      var p = this;
      // find an overlapping area exit object
      _.each(Game.area.exits, function(exitObject) {
        var exitHitbox = exitObject.hitbox;
        if (p.x + p.hitbox.x2 > exitHitbox.x1 && p.x + p.hitbox.x1 < exitHitbox.x2 && p.y + p.hitbox.y2 > exitHitbox.y1 && p.y + p.hitbox.y1 < exitHitbox.y2) {
          Game.queueAreaTransition(exitObject);
        }
      });
      if (!Game.areaTransition) { console.log("Player is out of bounds, but no exitObject could be found!"); }
    }
    
    //
    if (this.hurtTimer > 0) {
      if (this.hurtTimer % 8 < 2) {
        this.imageModifier |= R.IMG_PINK;
      }
      else if (this.hurtTimer % 8 < 4) {
        this.imageModifier |= R.IMG_CYAN;
      }
      else if (this.hurtTimer % 8 < 6) {
        this.imageModifier |= R.IMG_PINK | R.IMG_CYAN;
      }
    }
    else if (this.invincibleTimer % 2 !== 0) {
      this.imageModifier = -1;
    }
  },
  updateUprightAttack: function() {
    this.attackTimer++;
    //if (this.attackTimer > 15) {
    if (this.frameIndex === 2) {
      this.isAttacking = false;
      return;
    }
    
    //if (this.attackTimer > 5 && this.attackTimer <= 10) {
    if (this.frameIndex === 1) {
      var absHitbox = { x1: this.x + this.facing*32, y1: this.y + 18, x2: this.x + 32 + this.facing*32, y2: this.y + 28 };
      Game.handlePlayerAttack(absHitbox);
    }
  },
  updateCrouchingAttack: function() {
    this.attackTimer++;
    //if (this.attackTimer > 15) {
    if (this.frameIndex === 2) {
      this.isAttacking = false;
      return;
    }
    
    //if (this.attackTimer <= 5) {
    if (this.frameIndex === 0) {
      var absHitbox = { x1: this.x + this.facing*32, y1: this.y + 38, x2: this.x + 32 + this.facing*32, y2: this.y + 48 };
      Game.handlePlayerAttack(absHitbox);
    }
  },
  updateOnGround: function() {
    this.framesSinceTouchingBottom = 0;
    
    // press down to crouch
    if (Input.keyDown.down) {
      this.vx = this.vx * this.IDLE_DECAY;
      this.playAnimation('crouch');
      this.hitbox.y1 = this.hitbox.CROUCHING_Y1;
    }
    else {
      this.hitbox.y1 = this.hitbox.STANDING_Y1;
      
      // walk left or right?
      if (Input.keyDown.left) {
        this.vx *= this.WALK_DECAY;
        this.vx -= this.WALK_INCR;
        this.playAnimation('walk');
      }
      else if (Input.keyDown.right) {
        this.vx *= this.WALK_DECAY;
        this.vx += this.WALK_INCR;
        this.playAnimation('walk');
      }
      
      // if you're not walking then you're standing
      else {
        this.vx *= this.IDLE_DECAY;
        if (this.animationName !== 'attack' && Math.abs(this.vx) < 0.5) { this.startAnimation('stand'); }
      }
    }
  },
  updateInAir: function() {
    this.framesSinceTouchingBottom++;
    this.jumpTimer++;
    
    // holding jump for longer makes you go a little higher
    if (Input.keyDown.jump && this.jumpTimer < this.JUMP_EXTRA_TIMER) {
      this.vy -= this.JUMP_EXTRA_INCR + (Math.max(4, Math.abs(this.vx)) * this.JUMP_EXTRA_RUN_COMPONENT);
    }
    
    // horizontal jump control
    if (Input.keyDown.left) {
      this.vx *= this.JUMP_X_DECAY;
      this.vx -= this.JUMP_X_INCR;
    }
    else if (Input.keyDown.right) {
      this.vx *= this.JUMP_X_DECAY;
      this.vx += this.JUMP_X_INCR;
    }
    else {
      this.vx *= this.JUMP_X_DECAY;
    }
  },
});

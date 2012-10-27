var PlayerSprite = Object.extend(PhysicsSprite, {
  
  // vars
  // ====
  
  // important
  hitbox:  { x1: -12, y1: -30, x2: 12, y2: 30, STANDING_Y1: -30, CROUCHING_Y1: -20 }, // sprite is 0, 0, 32, 64
  facing:  1, // values: 1, -1
  
  // timers
  hurtTimer:        0,
  invincibleTimer:  0,
  frozenTimer:      0,
  fallStopwatch:    9999,
  
  // flags
  isAirborne:   true,
  isAttacking:  false,
  isCrouching:  false,
  
  //
  collectEntityHandle: undefined,
  
  // physics constants
  GRAVITY:          0.00400,
  JUMP_IMPULSE:     0.60000,
  JUMP_HOLD_BOOST:  0.00150,
  JUMP_X_BOOST:     0.00065,
  WALK_ACCEL:       0.00250,
  WALK_DECEL:       0.00100,
  AIR_ACCEL:        0.00120,
  MAX_X_SPEED:      0.20000,
  HURT_IMPULSE_X:   0.15000,
  HURT_IMPULSE_Y:   0.40000,
  
  // misc constants
  HURT_TIME:             400,
  HURT_INVINCIBLE_TIME:  1500,
  JUMP_GRACE_TIME:       50,
  
  // init
  // ====
  
  init: function(area) {
    PhysicsSprite.init.call(this, area, 'link');
    this.startAnimation('stand');
    this.JUMP_X_BOOST /= this.MAX_X_SPEED; // XXX: decouple this constant for simpler tweaking
  },
  
  // collision handler
  // =================
  
  onCollisionWithEnemy: function(entity) {
    
    // if it's collectable, collect it!
    if (entity.isCollectable) {
      entity.isCollectable = false;
      entity.onPlayerCollision(this);
      entity.onComplete();
      return;
    }
    
    // if it's blockable with the shield, try to block it
    if (entity.isBlockable) {
      
      // shield must be at the right height to block something
      var shieldCenterY = this.y   + (this.isCrouching ? 18 : -18);
      var entityCenterY = entity.y;
      var shieldAtRightHeight = (Math.abs(entityCenterY - shieldCenterY) < 20);
      
      // if you're facing towards its midpoint, you can deflect it
      var playerCenterX = this.x   + (this.hitbox.x1  + this.hitbox.x2) / 2;
      var entityCenterX = entity.x + (entity.hitbox.x1 + entity.hitbox.x2) / 2;
      var directionTowardEntity = entityCenterX > playerCenterX ? 1 : -1;
      var facingEntity = (this.facing === directionTowardEntity);
      
      // if you're facing against the direction of its motion, you can deflect it (just in case it tunnels into you from your shield-side!)
      var facingAgainstMotion = (sign(entity.vx) !== this.facing);
      
      if (shieldAtRightHeight && (facingEntity || facingAgainstMotion)) {
        App.sfx.play('AOL_Deflect');
        entity.onBlock();
      }
    }
    
    // if it's dangerous and we're not invincible, we get hurt
    if (entity.isDangerous && this.invincibleTimer <= 0) {
      Game.player.health -= 1;
      this.isAttacking     = false;
      this.hurtTimer       = this.HURT_TIME;
      this.invincibleTimer = this.HURT_INVINCIBLE_TIME;
      if (this.frozenTimer <= 0) {
        this.playAnimation('hurt');
        this.vx = this.facing * -this.HURT_IMPULSE_X;
        this.vy = -this.HURT_IMPULSE_Y;
      }
      if (Game.player.health <= 0) {
        App.sfx.play('AOL_Die');
      }
      else {
        App.sfx.play('AOL_Hurt');
      }
      
      // tell the entity it hurt us (e.g. fireballs will want to kill themselves)
      entity.onPlayerCollision(this);
    }
  },
  
  // update
  // ======
  
  update: function(dt) {
    
    // use acceleration vector for integrating velocity (for better-quality variable time-stepping)
    this.ax = 0;
    this.ay = this.GRAVITY;
    
    // update timers
    if (this.invincibleTimer > 0) { this.invincibleTimer -= dt; }
    if (this.hurtTimer > 0) { this.hurtTimer -= dt; }
    if (this.frozenTimer > 0) {
      this.frozenTimer -= dt;
      if (this.frozenTimer <= 0 && this.collectEntityHandle) { this.collectEntityHandle.kill(); this.collectEntityHandle = undefined; }
    }
    
    // if you're hurt or collecting something, you can't do anything at all (even change your facing)
    if (this.hurtTimer <= 0 && this.frozenTimer <= 0) {
      
      // if you're dead after your hurtTimer expires, die!
      if (Game.player.health <= 0) {
        Game.queuePlayerDeath();
        return;
      }
      
      // player can always change their facing, even during an attack (except when hurt)
      if      (Input.gamepad.held.left)  { this.facing = -1;  }
      else if (Input.gamepad.held.right) { this.facing =  1; }
      
      // just landed from a jump/fall?
      if (this.isAirborne && this.touching.bottom) {
        this.isAirborne  = false;
        this.isAttacking = false;
        this.startAnimation('stand');
      }
      
      // unintentionally falling?
      if (!this.isAirborne && !this.touching.bottom) {
        this.isAirborne = true;
      }
      
      // start attack?
      if (Input.gamepad.pressed.attack && !this.isAttacking) {
        this.area.currentAttackSfx = App.sfx.play('AOL_Sword');
        this.isAttacking = true;
        this.isCrouching = Input.gamepad.held.down && !this.isAirborne;
        if (this.isCrouching) { this.startAnimation('crouch-attack'); }
        else                  { this.startAnimation('attack');        }
      }
      
      // try to jump?
      if (Input.gamepad.pressed.jump) {
        this.tryToJump();
      }
      
      // attack in progress?
      if (this.isAttacking) {
        if (this.isCrouching) { this.updateCrouchingAttack(); }
        else                  { this.updateUprightAttack();   }
        
        // unless we're in the air, attacking stops all movement instantly
        if (this.touching.bottom) { this.vx = 0; }
      }
      
      // horizontal controls (different behaviour depending on whether we're on the ground)
      else {
        if (this.touching.bottom) { this.updateOnGround(dt); }
        else                      { this.updateInAir(dt);    }
      }
      
    }
    
    // move and animate! (if we're not frozen!)
    if (this.frozenTimer <= 0) {
      
      // move sprite
      this.integrateAndTranslate(dt);
      
      // check for lava
      if (Game.player.health > 0 && this.tilesTouched[ Area.physicsTileTypes.LAVA ]) {
        App.sfx.play('AOL_Die');
        Game.player.health = 0;
        this.playAnimation('hurt');
        //this.frozenTimer = 1000;
        this.hurtTimer = 1000;
        this.invincibleTimer = 1000;
        this.vx = 0;
        this.vy = 0.015;
        this.GRAVITY = 0;
      }
      
      // update animation
      this.advanceAnimation( dt );
    }
    
    // check for area transitions
    if (this.touching.outOfBounds) {
      this.area.findAndQueuePlayerExit();
    }
    
    // visual effects (hurting and invincibility)
    this.applyVisualEffects();
    
    //if (this.debugStartJumpY) {
    //  this.debugHighestY = Math.min(this.debugHighestY, this.y);
    //  $('#playerY' ).text(((this.debugStartJumpY - this.debugHighestY)/32).toFixed(2));
    //}
  },
  
  tryToJump: function() {
    // allow jump if on ground or recently on ground
    if (this.fallStopwatch < this.JUMP_GRACE_TIME && !this.isAttacking) {
      
      // stop crouching?
      this.isCrouching = false;
      this.hitbox.y1   = this.hitbox.STANDING_Y1;
      
      // jump!
      this.vy             = -this.JUMP_IMPULSE;
      this.isAirborne     = true;
      this.touching.bottom = false;
      this.fallStopwatch  = 9999; // invalidate fallStopwatch (also prevents a double-jump)
      this.playAnimation('jump');
      //this.debugStartJumpY = this.debugHighestY = this.y;
    }
  },
  
  updateOnGround: function(dt) {
    this.fallStopwatch = 0;
    
    // press down to crouch
    this.isCrouching = Input.gamepad.held.down;
    if (this.isCrouching) {
      
      // if below a certain threshold of speed, full stop
      if (Math.abs(this.vx) < 0.01) {
        this.vx = 0;
      }
      // otherwise, decelerate
      else {
        this.ax = -this.WALK_DECEL * sign(this.vx);
      }
      
      this.playAnimation('crouch');
      this.hitbox.y1 = this.hitbox.CROUCHING_Y1;
    }
    else {
      this.hitbox.y1 = this.hitbox.STANDING_Y1;
      
      // walk left or right
      if (Input.gamepad.held.left && !Input.gamepad.held.right) {
        this.ax = -this.WALK_ACCEL;
        this.playAnimation('walk');
      }
      else if (Input.gamepad.held.right && !Input.gamepad.held.left) {
        this.ax = this.WALK_ACCEL;
        this.playAnimation('walk');
      }
      // decelerate
      else {
        // if below a certain threshold of speed, full stop
        if (Math.abs(this.vx) < 0.01) {
          this.vx = 0;
        }
        // otherwise, decelerate
        else {
          this.ax = -this.WALK_DECEL * sign(this.vx);
        }
        if (this.animationName !== 'attack' && Math.abs(this.vx) < 0.5) { this.startAnimation('stand'); }
      }
    }
  },
  
  updateInAir: function(dt) {
    this.fallStopwatch += dt;
    
    // jump boosts (y)
    if (this.vy < 0) {
      
      // running jumps go higher
      this.ay -= Math.abs(this.vx) * this.JUMP_X_BOOST;
      
      // hold jump for higher jump (diminished gravity during ascent)
      if (Input.gamepad.held.jump) {
        this.ay -= this.JUMP_HOLD_BOOST;
      }
      
    }
    
    // air control (x)
    if (Input.gamepad.held.left && !Input.gamepad.held.right) {
      this.ax = -this.AIR_ACCEL;
    }
    else if (Input.gamepad.held.right && !Input.gamepad.held.left) {
      this.ax = this.AIR_ACCEL;
    }
    
  },
  
  integrateAndTranslate: function(dt) {
    // integrate
    var deltaX = this.vx * dt + 0.5 * this.ax * dt * dt;
    var deltaY = this.vy * dt + 0.5 * this.ay * dt * dt;
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
    
    // clamp maximum walking speed
    this.vx = clamp(-this.MAX_X_SPEED, this.vx, this.MAX_X_SPEED);
    
    // also clamp delta
    deltaX = clamp(-this.MAX_X_SPEED * dt, deltaX, this.MAX_X_SPEED * dt);
    
    // move sprite
    this.translateWithTileCollisions( deltaX, deltaY );
    if (this.touching.bottom || this.touching.top)   { this.vy = 0; }
    if (this.touching.left   || this.touching.right) { this.vx = 0; }
  },
  
  // attacking
  // ---------
  
  updateUprightAttack: function() {
    if (this.frameIndex === 2) {
      this.isAttacking = false;
      return;
    }
    if (this.frameIndex === 1) {
      var absHitbox = { x1: this.x + this.facing*24 - 24, y1: this.y - 16, x2: this.x + this.facing*24 + 24, y2: this.y - 6 };
      this.area.handlePlayerAttack(absHitbox);
    }
  },
  
  updateCrouchingAttack: function() {
    if (this.frameIndex === 2) {
      this.isAttacking = false;
      return;
    }
    if (this.frameIndex === 0) {
      var absHitbox = { x1: this.x + this.facing*24 - 24, y1: this.y + 4, x2: this.x + this.facing*24 + 24, y2: this.y + 14 };
      this.area.handlePlayerAttack(absHitbox);
    }
  },
  
  // visual
  // ------
  
  applyVisualEffects: function() {
    
    // flip sprite if facing left
    this.imageModifier = (this.facing === 1) ? R.IMG_ORIGINAL : R.IMG_FLIPX;
    
    // flash colours if hurting
    var f = 1000 / 30;
    if (this.hurtTimer > 0) {
      if (this.hurtTimer % 4*f < 1*f) {
        this.imageModifier |= R.IMG_PINK;
      }
      else if (this.hurtTimer % 4*f < 2*f) {
        this.imageModifier |= R.IMG_CYAN;
      }
      else if (this.hurtTimer % 4*f < 3*f) {
        this.imageModifier |= R.IMG_PINK | R.IMG_CYAN;
      }
    }
    
    // flash transparent if invincible
    else if (this.invincibleTimer > 0 && this.invincibleTimer % 4*f < 2*f) {
      this.imageModifier = -1;
    }
  },
  
  // misc
  // ====
  
  poseWithItem: function(entity) {
    
    // move player down onto ground in case they grabbed this thing mid-jump
    this.translateWithTileCollisions( 0, 32 );
    
    if (this.collectEntityHandle) { this.collectEntityHandle.kill(); }
    this.collectEntityHandle = entity;
    entity.isCollectable = false;
    entity.x = this.x;
    entity.y = this.y - 66 + entity.hitbox.y2;
    
    this.playAnimation('collect');
    this.advanceAnimation( 0 );
    this.frozenTimer = 1000;
    this.vx = 0;
    this.vy = 0;
  },
  
});

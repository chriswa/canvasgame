var PlayerSprite = Object.extend(PhysicsSprite, {
  
  // vars
  // ====
  
  // important
  hitbox:  { x1: 4, y1: 4, x2: 28, y2: 64, STANDING_Y1: 4, CROUCHING_Y1: 14 }, // sprite is 0, 0, 32, 64
  facing:  1, // values: 1, -1
  
  // timers
  hurtTimer:        0,
  invincibleTimer:  0,
  fallStopwatch:    9999,
  
  // flags
  isAirborne:   true,
  isAttacking:  false,
  isCrouching:  false,
  
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
  JUMP_GRACE_TIME:       100,
  
  // init
  // ====
  
  init: function() {
    PhysicsSprite.init.call(this, 'link');
    this.startAnimation('stand');
    this.JUMP_X_BOOST /= this.MAX_X_SPEED; // XXX: decouple this constant for simpler tweaking
  },
  
  // collision handler
  // =================
  
  onCollisionWithEnemy: function(enemy) {
    
    // if it's collectable, collect it!
    if (enemy.isCollectable) {
      //this.collect(enemy);
      enemy.onPlayerCollision();
      enemy.kill();
      if (enemy.onCompleted) { enemy.onCompleted(); }
      return;
    }
    
    // if it's blockable with the shield, try to block it
    if (enemy.isBlockable && !this.isAttacking) {
      
      // shield must be at the right height to block something
      var shieldCenterY = this.y + (this.isCrouching ? 52 : 16);
      var enemyCenterY  = enemy.y + (enemy.hitbox.y1 + enemy.hitbox.y2) / 2;
      var shieldAtRightHeight = (Math.abs(enemyCenterY - shieldCenterY) < 20);
      
      // if you're facing towards its midpoint, you can deflect it
      var playerCenterX = this.x  + (this.hitbox.x1  + this.hitbox.x2) / 2;
      var enemyCenterX  = enemy.x + (enemy.hitbox.x1 + enemy.hitbox.x2) / 2;
      var directionTowardEnemy = enemyCenterX > playerCenterX ? 1 : -1;
      var facingEnemy = (this.facing === directionTowardEnemy);
      
      // if you're facing against the direction of its motion, you can deflect it (just in case it tunnels into you from your shield-side!)
      var facingAgainstMotion = (sign(enemy.vx) !== this.facing);
      
      if (shieldAtRightHeight && (facingEnemy || facingAgainstMotion)) {
        enemy.onBlock();
      }
    }
    
    // if it's dangerous and we're not invincible, we get hurt
    if (enemy.isDangerous && this.invincibleTimer <= 0) {
      Game.player.health -= 1;
      this.isAttacking     = false;
      this.hurtTimer       = this.HURT_TIME;
      this.invincibleTimer = this.HURT_INVINCIBLE_TIME;
      this.playAnimation('hurt');
      this.vx = this.facing * -this.HURT_IMPULSE_X;
      this.vy = -this.HURT_IMPULSE_Y;
      
      // tell the enemy it hurt us (e.g. fireballs will kill themselves)
      enemy.onPlayerCollision();
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
    if (this.hurtTimer > 0)       { this.hurtTimer -= dt; }
    
    // if you're hurt, you can't do anything at all (even change your facing)
    if (this.hurtTimer <= 0) {
      
      // if you're dead after your hurtTimer expires, die!
      if (Game.player.health <= 0) {
        Game.gameover();
      }
      
      // player can always change their facing, even during an attack (except when hurt)
      if      (Input.keyDown.left)  { this.facing = -1;  }
      else if (Input.keyDown.right) { this.facing =  1; }
      
      // just landed from a jump/fall?
      if (this.isAirborne && this.touchingBottom) {
        this.isAirborne  = false;
        this.isAttacking = false;
        this.startAnimation('stand');
      }
      
      // unintentionally falling?
      if (!this.isAirborne && !this.touchingBottom) {
        this.isAirborne = true;
      }
      
      // start attack?
      if (Input.keyPressed.attack && !this.isAttacking) {
        this.isAttacking = true;
        this.isCrouching = Input.keyDown.down && !this.isAirborne;
        if (this.isCrouching) { this.startAnimation('crouch-attack'); }
        else                  { this.startAnimation('attack');        }
      }
      
      // try to jump?
      if (Input.keyPressed.jump) {
        this.tryToJump();
      }
      
      // attack in progress?
      if (this.isAttacking) {
        if (this.isCrouching) { this.updateCrouchingAttack(); }
        else                  { this.updateUprightAttack();   }
        this.updateInAir();                                                                         // ??? WTF
        
        // unless we're in the air, attacking stops all movement instantly
        if (this.touchingBottom) { this.vx = 0; }
      }
      
      // horizontal controls (different behaviour depending on whether we're on the ground)
      else {
        if (this.touchingBottom) { this.updateOnGround(dt); }
        else                     { this.updateInAir(dt);    }
      }
      
    }
    
    // move sprite
    this.integrateAndTranslate(dt);
    
    // update animation
    this.advanceAnimation( dt );
    
    // check for area transitions
    this.checkForAreaTransitions();
    
    // visual effects (hurting and invincibility)
    this.applyVisualEffects();
    
    // 
    //$('#playerX' ).text(this.x.toFixed(2));
    //$('#playerY' ).text(this.y.toFixed(2));
    
    if (this.debugStartJumpY) {
      this.debugHighestY = Math.min(this.debugHighestY, this.y);
      $('#playerY' ).text(((this.debugStartJumpY - this.debugHighestY)/32).toFixed(2));
    }
    $('#playerVX').text(this.vx.toFixed(2));
    $('#playerVY').text(this.vy.toFixed(2));
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
      this.touchingBottom = false;
      this.fallStopwatch  = 9999; // invalidate fallStopwatch (also prevents a double-jump)
      this.playAnimation('jump');
      this.debugStartJumpY = this.debugHighestY = this.y;
    }
  },
  
  updateOnGround: function(dt) {
    this.fallStopwatch = 0;
    
    // press down to crouch
    this.isCrouching = Input.keyDown.down;
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
      if (Input.keyDown.left && !Input.keyDown.right) {
        this.ax = -this.WALK_ACCEL;
        this.playAnimation('walk');
      }
      else if (Input.keyDown.right && !Input.keyDown.left) {
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
      if (Input.keyDown.jump) {
        this.ay -= this.JUMP_HOLD_BOOST;
      }
      
    }
    
    // air control (x)
    if (Input.keyDown.left && !Input.keyDown.right) {
      this.ax = -this.AIR_ACCEL;
    }
    else if (Input.keyDown.right && !Input.keyDown.left) {
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
    
    // move sprite
    this.translateWithTileCollisions( deltaX, deltaY );
    if (this.touchingBottom || this.touchingTop)   { this.vy = 0; }
    if (this.touchingLeft   || this.touchingRight) { this.vx = 0; }
  },
  
  // attacking
  // ---------
  
  updateUprightAttack: function() {
    if (this.frameIndex === 2) {
      this.isAttacking = false;
      return;
    }
    if (this.frameIndex === 1) {
      var absHitbox = { x1: this.x + this.facing*32, y1: this.y + 18, x2: this.x + 32 + this.facing*32, y2: this.y + 28 };
      Game.handlePlayerAttack(absHitbox);
    }
  },
  
  updateCrouchingAttack: function() {
    if (this.frameIndex === 2) {
      this.isAttacking = false;
      return;
    }
    if (this.frameIndex === 0) {
      var absHitbox = { x1: this.x + this.facing*32, y1: this.y + 38, x2: this.x + 32 + this.facing*32, y2: this.y + 48 };
      Game.handlePlayerAttack(absHitbox);
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
    else if (this.invincibleTimer > 0 && this.invincibleTimer % 2*f < 1*f) {
      this.imageModifier = -1;
    }
  },
  
  // misc
  // ----
  
  checkForAreaTransitions: function() {
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
  },
  
});

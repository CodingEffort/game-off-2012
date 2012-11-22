/**
 * game_entities.js
 * Jesse Emond
 * 13/11/2012

  The file where the main entities/helper functions are. This is where the base parts are.
  For items specific to the gameplay-specific entities, see the player/enemies files for components
  using the entity ones. See game.js for the actual gameplay.
 **/

// Represents an image that will reset up the screen once it reached the bottom
// Use 2 of those to create a vertical scrolling background
Crafty.c("ScreenScrolldown", {
    init: function() {
        this.bind("EnterFrame", function() {
            this.y += 5;
            if (this.y >= SCREEN_H)
                this.y = -SCREEN_H;
        });
        
    }
});


Crafty.c("FadeIn", {
  init: function() {
    this._fadeInSpeed = 0;
    this.requires("2D");
    this.bind("EnterFrame", this._updateFadeIn);
  },
  _updateFadeIn: function() {
    if (this._fadeInSpeed !== 0) {
      this.alpha = Math.min(this.alpha + this._fadeInSpeed, 1.0);
      if (this.alpha > 0.95) {
          this.unbind("EnterFrame", this._updateFadeIn);
      }
    }
  },
  fadeIn: function(speed) {
      this.alpha = 0.0;
      this._fadeInSpeed = speed;
      return this;
  }
});

// Represents a fadeout effect, that destroys the entity after the effect is done.
Crafty.c("FadeOut", {
    init: function() {
        this._fadeOutSpeed = 0;
        this.requires("2D");
        this.bind("EnterFrame", this._updateFadeOut);
    },
    _updateFadeOut: function() {
      if (this._fadeOutSpeed !== 0) {
        this.alpha = Math.max(this.alpha - this._fadeOutSpeed, 0.0);
        if (this.alpha < 0.05) {
            this.destroy();
        }
      }
    },
    fadeOut: function(speed) {
        this._fadeOutSpeed = speed;
        return this;
    }
});


// Represents a general projectile, such as a player bullet or an enemy one. It is destroyed when it goes out of the screen
// and moves every frame.
Crafty.c("Projectile", {
    init: function() {
        this.requires("NotifyWhenOutOfScreen, 2D, Canvas, Collision")
          .attr({z:50});

        this.destroyedOnContact = true;
        this.allowRotation = true;

        this.bind("EnterFrame", function() {
            this.x += this.moveX * this.speed;
            this.y += this.moveY * this.speed;
        });

        this.bind("OutOfScreen", function() {
            this.destroy();
        });
    },
    setAllowRotation: function(allowRotation) {
      this.allowRotation = allowRotation; return this;
    },
    setDamage: function(dmg) {
        this.damage = dmg;
        return this;
    },
    setAngle: function(angle) {
        if (this.allowRotation) this.rotation = angle;
        else angle = 0;

        this.moveX = Math.cos(toRadians(this.rotation));
        this.moveY = Math.sin(toRadians(this.rotation));
        return this;
    },
    setSpeed: function(speed) {
        this.speed = speed;
        return this;
    },
    setIsDestroyedOnContact: function(destroyedOnContact) {
      this.destroyedOnContact = destroyedOnContact;
      return this;
    }
});

// Converts an angle in degrees to its radians equivalent.
function toRadians(deg) {
    return deg * Math.PI / 180.0;
}

// Component that triggers a "OutOfScreen" event when it goes too far off of screen.
Crafty.c("NotifyWhenOutOfScreen", {
    init: function() {
        this.bind("EnterFrame", function() {
            if (this.x + this.w * 2 < 0 ||
                this.y + this.h * 2 < 0 ||
                this.x - this.w * 2 > SCREEN_W ||
                this.y - this.h * 2 > SCREEN_H)
            {
                this.trigger("OutOfScreen");
            }
        });
    }
});

// Makes a component that follows a path specified by a mathematical function that returns the y based on a x.
Crafty.c("FollowPath", {
    _path: function(x) { return x; },
    _deltaT: 0,
    init: function() {
        this.requires("NotifyWhenOutOfScreen");

        this.deltaT = 0;
        this.showRotation = true;

        this.bind("EnterFrame", function() {
            var newPos = this.path(this.deltaT);
            var rect = this.mbr();
            this.x = newPos.x + rect._w / 2;
            this.y = newPos.y + rect._h / 2;

            this.deltaT += this.speedModificator;

            // find the orientation that we should have based on our next position
            if (this.showRotation)
            {
                var nextPos = this.path(this.deltaT);
                this.rotation = Crafty.math.radToDeg(Math.atan2(nextPos.y - newPos.y, nextPos.x - newPos.x));
            }
        });
        this.bind("OutOfScreen", function () {
            this.destroy();
        });
    },
    followPath: function(func, speedModificator) { this.path = func; this.speedModificator = speedModificator; return this; },
    allowRotation: function(allow) { this.showRotation = allow; return this; },
    alwaysKeepRotation: function(rot) { this.allowRotation(false); this.bind("EnterFrame", function() { this.rotation = rot; }); return this; },
    alwaysLookDown: function() { return this.alwaysKeepRotation(90); },
    rotateEveryFrame: function(amount) { this.allowRotation(false); this.bind("EnterFrame", function() { this.rotation += amount; }); }
});

Crafty.c("HasHealth", {
  init: function() {
    this.health = 0;
    this.maxHealth = 0;
  },
  setMaxHealth: function(amount) {
    this.maxHealth = amount;
    this.health = this.maxHealth;
    return this;
  },
  hurt: function(amount) {
    this.hurtAmount = amount;
    this.trigger("Hurt");
    this.health -= amount;
    this.health = Crafty.math.clamp(this.health, 0, this.maxHealth);
    if (this.health === 0)
    {
      this.trigger("Dead");
      this.destroy();
    }
  }

});

// Represents a living entity, with health, that can die and explode.
Crafty.c("Living", {
    init: function() {
        this.requires("HasHealth, 2D, Canvas, Sprite")
          .attr({z:100});
        this.isPlayer = false;

        this.bind("Hurt", function() {
          var rect = this.mbr();
          Crafty.e("HurtFeedback")
            .showDamage(this.hurtAmount)
            .setIsImportant(this.isPlayer)
            .attr({x:rect._x + rect._w/2, y:rect._y});
        });

        this.bind("Dead", function() {
          
        });
    },
    setIsPlayer: function(isPlayer) {
      this.isPlayer = isPlayer;
      return this;
    },
    explode: function(explosionComponent) {
      var rect = this.mbr();
      var explosion = explosionComponent.attr({z:9000});
      explosion.x = rect._x + rect._w/2 - explosion.w/2;
      explosion.y = rect._y + rect._h/2 - explosion.h/2;
    }
});

// Component that shows the current health value of a living entity.
Crafty.c("HealthBar", {
    init: function() {
        this.barYOffset = 0;
        this.hpBarColor = null;
        this.barFollow = this;

        this.bar = Crafty.e("2D, Canvas, Text")
          //.textFont({weight: 'bold', family:'Arial', size:'12px'})
          .textColor("#FFFFFF")
          .attr({z:10000});

        this.bind("Change", function() {
            var rect = this.barFollow.mbr();
            this.bar.x = rect._x + rect._w/2 - this.bar.w/2;
            this.bar.y = rect._y + rect._h + 20 + this.barYOffset;
        });

        this.bind("EnterFrame", function() {
            var displayHP = Math.floor(this.health);
            if (displayHP < 1 && displayHP > 0) displayHP=1; // don't show 0 when it's 0.xxxx
            this.bar.text(displayHP);
            if (this.hpBarColor === null)
            {
                var percent = this.health / this.maxHealth;
                if (percent >= 0.7)
                    this.bar.textColor("#00FF00");
                else if (percent >= 0.3)
                    this.bar.textColor("#FFFF00");
                else
                    this.bar.textColor("#FF0000");
            }
        });

        this.bind("Remove", function() {
            this.bar.destroy();
        });
    },
    setHpBarYOffset: function(yOffset) {
      this.barYOffset = yOffset;
      return this;
    },
    setHpBarFollow: function(entity) {
      this.barFollow = entity;
      return this;
    },
    setHpBarColor: function(color) {
      this.hpBarColor = color;
      this.bar.textColor(color);
      return this;
    }
});

Crafty.c("HurtFeedback", {
  init: function() {
    this.requires("2D, Canvas, Text, FadeOut")
      .textColor("#FF0000")
      .attr({z:10000})
      .fadeOut(0.03);
    this.dirX = Crafty.math.randomNumber(-1.0, 1.0);
    this.velY = -3;
    this.bind("EnterFrame", function() {
      this.x += this.dirX*2;
      this.y += this.velY;
      this.velY += 0.3;
    });
  },
  setIsImportant: function(isImportant) {
    if (isImportant)
    {
      //this.textFont({weight:'bold', family:'Arial', size:'12px'});
      this.textColor("#FFFFFF");
    }
    else
    {
      //this.textFont({weight:'bold', family:'Arial', size:'12px'});
      this.textColor("#FF0000");
    }
    return this;
  },
  showDamage: function(amount) {
    this.text("-" + Math.floor(amount));
    return this;
  }
});

Crafty.c("FadedOutAnimation", {
    init: function() {
        this.requires("2D, Canvas, SpriteAnimation, FadeOut")
            .fadeOut(0.05);
    }
});

Crafty.c("Explosion", {
    init: function() {
        this.requires("FadedOutAnimation, explosion")
            .animate('explosion', 3, 12, 7)
            .animate('explosion', 10, 0);
    }
});

Crafty.c("Implosion", {
    init: function() {
        this.requires("FadedOutAnimation, teleport")
            .animate('teleport', 0, 13, 4)
            .animate('teleport', 10, 0);
    }
});

Crafty.c("ParralaxBackground", {
    init: function() {
        this.requires("2D, Canvas, space, ScreenScrolldown");
    }
});

// General gun used by the enemies
Crafty.c("Gun", {
    init: function() {
        this.damage = 0;
        this.projectileName = null;
        this.shootDelay = 0;
        this.shootAngles = [0];
        this.xDeltas = [0];
        this.isUnique = false;
    },
    setDamage: function(dmg) {
        this.damage = dmg; return this;
    },
    setProjectileType: function(projectile) {
        this.projectileName = projectile; return this;
    },
    setShootDelay: function(shootDelay) {
        this.shootDelay = shootDelay; return this;
    },
    // Used to fire more than one projectile at a time. E.g. to fire 3 in a cone: setProjectilesAngleDeltas([-5,0,5]), will shoot ahead along
    // with 2 on the sides with a 5 degrees angle difference.
    setProjectilesAngleDeltas: function(angles) {
        this.shootAngles = angles; return this;
    },
    // Used to fire more than one projectile at a time, starting at different X positions. E.g. to fire 2 parrallel: setProjectilesXDeltas([-3,3]), will
    // shoot ahead 2 shots parrallel to each other.
    setProjectilesXDeltas: function(deltas) {
        this.xDeltas = deltas; return this;
    },
    setUnique: function(isUnique) {
        this.isUnique = isUnique; return this;
    }
});
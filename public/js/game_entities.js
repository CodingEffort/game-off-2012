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
        this.attr({z:-100});
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
            var b = this.mbr();
            var OUT_MULT = 3;
            if (b._x + OUT_MULT*b._w < 0 ||
                b._y + OUT_MULT*b._h < 0 ||
                b._x - (OUT_MULT-1)*b._w > SCREEN_W ||
                b._y - (OUT_MULT-1)*b._h > SCREEN_H)
            {
              this.trigger("OutOfScreen");
            }
        });
    }
});

// Makes a component that follows a path specified by a mathematical function that returns the y based on a x.
Crafty.c("FollowPath", {
    _path: function(x) { return x; },
    init: function() {
        this.requires("NotifyWhenOutOfScreen, Tween");

        this.hpchanged = true;
        this.showRotation = true;

        this.bind("EnterFrame", function() {
            var newPos = this.path((dT - this.dTStart) * this.speedModificator);
            var rect = this.mbr();
            this.x = newPos.x + rect._w / 2;
            this.y = newPos.y + rect._h / 2;

            // find the orientation that we should have based on our next position
            if (this.showRotation)
            {
                var nextPos = this.path((dT + 1 - this.dTStart) * this.speedModificator);
                var targetAngle = Crafty.math.radToDeg(Math.atan2(nextPos.y - newPos.y, nextPos.x - newPos.x));
                this.tween({rotation: targetAngle}, 5);
            }
        });
        /*
        this.bind("OutOfScreen", function () {
            this.trigger("KillMe");
        });
        */
    },
    setDeltaTStart: function(deltaT) { this.dTStart = deltaT; return this; },
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
    this.framesSinceHpPushed = 0;

    this.bind("EnterFrame", function() {
      if (this.hpchanged && this.framesSinceHpPushed >= 15) {
            this.framesSinceHpPushed = 0;
            this.hpchanged = false;
            this.trigger("SyncLife");
        }
        ++this.framesSinceHpPushed;
    });
  },
  setMaxHealth: function(amount) {
    this.maxHealth = amount;
    this.setHealth(this.maxHealth);
    return this;
  },
  setHealth: function(amount) {
    this.health = amount;
    this.health = Crafty.math.clamp(this.health, 0, this.maxHealth);
    this.trigger("HealthChanged");
  },
  hurt: function(amount) {
    this.hurtAmount = amount;
    this.trigger("Hurt");
    this.hpchanged = true;
    if (this.health > 0 && amount >= this.health) // this will kill us
      this.trigger("WillDie");
    this.setHealth(this.health - amount);
    
    if (this.health === 0)
    {
      this.trigger("Dead");
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

        this.bar = Crafty.e("2D, Canvas, SpriteText")
          .attr({z:10000});

        this.setHpBarFont("HighHealthFont");
        this.hpBarColor = null;
        
        this.bind("Change", function() {
            var rect = this.barFollow.mbr();
            this.bar.x = rect._x + rect._w/2 - this.bar.w/2;
            this.bar.y = rect._y + rect._h + 20 + this.barYOffset;
        });

        this.bind("HealthChanged", function() {
            var displayHP = Math.floor(this.health);
            if (displayHP < 1 && displayHP > 0) displayHP=1; // don't show 0 when it's 0,14901249
            var hpStr = displayHP.toString();
            this.bar.text(hpStr);
            this.bar.attr({w: hpStr.length * this.bar.FONT_SIZE, h: this.bar.FONT_SIZE});
            if (this.hpBarColor === null)
            {
                var percent = this.health / this.maxHealth;
                var desiredFont;
                if (percent >= 0.7)
                    desiredFont = "HighHealthFont";
                else if (percent >= 0.5)
                    desiredFont = "NormalHealthFont";
                else if (percent >= 0.3)
                    desiredFont = "LowHealthFont";
                else
                    desiredFont = "CriticalHealthFont";

                if (desiredFont !== this.bar.oldFont)
                {
                  this.setHpBarFont(desiredFont);
                }

                this.hpBarColor = null;
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
    setHpBarFont: function(font) {
      this.hpBarColor = font;
      var bar = this.bar;
      this.bar.FONT_SIZE = 8;
      var fontPath;
      if (font === "HighHealthFont") fontPath = "assets/FontHighHealth.png";
      else if (font === "NormalHealthFont") fontPath = "assets/FontNormalHealth.png";
      else if (font === "LowHealthFont") fontPath = "assets/FontLowHealth.png";
      else if (font === "CriticalHealthFont") fontPath = "assets/FontCriticalHealth.png";
      else if (font === "ShieldHealthFont") fontPath = "assets/FontShieldHealth.png";
      else throw "Invalid font.";

      Crafty.load([fontPath], function() {
        bar.registerFont(font, bar.FONT_SIZE, fontPath);

        bar.font(font);
        bar.oldFont = font;
      });

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
            .crop(2,4,46,43)
            .animate('explosion', 3, 12, 7)
            .animate('explosion', 10, 0);
    }
});

Crafty.c("Implosion", {
    init: function() {
        this.requires("FadedOutAnimation, teleport")
            .crop(2,4,46,43)
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

Crafty.c("Boss", {
  init: function() {
    this.requires("Enemy, BossHealthBar");
  }
});

Crafty.c("BossHealthBar", {
  init: function() {
    this.bg = Crafty.e("2D, Canvas, bosshealthbarbg")
      .crop(22,0,1,1);
    this.fill = Crafty.e("2D, Canvas, bosshealthbarfill")
      .crop(23,0,1,1);

    var SCREEN_H_SPACE = 0.8;
    var BG_OFFSET = 2;
    this.fill.w = 10;
    this.bg.w = this.fill.w + BG_OFFSET*2;
    this.fill.h = SCREEN_H_SPACE * SCREEN_H;
    this.bg.h = this.fill.h + BG_OFFSET*2;

    this.fill.x = 10;
    this.bg.x = this.fill.x - BG_OFFSET;

    this.fill.y = (1.0 - SCREEN_H_SPACE) * SCREEN_H / 2;
    this.bg.y = this.fill.y - BG_OFFSET;

    var bg = this.bg;
    var bossTxtText = "BOSS";
    this.bossTxt = Crafty.e("2D, Canvas, SpriteText")
      .text(bossTxtText);
    var FONT_PATH = "assets/FontCriticalHealth.png";
    var FONT_SIZE = 8;
    var bossTxt = this.bossTxt;
    Crafty.load([FONT_PATH], function () {
      bossTxt.registerFont("FontCriticalHealth", FONT_SIZE, FONT_PATH)
        .font("FontCriticalHealth")
        .attr({x: bg.x, y: bg.y - bossTxt.h - 12, w: bossTxtText.length * FONT_SIZE, h:FONT_SIZE});
    });

    var fullFillY = this.fill.y;
    var fullFillH = this.fill.h;

    this.bind("Remove", function() {
      this.fill.destroy();
      this.bg.destroy();
      this.bossTxt.destroy();
    });

    this.bind("HealthChanged", function() {
      var percent = this.health / this.maxHealth;
      this.fill.h = fullFillH * percent;
      this.fill.y = fullFillY + fullFillH - this.fill.h;
    });
  }
});

Crafty.c("CentralMessage", {
  init: function() {
    this.requires("2D, Canvas, FadeOut")
      .attr({z:10000});
    this.timeout(this.startFade, 1500);
  },
  center: function() {
    var b = this.mbr();
    this.x = SCREEN_W/2 - b._w/2;
    this.y = SCREEN_H/2 - b._h/2;
  },
  startFade: function() {
    this.fadeOut(0.05);
  }
});

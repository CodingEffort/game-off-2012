/**
 * player.js
 * Jesse Emond
 * 13/11/2012

 Holds the definitions directly related to the player, such as weaponery, projectiles and such.
 **/

 // Main spaceship object
Crafty.c("Spaceship", {
    init: function() {
        this.requires("2D, Canvas, ship, SpriteColor, Living, Tween, Collision, HealthBar")
            .setMaxHealth(100)
            .setIsPlayer(true)
            .crop(0,0,35,35)
            .attr({z:this.z+10})
            .collision(new Crafty.circle(this.w/2,this.h/2,this.w*0.4));
        this.canShoot = true;
        this.powerups = {};
        this.playerID = null;
        this.cash = 0;
        this.shooting = false;
        this.shootingUniqueWeapon = false;
        this.overlay = Crafty.e("2D, Canvas, shipoverlay")
            .attr({alpha: 0.9, z:this.z+1});

        this.bind("EnterFrame", function() {
            if (this.shooting) {
                this.shoot();
            }
            else
                this.unshoot();
        });

        this.bind("Change", function() {
            this.overlay.attr({x: this.x, y: this.y});
        });

        this.bind("Remove", function() {
            for (var powerup in this.powerups)
                this.powerups[powerup].destroy();
            if (this.gun !== undefined && this.gun.isUnique && this.shootingUniqueWeapon)
                this.removeUniqueAmmosShotByUs();
            this.overlay.destroy();
        });
    },
    setPlayerColor: function(color)
    {
        this.spriteColor(color, 1);
    },
    setGun: function(gunName) {
        if (this.gun !== undefined && this.gun.isUnique && this.shootingUniqueWeapon)
            this.removeUniqueAmmosShotByUs();

        var gun = Crafty.e(gunName);
        var firstGun  = this.gun === undefined;
        this.gun = gun;
        this.shooting = false;
        return this;
    },
    removeUniqueAmmosShotByUs: function() {
        this.uniqueAmmoShot.fadeOut(0.3);
    },
    reload: function() {
        this.canShoot = false;

        this.timeout(function() {
            this.canShoot = true;
        }, this.gun.shootDelay);
    },
    unshoot: function() {
        if (this.gun.isUnique && this.shootingUniqueWeapon)
            this.removeUniqueAmmosShotByUs();
        this.shootingUniqueWeapon = false;
    },
    shoot: function() {
        if (this.canShoot) {
            if (this.shootingUniqueWeapon)
            {
                return;
            }

            this.shootingUniqueWeapon = this.gun.isUnique;
            var bounds = this.mbr();
            for (var i = 0; i < Math.max(this.gun.xDeltas.length, this.gun.shootAngles.length); ++i) {
                var pew = Crafty.e(this.gun.projectileName);

                if (this.gun.isUnique)
                {
                    this.uniqueAmmoShot = pew;
                }


                pew.owner = this;
                pew.setDamage(this.gun.damage);
                var pewBounds = pew.mbr();
                var relPewPos;
                if (pew.allowRotation)
                {
                    pew.setAngle(-90 + (this.gun.shootAngles[i] || 0));//shoot upwards
                    var angleRad = toRadians(pew.rotation);
                    var noRotX = bounds._w/2 - pewBounds._w/2;
                    var noRotY = -pewBounds._h/2;
                    var noRotationPewPos = new Crafty.math.Vector2D(noRotX, noRotY);

                    var rotMat = new Crafty.math.Matrix2D();
                    rotMat.rotate(angleRad);
                    relPewPos = rotMat.apply(noRotationPewPos);
                }
                else
                {
                    relPewPos = new Crafty.math.Vector2D(-pewBounds._w/2, -bounds._h/2 - pewBounds._h/2);
                }

                var thisCenterX = bounds._x + bounds._w/2;
                var thisCenterY = bounds._y + bounds._h/2;

                pew.x = thisCenterX + relPewPos.x + (this.gun.xDeltas[i] || 0);
                pew.y = thisCenterY + relPewPos.y;


                pew.collision().onHit("Enemy", onLazorHitEnemy);
            }
            this.reload();
        }
    },
    gainCash: function(amount) {
        this.cash += amount;
        this.trigger("CashChanged");
    },
    setCash: function(amount) {
        this.cash = amount;
        this.trigger("CashChanged");
    },
    setPlayerID: function(playerID) {
        this.playerID = playerID;
        return this;
    }
});

// Represents a player pewpew
Crafty.c("PlayerPewpew", {
    init: function() {
        this.requires("Projectile");
        return this;
    }
});

/**
 * player.js
 * Jesse Emond
 * 13/11/2012

 Holds the definitions directly related to the player, such as weaponery, projectiles and such.
 **/

 // Main spaceship object
Crafty.c("Spaceship", {
    _shooting: false,

    init: function() {
        this.requires("2D, Canvas, ship, Living, HealthBar, Tween")
            .setMaxHealth(100)
            .setIsPlayer(true)
            .crop(0,0,35,35);
        this.canShoot = true;
        this.powerups = {};
        this.playerID = -1;
        this.cash = 0;

        this.bind("EnterFrame", function() {
            if (this.shooting) {
                this.shoot();
            }
        });

        this.bind("Remove", function() {
            console.log(this.powerups);
            for (var powerup in this.powerups)
                this.powerups[powerup].destroy();
        });
    },
    setGun: function(gunName) {
        var gun = Crafty.e(gunName);
        var firstGun  = this.gun === undefined;
        this.gun = gun;
        if (firstGun && this.gun.shootDelay >= 0)
            this.timeout(this.shoot, this.gun.shootDelay);
        return this;
    },
    reload: function() {
        this.canShoot = false;

        this.timeout(function() {
            this.canShoot = true;
        }, this.gun.shootDelay);
    },
    shoot: function() {
        if (this.canShoot) {
            for (var angleDiff in this.gun.shootAngles) {
                var pew = Crafty.e(this.gun.projectileName);
                pew.owner = this;
                pew.collision()
                    .onHit("Enemy", onLazorHitEnemy)
                    .setDamage(this.gun.damage);
                // Spawn it above the player's center, to shoot them pewpews
                pew.x = this.x + this.w/2 - pew.w/2;
                pew.y = this.y - this.h/2 - 0.3*pew.h;
                pew.setAngle(this.gun.shootAngles[angleDiff]);
            }
            this.reload();
        }
    },
    gainCash: function(amount) {
        this.cash += amount;
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
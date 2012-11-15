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
        this.weapon = "PlayerPewPewFastLazor";
        this.powerups = {};
        this.playerID = 0;

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
    reload: function() {
        this.canShoot = false;

        this.timeout(function() {
            this.canShoot = true;
        }, getReloadSpeed(this.weapon));
    },
    shoot: function() {
        if (this.canShoot) {
            var pew = Crafty.e(this.weapon)
                .collision()
                .onHit("Enemy", onLazorHitEnemy);
            // Spawn it above the player's center, to shoot them pewpews
            pew.x = this.x + this.w/2 - pew.w/2;
            pew.y = this.y - this.h/2 - 0.3*pew.h;
            this.reload();
        }
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

// Returns the reaload speed of a certain weapon.
function getReloadSpeed(weapon) {
    if (weapon === "PlayerPewPewLazor")
        return 150;
    else if (weapon === "PlayerPewPewFastLazor")
        return 50;
    else
        throw("Weapon '" + weapon + "' is not implemented while getting its reload speed.");
}

// Represents the weapon machinegun pewpew
Crafty.c("PlayerPewPewFastLazor", {
    init: function() {
        this.requires("PlayerPewpew, pewpewlazors")
            .crop(7,0,3,12)
            .setAngle(0)
            .setSpeed(16)
            .setDamage(3);
    }
});

// Represents the first weapon pewpew
Crafty.c("PlayerPewPewLazor", {
    init: function() {
        this.requires("PlayerPewpew, pewpewlazors")
            .crop(3,0,4,34)
            .setAngle(0)
            .setSpeed(15)
            .setDamage(10);
    }
});
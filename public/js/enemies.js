/**
 * enemies.js
 * Jesse Emond
 * 13/11/2012
 Holds the enemy definitions of the gameplay.
 **/

 // Main enemy component
Crafty.c("Enemy", {
    init: function() {
        this.requires("FollowPath, 2D, Canvas, Collision, Living")
            .origin("center");
    },
    setGun: function(gunName) {
        var gun = Crafty.e(gunName);
        var firstGun  = this.gun === undefined;
        this.gun = gun;
        if (firstGun && this.gun.shootDelay >= 0)
            this.timeout(this.shoot, this.gun.shootDelay);
        return this;
    },
    shoot: function() {
        if (this.health > 0) { // we're alive
            for (var angleDiff in this.gun.shootAngles) {
                // shoot the ammo
                var pew = Crafty.e(this.gun.projectileName)
                    .collision()
                    .onHit("Spaceship", onProjectileHitPlayer)
                    .setDamage(this.gun.damage);
                pew.x = this.x + this.w/2 - pew.w/2;
                pew.y = this.y + this.h;
                pew.setAngle(90 + this.rotation + this.gun.shootAngles[angleDiff]);
            }

            this.timeout(this.shoot, this.gun.shootDelay);
        }
    }
});

// General enemy projectile.
Crafty.c("EnemyProjectile", {
    init: function() {
        this.requires("Projectile");
    }
});

// General gun used by the enemies
Crafty.c("Gun", {
    init: function() {
        this.damage = 0;
        this.projectileName = null;
        this.shootDelay = 0;
        this.shootAngles = [0];
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
    }
});



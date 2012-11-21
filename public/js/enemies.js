/**
 * enemies.js
 * Jesse Emond
 * 13/11/2012
 Holds the enemy definitions of the gameplay.
 **/

 // Main enemy component
Crafty.c("Enemy", {
    init: function() {
        this.requires("FollowPath, 2D, Canvas, Collision, Living");
    },
    setGun: function(gunName) {
        var gun = Crafty.e(gunName);
        var firstGun  = this.gun === undefined;
        this.gun = gun;
        if (firstGun && this.gun.shootDelay >= 0)
            this.timeout(this.shoot, this.gun.shootDelay);

        this.origin("center");
        return this;
    },
    shoot: function() {
        if (this.health > 0 && this.gun !== undefined && this.gun.projectileName !== undefined) { // we're alive
            for (var angleDiff in this.gun.shootAngles) {
                // shoot the ammo
                var pew = Crafty.e(this.gun.projectileName);

                if (pew.setDamage === undefined)
                {
                    return;
                }

                pew
                    .setDamage(this.gun.damage)
                    .collision()
                    .onHit("Spaceship", onProjectileHitPlayer);
                var bounds = this.mbr();
                var angleRad = toRadians(this.rotation);
                pew.x = bounds._x + bounds._w/2 + Math.cos(angleRad) * bounds._w/2 - pew.w/2;
                pew.y = bounds._y + bounds._h/2 + Math.sin(angleRad) * bounds._h/2 - pew.h/2;
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
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

        this.removed = false;
        this.bind("Remove", function() {
            this.removed = true;
        });
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
        if (!this.removed && this.health > 0 && this.gun !== undefined && this.gun.projectileName !== undefined) { // we're alive
            for (var angleDiff in this.gun.shootAngles) {
                // shoot the ammo
                var pew = Crafty.e(this.gun.projectileName);

                if (pew.setDamage === undefined)
                {
                    return;
                }

                pew.owner = this;
                pew.setDamage(this.gun.damage)
                    .collision()
                    .onHit("Spaceship", onProjectileHitPlayer);
                pew.setAngle(this.rotation + this.gun.shootAngles[angleDiff]);
                var bounds = this.mbr();
                var pewBounds = pew.mbr();
                var angleRad = toRadians(this.rotation);
                var noRotX = bounds._w/2 - pewBounds._w/2;
                var noRotY = -pewBounds._h/2;
                var noRotationPewPos = new Crafty.math.Vector2D(noRotX, noRotY);

                var rotMat = new Crafty.math.Matrix2D();
                rotMat.rotate(angleRad);
                var relPewPos = rotMat.apply(noRotationPewPos);

                var thisCenterX = bounds._x + bounds._w/2;
                var thisCenterY = bounds._y + bounds._h/2;

                pew.x = thisCenterX + relPewPos.x;
                pew.y = thisCenterY + relPewPos.y;

/*console.log("rel " + relX + ", " + relY);
console.log("c " + thisCenterX + ", " + thisCenterY);
console.log(pew.x + " , " + pew.y);
                console.log(bounds);
console.log(pew.mbr());
throw "hello";*/
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
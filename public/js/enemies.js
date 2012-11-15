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
    setShootDelay: function(delay) {
        this.shootDelay = delay;
        this.timeout(this.shoot, this.shootDelay);
        return this;
    },
    shoot: function() {
        if (this.health > 0) {
            // shoot the ammo
            var pew = Crafty.e(this.projectileName)
                .collision()
                .onHit("Spaceship", onProjectileHitPlayer);
            pew.x = this.x + this.w/2 - pew.w/2;
            pew.y = this.y + this.h;
            this.timeout(this.shoot, this.shootDelay);
        }
    },
    setProjectileType: function(projectileName) {
        this.projectileName = projectileName;
        return this;
    }
});

// General enemy projectile.
Crafty.c("EnemyPewPew", {
    init: function() {
        this.requires("Projectile");
    }
});

// The projectile of the patrol enemy.
Crafty.c("PatrolPewPew", {
	init: function() {
        this.requires("EnemyPewPew, enemypewpew")
            .setDamage(5)
            .setSpeed(8)
            .crop(0,0,3,12)
            .setAngle(180);
    }
});

Crafty.c("Grunt", {
    init: function() {
        this.requires("Enemy, grunt")
            .crop(0,0,27,29)
            .setMaxHealth(15);
    }
});

Crafty.c("Patrol", {
    init: function() {
        this.requires("Enemy, patrol")
            .crop(0,0,27,25)
            .setMaxHealth(25)
            .allowRotation(false)
            .setProjectileType("PatrolPewPew")
            .setShootDelay(1000);
    }
});
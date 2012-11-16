/**
 * content.js
 * Jesse Emond
 * 15/11/2012

 File where the main content of the game is set. This is where enemies and weapons are created.
 **/

/************************************************************************/
/***************************    ENEMIES    ******************************/
/************************************************************************/
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
            .crop(0,0,25,27)
            .setMaxHealth(25)
            .allowRotation(false);
        this.bind("EnterFrame", function () { this.rotation = 90; });
    }
});



/************************************************************************/
/**************************    ENEMY GUNS    ****************************/
/************************************************************************/
Crafty.c("NoPewPew", { // This gun if you don't want an enemy to shoot.
	init: function() {
		this.requires("Gun")
			.setShootDelay(-1);
	}
});
Crafty.c("LameEnemyPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(5)
			.setShootDelay(1000)
			.setProjectileType("RegularPewPew");
	}
});
Crafty.c("LameConeEnemyPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(3)
			.setShootDelay(1200)
			.setProjectileType("EnemyRegularLazor")
			.setProjectilesAngleDeltas([-15,0,15]);
	}
});
Crafty.c("LameShotgunEnemyPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(5)
			.setShootDelay(900)
			.setProjectileType("EnemyRegularLazor")
			.setProjectilesAngleDeltas([-1,0,1]);
	}
});



/************************************************************************/
/*********************    ENEMY GUN PROJECTILES    **********************/
/************************************************************************/
// The projectile of the patrol enemy.
Crafty.c("EnemyRegularLazor", {
	init: function() {
        this.requires("EnemyProjectile, enemypewpew")
            .setSpeed(10)
            .crop(0,0,3,12);
    }
});


/************************************************************************/
/**************************    PLAYER GUNS    ***************************/
/************************************************************************/
Crafty.c("PlayerLamePewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(10)
			.setShootDelay(150)
			.setProjectileType("PlayerRegularLazor");
	}
});
Crafty.c("PlayerFastPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(3)
			.setShootDelay(50)
			.setProjectileType("PlayerSmallLazor");
	}
});

/************************************************************************/
/*********************    PLAYER GUN PROJECTILES    *********************/
/************************************************************************/
// Represents the weapon machinegun pewpew
Crafty.c("PlayerSmallLazor", {
    init: function() {
        this.requires("PlayerPewpew, pewpewlazors")
            .crop(7,0,3,12)
            .setSpeed(16);
    }
});

// Represents the first weapon pewpew
Crafty.c("PlayerRegularLazor", {
    init: function() {
        this.requires("PlayerPewpew, pewpewlazors")
            .crop(3,0,4,34)
            .setSpeed(15);
    }
});
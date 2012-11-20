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
            .alwaysLookDown();
    }
});

Crafty.c("EasiestBoss", {
	init: function() {
		this.requires("Enemy, easiestboss")
			.crop(0,0,40,40)
			.setMaxHealth(250)
			.alwaysLookDown();
	}
});

Crafty.c("EasiestBossAiming", {
	init: function() {
		console.log("hello");
		this.requires("Enemy, easiestboss")
			.crop(0,0,40,40)
			.setMaxHealth(250);
	}
});

Crafty.c("EasyBoss", {
	init: function() {
		this.requires("Enemy, easyboss")
			.crop(0,0,40,40)
			.setMaxHealth(500)
			.rotateEveryFrame(1);
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
Crafty.c("LameFastLargeShotgunEnemyPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(5)
			.setShootDelay(300)
			.setProjectileType("EnemyRegularLazor")
			.setProjectilesAngleDeltas([-2,-1,1,2]);
	}
});
Crafty.c("CircularEnemyPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(2)
			.setShootDelay(1000)
			.setProjectileType("EnemySmallLazor")
			.setProjectilesAngleDeltas([-150,-135,-120,-105,-90,-75,-60,-45,-30,-15,0,15,30,45,60,75,90,105,120,135,150,165,180]);
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

Crafty.c("EnemySmallLazor", {
	init: function() {
		this.requires("EnemyProjectile, enemypewpew")
			.setSpeed(12)
			.crop(10,0,3,12);
	}
});


/************************************************************************/
/**************************    PLAYER GUNS    ***************************/
/************************************************************************/
Crafty.c("PlayerFastPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(3)
			.setShootDelay(50)
			.setProjectileType("PlayerSmallLazor");
	}
});
Crafty.c("PlayerParrallelFastPewPew", {
	init: function() {
		this.requires("PlayerFastPewPew")
			.setProjectilesXDeltas([-7,7]);
	}
});
Crafty.c("PlayerFastPewPewSplit3", {
	init: function() {
		this.requires("PlayerFastPewPew")
			.setProjectilesXDeltas([-7,0,7])
			.setProjectilesAngleDeltas([-7,0,7]);
	}
});

Crafty.c("PlayerFastPewPewSplit5", {
	init: function() {
		this.requires("PlayerFastPewPew")
			.setProjectilesXDeltas([-14,-7,0,7,14])
			.setProjectilesAngleDeltas([-15,-7.5,0,7.5,15]);
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
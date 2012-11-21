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
Crafty.c("LameLargeShotgunEnemyPewPew", {
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
			.crop(9,0,3,12);
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
		this.requires("Gun")
			.setDamage(3)
			.setShootDelay(55)
			.setProjectileType("PlayerParrallelLazor")
			.setProjectilesXDeltas([-7,7]);
	}
});
Crafty.c("PlayerFastPewPewSplit3", {
	init: function() {
		this.requires("Gun")
			.setDamage(3)
			.setShootDelay(65)
			.setProjectileType("PlayerSplit3Lazor")
			.setProjectilesXDeltas([-7,0,7])
			.setProjectilesAngleDeltas([-7,0,7]);
	}
});

Crafty.c("PlayerFastPewPewSplit5", {
	init: function() {
		this.requires("Gun")
			.setDamage(3)
			.setShootDelay(80)
			.setProjectileType("PlayerSplit5Lazor")
			.setProjectilesXDeltas([-14,-7,0,7,14])
			.setProjectilesAngleDeltas([-15,-7.5,0,7.5,15]);
	}
});

Crafty.c("PlayerMelee", {
	init: function() {
		this.requires("Gun")
			.setProjectileType("PlayerMeleeLazor")
			.setDamage(20)
			.setShootDelay(50);
	}
});

Crafty.c("PlayerHomingPewPew", {
	init: function() {
		this.requires("Gun")
			.setProjectileType("PlayerHomingMissile")
			.setDamage(20)
			.setShootDelay(300);
	}
});

Crafty.c("PlayerFireBigPewPew", {
	init: function() {
		this.requires("Gun")
			.setProjectileType("PlayerFiringMyLazor")
			.setDamage(3)
			.setUnique(true)
			.setShootDelay(0);
	}
});

Crafty.c("PlayerForkYou", {
	init: function() {
		this.requires("Gun")
			.setProjectileType("PlayerForkLazor")
			.setDamage(20)
			.setShootDelay(30);
	}
});

/************************************************************************/
/*********************    PLAYER GUN PROJECTILES    *********************/
/************************************************************************/
// Represents the weapon machinegun pewpew
Crafty.c("PlayerSmallLazor", {
    init: function() {
        this.requires("PlayerPewpew, pewpewlazors")
            .crop(6,0,3,12)
            .setSpeed(16);
    }
});

// Represents the first weapon pewpew
Crafty.c("PlayerParrallelLazor", {
    init: function() {
        this.requires("PlayerPewpew, pewpewlazors")
            .crop(3,0,3,12)
            .setSpeed(15);
    }
});

Crafty.c("PlayerSplit3Lazor", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors")
            .crop(12,0,3,12)
            .setSpeed(14);
	}
});

Crafty.c("PlayerSplit5Lazor", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors")
            .crop(15,0,3,12)
            .setSpeed(13);
	}
});

Crafty.c("PlayerMeleeLazor", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors, FadeOut")
			.crop(0,12,40,6)
			.setSpeed(15)
			.fadeOut(0.1);

		this.bind("EnterFrame", function() {
			this.damage *= 0.8;
			var SCALE_MOD = 1.2;
			var wDiff = this.w * (SCALE_MOD - 1.0);
			var hDiff = this.h * (SCALE_MOD - 1.0);
			this.w *= SCALE_MOD;
			this.h *= SCALE_MOD;
			this.x -= wDiff / 2;
			this.y -= hDiff / 2;
			this.collision();
		});
	}
});

Crafty.c("PlayerHomingMissile", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors")
			.crop(25, 0, 11, 12)
			.setSpeed(10);

		this.bind("EnterFrame", function() {
			var ATTACK_DIST = 150;
			var ATTACK_DIST_SQ = ATTACK_DIST * ATTACK_DIST;
			var thisBounds = this.mbr();
			var thisX = thisBounds._x + thisBounds._w/2;
			var thisY = thisBounds._y + thisBounds._h/2;
			var closest = null;
			var closestX = null;
			var closestY = null;
			var closestDistance = 9999999999999;

			var enemyIDs = Crafty("Enemy");
			for (var i = 0; i < enemyIDs.length; ++i)
			{
				var enemy = Crafty(enemyIDs[i]);
				var enemyBounds = enemy.mbr();
				var enemyX = enemyBounds._x + enemyBounds._w/2;
				var enemyY = enemyBounds._y + enemyBounds._h/2;
				var distSq = Math.pow(enemyX-thisX,2) + Math.pow(enemyY-thisY,2);

				if (distSq <= ATTACK_DIST_SQ && distSq < closestDistance)
				{
					closestDistance = distSq;
					closest = enemy;
					closestX = enemyX;
					closestY = enemyY;
				}
			}

			if (closest !== null)
			{
				var MAX_STEER = 1;
				var steerX = closestX - thisX;
				var steerY = closestY - thisY;
				var steerL = Math.sqrt(steerX*steerX + steerY*steerY);

				steerX /= steerL;
				steerX *= MAX_STEER;
				steerY /= steerL;
				steerY *= MAX_STEER;

				var orientation = Math.atan2(this.moveY, this.moveX);
				var currentX = Math.cos(orientation);
				var currentY = Math.sin(orientation);

				var newAngleRad = Math.atan2(currentY + steerY, currentX + steerX);
				var newAngle = Crafty.math.radToDeg(newAngleRad);
				this.rotation = newAngle+90;
				this.moveX = Math.cos(newAngleRad);
                this.moveY = Math.sin(newAngleRad);
			}
		});
	}
});

Crafty.c("PlayerFiringMyLazor", {
	init: function() {
		this.requires("PlayerPewpew, firinmylazor, FadeIn, FadeOut")
			.crop(0,0,25,50)
			.setSpeed(0)
			.attr({z:105})
			.fadeIn(0.2);

		this.bind("EnterFrame", function() {
			var oBounds = this.owner.mbr();
			this.h = oBounds._y + oBounds._h;
			this.y = 0;
			this.x = oBounds._x + oBounds._w/2 - this.w/2;
			this.collision();
		});
	}
});

Crafty.c("PlayerForkLazor", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors")
            .crop(18,0,7,12)
            .setSpeed(17);
	}
});
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

Crafty.c("Trapeze", {
	init: function() {
		this.requires("Enemy, trapeze")
			.crop(25, 0, 20, 47)
			.setMaxHealth(50);
	}
});

Crafty.c("Deltoid", {
	init: function() {
		this.requires("Enemy, deltoid")
			.crop(0,0,35,39)
			.setMaxHealth(65);
	}
});

Crafty.c("RectBox", {
	init: function() {
		this.requires("Enemy, rectbox")
			.crop(0,0,18,28)
			.alwaysLookDown()
			.setMaxHealth(65);
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

Crafty.c("NormalBoss", {
	init: function() {
		this.requires("Enemy, normalboss")
			.crop(0,0,40,37)
			.setMaxHealth(750)
			.alwaysLookDown();
	}
});

Crafty.c("BigBoss", {
	init: function() {
		this.requires("Enemy, bigboss")
			.crop(0,0,37,38)
			.setMaxHealth(1500)
			.alwaysLookDown();
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
Crafty.c("PulseEnemyPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(20)
			.setProjectileType("EnemyPulseLazor")
			.setShootDelay(500);
	}
});
Crafty.c("HighPulseEnemyPewPew", {
	init: function() {
		this.requires("Gun")
			.setDamage(20)
			.setProjectileType("EnemyPulseLazor")
			.setShootDelay(100);
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
            .crop(28,0,12,3);
    }
});

Crafty.c("EnemySmallLazor", {
	init: function() {
		this.requires("EnemyProjectile, enemypewpew")
			.setSpeed(12)
			.crop(28,9,12,3);
	}
});

Crafty.c("EnemyPulseLazor", {
	init: function() {
		this.requires("EnemyProjectile, enemypewpew, FadeOut")
			.setSpeed(0)
			.crop(0,0,22,24)
			.fadeOut(0.05)
			.setIsDestroyedOnContact(false)
			.origin("center");

		this.bind("EnterFrame", function() {
			var SCALE_MOD = 1.2;
			this.damage *= 0.9;
			this.w *= SCALE_MOD;
			this.h *= SCALE_MOD;
			var ownerB = this.owner.mbr();
			var thisB = this.mbr();
			this.x = ownerB._x + ownerB._w/2 - thisB._w/2;
			this.y = ownerB._y + ownerB._h/2 - thisB._h/2;
			this.origin("center").collision();
		});
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
			.setDamage(10)
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
            .crop(28,6,12,3)
            .setSpeed(16);
    }
});

// Represents the first weapon pewpew
Crafty.c("PlayerParrallelLazor", {
    init: function() {
        this.requires("PlayerPewpew, pewpewlazors")
            .crop(28,3,12,3)
            .setSpeed(15);
    }
});

Crafty.c("PlayerSplit3Lazor", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors")
            .crop(28,12,12,3)
            .setSpeed(14);
	}
});

Crafty.c("PlayerSplit5Lazor", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors")
            .crop(28,15,12,3)
            .setSpeed(13);
	}
});

Crafty.c("PlayerMeleeLazor", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors, FadeOut")
			.crop(0,36,40,6)
			.setSpeed(15)
			.setIsDestroyedOnContact(false)
			.fadeOut(0.1)
			.setAllowRotation(false)
			.origin("center");

		this.moveY = -1;

		this.bind("EnterFrame", function() {
			if (!this.startX)
			{
				var oBounds = this.owner.mbr();
				this.startX = oBounds._x + oBounds._w/2;
			}
			this.damage *= 0.8;
			var thisB = this.mbr();
			var SCALE_MOD = 1.2;
			this.w *= SCALE_MOD;
			this.h *= SCALE_MOD;

			this.x = this.startX - this.w/2;

			this.collision();
		});
	}
});

Crafty.c("PlayerHomingMissile", {
	init: function() {
		this.requires("PlayerPewpew, pewpewlazors")
			.crop(28, 25, 12, 11)
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
				this.rotation = newAngle;
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
			.setAllowRotation(false)
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
            .crop(28,18,12,7)
            .setSpeed(17);
	}
});
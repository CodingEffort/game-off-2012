// Game constants not-so-constant
var SCREEN_W = 800;
var SCREEN_H = 600;

// Enemy constants

// ENEMY1
// Goes from a corner of the screen to the lower part of the screen on the other part
var E1_FRAMES = 120; // frames required for the whole path
var E1_STARTX = -50; // starting x and y coords
var E1_STARTY = -50;
var E1_TARGETX = SCREEN_W+50; // target x and y coords
var E1_TARGETY = SCREEN_H+50;
// function parameters calculated with the specified start&target parameters
// at+b for the x coord, where b is the starting x pos
var E1_X_B = E1_STARTX;
var E1_X_A = (E1_TARGETX - E1_X_B) / E1_FRAMES;
// a t^2 + k for the y coord, where k is the starting y pos
var E1_Y_K = E1_STARTY;
var E1_Y_A = (E1_TARGETY - E1_Y_K) / (E1_FRAMES * E1_FRAMES);
// final result
function enemy1Func(t) { return {x: E1_X_A * t + E1_X_B, y: E1_Y_A * t * t + E1_Y_K}; }

// Initialize the game screen
Crafty.init(SCREEN_W, SCREEN_H);

// Load the spritesheet
Crafty.sprite(50, "assets/back.png", {
	space: [0,0, 16, 12], // the space background
	ship: [0, 12], // the spaceship
	pewpewlazors: [1, 12], // the pewpew
	enemy1: [2, 12], // the first enemy
	explosion: [3, 12]
	});
	
// Represents an image that will reset up the screen once it reached the bottom
// Use 2 of those to create a vertical scrolling background
Crafty.c("ScreenScrolldown", {
	init: function() {
		this.bind("EnterFrame", function() {
			this.y += 5;
			if (this.y >= SCREEN_H)
				this.y = -SCREEN_H;
		});
		
	}
});

//TODO: fadeout component
Crafty.c("Explosion", {
	init: function() {
		this.requires("2D, Canvas, SpriteAnimation, explosion, Tween")
			.animate('explosion', 3, 12, 7)
			.animate('explosion', 10, 0)
			.timeout(function() {
				this.destroy();
			}, 350);
	}
});

Crafty.c("ParralaxBackground", {
	init: function() {
		this.requires("2D, Canvas, space, ScreenScrolldown");
	}
});

// Makes a component go up until it reaches the top of the screen, then disapears
Crafty.c("GoUp", {
	init: function() {
		this.bind("EnterFrame", function() {
			this.y -= 15;
			if (this.y + this.h * 2 < 0)
				this.destroy();
		});
	}
});

// Represents a player pewpew
Crafty.c("Pewpew", {
	init: function() {
		this.requires("2D, Canvas, GoUp, Collision");
	},
	setDamage: function(dmg) {
		this.damage = dmg;
		return this;
	}
});

// Makes a component that follows a path specified by a mathematical function that returns the y based on a x.
Crafty.c("FollowPath", {
	_path: function(x) { return x; },
	_deltaT: 0,
	_reflexionY: false,
	init: function() {
		this.deltaT = 0;

		this.bind("EnterFrame", function() {
			var newPos = this.path(this.deltaT);
			this.x = newPos.x;
			this.y = newPos.y;
			if (this.reflexionY)
				this.x = -this.x + SCREEN_W;

			this.deltaT++;

			// find the orientation that we should have based on our next position
			var nextPos = this.path(this.deltaT);
			this.rotation = Crafty.math.radToDeg(Math.atan2(nextPos.y - newPos.y, nextPos.x - newPos.x));
			if (this.reflexionY) this.rotation = -this.rotation + 180;


			// Is going out of screen? Destroy it.
			if (this.x + this.w * 2 < 0 ||
				this.y + this.h * 2 < 0 ||
				this.x - this.w * 2 > SCREEN_W ||
				this.y - this.h * 2 > SCREEN_H)
			{
				this.destroy();
			}
		});
	},
	followPath: function(func) { this.path = func; return this; },
	reflectY: function(reflect) { this.reflexionY = reflect; }
});

// Called when an enemy is hit by a pewpewlazors
function hitEnemy(e) {
	this.destroy(); // remove the pew pew lazor
	for (var i = 0; i < e.length; ++i)
	{
		e[i].obj.hurt(this.damage); // hurt the enemy
	}
}

Crafty.c("HealthBar" , {
	init: function() {
		this.bar = Crafty.e("2D, Canvas, Text").textColor("#FFFFFF").attr({z:10000});

		this.bind("EnterFrame", function() {
			this.bar.text(this.health);
			this.bar.x = this.x;
			this.bar.y = this.y;
			var percent = this.health / this.maxHealth;
			if (percent >= 0.7)
				this.bar.textColor("#00FF00");
			else if (percent >= 0.3)
				this.bar.textColor("#FFFF00");
			else
				this.bar.textColor("#FF0000");
		});

		this.bind("Remove", function() {
			this.bar.destroy();
		});
	}
});


Crafty.c("Living", {
	init: function() {
		this.requires("HealthBar");
		this.health = 0;
		this.maxHealth = 0;
	},
	setMaxHealth: function(amount) {
		this.maxHealth = amount;
		this.health = amount;
		return this;
	},
	hurt: function(amount) {
		this.health -= amount;
		this.health = Crafty.math.clamp(this.health, 0, this.maxHealth);
		if (this.health === 0)
			this.onDeath();
	},
	onDeath: function() {
		var rect = this.mbr();
		var explosion = Crafty.e("Explosion").attr({z:9000});
		explosion.x = rect._x + rect._w/2 - explosion.w/2;
		explosion.y = rect._y + rect._h/2 - explosion.h/2;
		this.destroy();
	}
});


// Main spaceship object
Crafty.c("Spaceship", {
	_shooting: false,

	init: function() {
		this.requires("2D, Canvas, ship, Living")
			.setMaxHealth(100);
		this.x = SCREEN_W/2 - this.w/2;
		this.y = SCREEN_H/2 - this.h/2;
		this.canShoot = true;

		this.bind("EnterFrame", function() {
			if (this.shooting) {
				this.shoot();
			}
		});
	},
	reload: function() {
		this.canShoot = false;

		this.timeout(function() {
			this.canShoot = true;
		}, 150);
	},
	shoot: function() {
		if (this.canShoot) {
			var pew = Crafty.e("Pewpew, pewpewlazors").collision().onHit("Enemy", hitEnemy).crop(22,15,4,35).setDamage(10);
			// Spawn it above the player's center, to shoot them pewpews
			pew.x = this.x + this.w/2 - pew.w/2;
			pew.y = this.y - 0.6*pew.h;
			this.reload();
		}
	}
});

// Enemy component
Crafty.c("Enemy", {
	init: function() {
		this.requires("2D, Canvas, FollowPath, Collision, Living")
			.setMaxHealth(20)
			.origin("center");
	}
});

function startGame() {
	// Create an infinite background illusion with 2 images moving
	var background1 = Crafty.e("ParralaxBackground");
	var background2 = Crafty.e("ParralaxBackground").y = -SCREEN_H;

	// Create the player space shit
	var player = Crafty.e("Spaceship");

	// TODO: use more sophisticated spawner with different enemies + handle difficulty + random enemies
	setInterval(function() {
		spawnEnemy("EasyEnemyNoShootTopRight");
	}, 2000);

	// Update the player according to the movement
	Crafty.addEvent(this, Crafty.stage.elem, "mousemove", function(e) {
		var targetX = Crafty.math.clamp(e.x - player.w/2, 0, SCREEN_W - player.w);
		var targetY = Crafty.math.clamp(e.y - player.h/2, 0, SCREEN_H - player.h);
		player.x = targetX;
		player.y = targetY;
	});

	// Check to fire for the player.
	Crafty.addEvent(this, Crafty.stage.elem, "mousedown", function(e) {
		player.shooting = true;
	});

	Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function(e) {
		player.shooting = false;
	});

	Crafty.addEvent(this, Crafty.stage.elem, "mouseout", function(e) {
		player.shooting = false;
	});
}

// Spawns the specified enemy.
function spawnEnemy(name) {
	var enemy;

	if (name == 'EasyEnemyNoShootTopRight')
		enemy = Crafty.e("Enemy, enemy1").followPath(enemy1Func).crop(7,5,35,37);

	enemy.reflectY(Crafty.math.randomInt(0, 1) === 0);

	return enemy;
}





startGame();
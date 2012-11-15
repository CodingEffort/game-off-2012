/**
 * powerups.js
 * Jesse Emond
 * 14/11/2012

Holds the powerups that can be picked through the game.
**/

// Spawns a powerup that can be picked at the specified x and y.
function spawnPowerup(player, powerUpName, startX, startY) {
	var powerup;
	if (powerUpName === "ShieldPowerup") {
		powerup = Crafty.e("ShieldPowerupItem")
			.attr({x: startX, y: startY});
	}
	else
		throw ("The power up '" + powerUpName + "' is not implemented while spawning it.");

	powerup.fadeIn(0.03)
		.collision()
		.onHit("Spaceship", onPlayerPickedPowerup);
}

// Called when a player picks a powerup.
function onPlayerPickedPowerup(e) {
	for (var i = 0; i < e.length; ++i)
	{
		if (e[i].obj.powerups[this.powerupObject] !== undefined) // effect already on? just reset it
		{
			e[i].obj.powerups[this.powerupObject].resetEffect();
		}
		else // new effect to add
		{
			var powerup = Crafty.e(this.powerupObject)
				.setOwner(e[i].obj)
				.fadeIn(0.05)
				.setPowerupName(this.powerupObject);

			e[i].obj.powerups[this.powerupObject] = powerup;
		}

	}
	this.destroy();
}

// Represents a powerup item that must be picked to activate the real powerup effect.
Crafty.c("PowerupItem", {
	init: function() {
		this.requires("2D, Canvas, Collision, FadeIn")
			.origin("center");

		this.t = 0;
		this.scaleFactor = 1;

		this.bind("EnterFrame", function ()
		{
			this.t++;
			this.scaleFactor = 0.5 * Math.sin(2 * Math.PI / 120 * this.t);

			this.x += this.w/2;
			this.y += this.h/2;

			this.w += this.scaleFactor;
			this.h += this.scaleFactor;

			this.x -= this.w/2;
			this.y -= this.h/2;
		});
	},
	setPowerupObject: function(powerup) {
		this.powerupObject = powerup;
		return this;
	}
});

Crafty.c("PowerupObject", {
	init: function() {
		this.requires("2D, Canvas, Collision, FadeIn");

		this.bind("Remove", function() {
			delete this.player.powerups[this.powerupName];
		});
	},
	setOwner: function(player) {
		this.player = player;
		return this;
	},
	setPowerupName: function(name) {
		this.powerupName = name;
		return this;
	},
	resetEffect: function() {
		this.trigger("EffectReset");
	}
});


// Powerup that protects the player until it is destroyed.
Crafty.c("ShieldPowerupItem", {
	init: function() {
		this.requires("PowerupItem, shield")
			.crop(0,0,28,29)
			.setPowerupObject("ShieldPowerup");
	}
});

// Powerup that blocks incoming projectiles and collisions until it is destroyed.
Crafty.c("ShieldPowerup", {
	init: function() {
		this.requires("Living, PowerupObject, shieldObject, HealthBar")
			.setMaxHealth(50)
			.setHpBarYOffset(10)
			.setHpBarColor('#0094FF');

		this.bind("EnterFrame", function() {
			if (this.player !== undefined)
			{
				//var thisBounds =  this.mbr();
				var playerBounds = this.player.mbr();
				this.x = playerBounds._x + playerBounds._w/2 - this.w/2;
				this.y = playerBounds._y + playerBounds._h/2 - this.h/2;
				this.setHpBarFollow(this.player);
			}
		});

		this.bind("Hurt", function() {
			var percent = this.health / this.maxHealth;
			this.alpha = percent;
		});

		this.bind("EffectReset", function() {
			this.setMaxHealth(this.maxHealth);
		});
	}
});
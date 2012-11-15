/**
 * powerups.js
 * Jesse Emond
 * 14/11/2012

Holds the powerups that can be picked through the game.
**/

// Spawns a powerup that can be picked at the specified x and y.
function spawnPowerup(powerUpName, startX, startY) {
	var powerup;
	if (powerUpName === "Shield") {
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
		var powerup = Crafty.e(this.powerupObject)
			.setOwner(e[i].obj)
			.fadeIn(0.05);
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
		this.requires("2D, Canvas, COllision, FadeIn");
	}
});


// Powerup that protects the player until it is destroyed.
Crafty.c("ShieldPowerupItem", {
	init: function() {
		this.requires("PowerupItem, shield")
			.crop(0,0,28,29)
			.setPowerupObject("ShieldPowerupObject");
	}
});

// Powerup that blocks incoming projectiles and collisions until it is destroyed.
Crafty.c("ShieldPowerupObject", {
	init: function() {
		this.requires("PowerupObject, shieldObject");

		this.bind("EnterFrame", function() {
			if (this.player !== undefined)
			{
				var thisBounds =  this.mbr();
				var playerBounds = this.player.mbr();
				this.x = playerBounds._x + playerBounds._w/2 - thisBounds._w/2;
				this.y = playerBounds._y + playerBounds._h/2 - thisBounds._h/2;
			}
		});
	},
	setOwner: function(player) {
		this.player = player;
		return this;
	}
});
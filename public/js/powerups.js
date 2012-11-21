/**
 * powerups.js
 * Jesse Emond
 * 14/11/2012

Holds the powerups that can be picked through the game.
**/

// Spawns a powerup that can be picked at the specified x and y.
function spawnPowerup(powerUpName, startX, startY) {
	var powerup;
	if (powerUpName === "ShieldPowerup") {
		powerup = Crafty.e("ShieldPowerupItem");
	}
	else if (powerUpName === "HealPowerup") {
		powerup = Crafty.e("HealPowerupItem");
	}
	else
		throw ("The power up '" + powerUpName + "' is not implemented while spawning it.");

	powerup.fadeIn(0.03)
		.collision()
		.onHit("Spaceship", onPlayerPickedPowerup)
		.attr({x: startX, y: startY});
}

// Called when a player picks a powerup.
function onPlayerPickedPowerup(e) {
	var shouldRemovePowerup = true;
	for (var i = 0; i < e.length; ++i)
	{
		if (e[i].obj.powerups[this.powerupObject] !== undefined) // effect already on? just reset it
		{
			shouldRemovePowerup = e[i].obj.powerups[this.powerupObject].resetEffect();
		}
		else if (this.shouldPickPowerup(e[i].obj)) // new effect to add
		{
			var powerup = Crafty.e(this.powerupObject)
				.setOwner(e[i].obj)
				.fadeIn(0.05)
				.setPowerupName(this.powerupObject);

			e[i].obj.powerups[this.powerupObject] = powerup;
		}

	}
	if (shouldRemovePowerup)
		this.destroy();
}

// Represents a powerup item that must be picked to activate the real powerup effect.
Crafty.c("PowerupItem", {
	init: function() {
		this.requires("2D, Canvas, Collision, FadeIn")
			.origin("center")
			.attr({z:1000});

		this.t = 0;
		this.scaleFactor = 1;

		this.bind("EnterFrame", function ()
		{
			this.t++;
			this.scaleFactor = 0.1 * Math.sin(2 * Math.PI / 30 * this.t) + 1.0;

			this.x += this.w/2;
			this.y += this.h/2;

			if (this.initialW === undefined) this.initialW = this.w;
			if (this.initialH === undefined) this.initialH = this.h;

			this.w = this.initialW * this.scaleFactor;
			this.h = this.initialH * this.scaleFactor;

			this.x -= this.w/2;
			this.y -= this.h/2;
		});
	},
	setPowerupObject: function(powerup) {
		this.powerupObject = powerup;
		return this;
	},
	shouldPickPowerup: function(player) {
		return true;
	}
});

Crafty.c("PowerupObject", {
	init: function() {
		this.requires("2D, Canvas, Collision, FadeIn")
			.attr({z:900});

		this.bind("Remove", function() {
			delete this.player.powerups[this.powerupName];
		});
	},
	setOwner: function(player) {
		this.player = player;
		this.trigger("OwnerSet");
		return this;
	},
	setPowerupName: function(name) {
		this.powerupName = name;
		return this;
	},
	resetEffect: function() {
		this.trigger("EffectReset");
		return this.shouldPickPowerup === undefined ? true : this.shouldPickPowerup;
	}
});


// Powerup that protects the player until it is destroyed.
Crafty.c("ShieldPowerupItem", {
	init: function() {
		this.requires("PowerupItem, shield")
			.setPowerupObject("ShieldPowerup")
			.crop(0,0,28,29);
	}
});

// Powerup that blocks incoming projectiles and collisions until it is destroyed.
Crafty.c("ShieldPowerup", {
	init: function() {
		this.requires("Living, PowerupObject, shieldObject, HealthBar")
			.setMaxHealth(50)
			.setHpBarYOffset(10)
			.setHpBarColor('#0094FF');

		this.bind("OwnerSet", function() {
			this.setHpBarFollow(this.player);
			this.positionShield();
		});

		this.bind("EnterFrame", function() {
			this.positionShield();
		});

		this.bind("Hurt", function() {
			var percent = this.health / this.maxHealth;
			this.alpha = percent;
		});

		this.bind("EffectReset", function() {
			this.shouldPickPowerup = this.health !== this.maxHealth; // don't pick shields if ours is full
			this.setMaxHealth(this.maxHealth);
		});

		this.bind("Dead", function() {
			this.explode(Crafty.e("Explosion"));
		});
	},
	positionShield: function() {
		var playerBounds = this.player.mbr();
		this.x = playerBounds._x + playerBounds._w/2 - this.w/2;
		this.y = playerBounds._y + playerBounds._h/2 - this.h/2;
	}
});

// Powerup that heals the player
Crafty.c("HealPowerupItem", {
	init: function() {
		this.requires("PowerupItem, heal")
			.crop(0,0,35,14)
			.setPowerupObject("HealPowerup");
	},

	shouldPickPowerup: function(player) {
		return player.health < player.maxHealth;
	}
});

// Powerup that heals the player
Crafty.c("HealPowerup", {
	init: function() {
		this.requires("PowerupObject");

		var HEAL_AMOUNT = 25;
		var HEAL_TIME = 50;

		this.bind("OwnerSet", function() {
			var targetHealth = Math.min(this.player.health + HEAL_AMOUNT, this.player.maxHealth);
			this.player.tween({health: targetHealth}, HEAL_TIME);
			this.timeout(function() {
				this.destroy();
			}, HEAL_TIME);
		});

		this.bind("EffectReset", function () {
			this.shouldPickPowerup = false; // don't pick a heal if we're already getting healed
		});
	}
});
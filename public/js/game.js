// Game constants not-so-constant
var SCREEN_W = 800;
var SCREEN_H = 600;

// Initialize the game screen
Crafty.init(SCREEN_W, SCREEN_H);

// Load the spritesheet
Crafty.sprite(50, "assets/back.png", {
	space: [0,0, 16, 12], // the space background
	ship: [0, 12], // the spaceship
	pewpewlazors: [1, 12] ,// the pewpew
	enemy1: [2, 12] // the first enemy
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

// Makes a component go up until it reaches the top of the screen, then disapears
Crafty.c("GoUp", {
	init: function() {
		this.bind("EnterFrame", function() {
			this.y -= 15;
			if (this.y + this.height < 0)
				this.destroy();
		});
	}
});

// Makes a component that follows a path specified by a mathematical function that returns the y based on a x.
Crafty.c("FollowPath", {
	_path: function(x) { return x; },
	_deltaX: 5,
	init: function() {
		this.bind("EnterFrame", function() {
			this.x += this.deltaX;
			this.y = this.path(this.x);

			if (this.x + this.w < 0 ||
				this.y + this.h < 0 ||
				this.x > SCREEN_W ||
				this.y > SCREEN_H)
				this.destroy();
		});
	},
	followPath: function(func) { this.path = func; return this; },
	setDeltaX: function(delta) { this.deltaX = delta; return this; }
});


// Makes the player go towards the mouse when the mouse moves on this
// component
Crafty.c("MakePlayerMoveOnMouseMove", {
	init: function() {
		this.requires("Mouse");
		// Update the player according to the movement
		this.bind("MouseMove", function(e) {
			var targetX = Crafty.math.clamp(e.x - player.w/2, 0, SCREEN_W - player.w);
			var targetY = Crafty.math.clamp(e.y - player.h/2, 0, SCREEN_H - player.h);
			player.x = targetX;
			player.y = targetY;
		});

		// Check to fire for the player.
		this.bind("Click", function(e) {
			var pew = Crafty.e("2D, Canvas, pewpewlazors, GoUp");
			// Spawn it above the player's center, to shoot them pewpews
			pew.x = player.x + player.w/2 - pew.w/2;
			pew.y = player.y - 0.6*pew.h;
		});
	}
});


// Main spaceship object
Crafty.c("Spaceship", {
	init: function() {
		this.x = SCREEN_W/2 - this.w/2;
		this.y = SCREEN_H/2 - this.h/2;
	}
});

// Create an infinite background illusion with 2 images moving
Crafty.e("2D, Canvas, space, ScreenScrolldown, MakePlayerMoveOnMouseMove");
Crafty.e("2D, Canvas, space, ScreenScrolldown, MakePlayerMoveOnMouseMove").y = -SCREEN_H;

// Create the player space shit
var player = Crafty.e("2D, Canvas, ship, Spaceship");

// Create the first enemy
var enemy = Crafty.e("2D, Canvas, enemy1, FollowPath").followPath(function(x) { return 300; }).setDeltaX(10);
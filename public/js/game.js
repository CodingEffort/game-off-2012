// Game constants not-so-constant
var SCREEN_W = 800;
var SCREEN_H = 600;

// Initialize the game screen
Crafty.init(SCREEN_W, SCREEN_H);

// Load the spritesheet
Crafty.sprite(50, "assets/back.png", {
	space: [0,0, 16, 12], // the space background
	ship: [0, 12] // the spaceship
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

Crafty.c("MakePlayerMoveOnMouseMove", {
	init: function() {
		this.requires("Mouse");
		// Update the player according to the movement
		this.bind("MouseMove", function(e) {
			player.requires("Tween");
			var targetX = Crafty.math.clamp(e.x - 30, 0, SCREEN_W - 50);
			var targetY = Crafty.math.clamp(e.y - 30, 0, SCREEN_H - 50);
			player.tween({x: targetX, y: targetY}, 3);
		});
	}
});

Crafty.c("Spaceship", {
	init: function() {
	}

});


// Create an infinite background illusion with 2 images moving
Crafty.e("2D, Canvas, space, ScreenScrolldown, MakePlayerMoveOnMouseMove");
Crafty.e("2D, Canvas, space, ScreenScrolldown, MakePlayerMoveOnMouseMove").y = -SCREEN_H;

// Create the player space shit
var player = Crafty.e("2D, Canvas, ship, Spaceship");
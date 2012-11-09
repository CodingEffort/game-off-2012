// Game constants not-so-constant
var SCREEN_W = 800;
var SCREEN_H = 600;

// Initialize the game screen
Crafty.init(SCREEN_W, SCREEN_H);

// Load the spritesheet
Crafty.sprite(50, "assets/back.png", {
	space: [0,0, 16, 12] // the space background
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


// Create an infinite background illusion with 2 images moving
Crafty.e("2D, DOM, space, ScreenScrolldown");
Crafty.e("2D, DOM, space, ScreenScrolldown").y = -SCREEN_H;
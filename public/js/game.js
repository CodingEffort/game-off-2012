/**
 * game.js
 * Jesse Emond and William Turner
 * 12/11/2012

 The main file of the game. All the components are mixed together here.
 */

// Game constants not-so-constant
var SCREEN_W = 700;
var SCREEN_H = 600;

// Initialize the game screen
Crafty.init(SCREEN_W, SCREEN_H);

// Load the spritesheet
Crafty.sprite(50, "assets/back.png", {
    space: [0,0, 16, 12], // the space background
    ship: [0, 12], // the spaceship
    pewpewlazors: [1, 12], // the pewpew
    grunt: [2, 12], // the grunt enemy
    explosion: [3, 12], // the explosion animation
    patrol: [8, 12] // the patrol enemy
    });

Crafty.c("Explosion", {
    init: function() {
        this.requires("2D, Canvas, SpriteAnimation, explosion, FadeOut")
            .animate('explosion', 3, 12, 7)
            .animate('explosion', 10, 0)
            .fadeOut(0.05);
    }
});

Crafty.c("ParralaxBackground", {
    init: function() {
        this.requires("2D, Canvas, space, ScreenScrolldown");
    }
});

// Called when an enemy is hit by a pewpewlazors
function onLazorHitEnemy(e) {
    this.destroy(); // remove the pew pew lazor
    for (var i = 0; i < e.length; ++i)
    {
        e[i].obj.hurt(this.damage); // hurt the enemy
    }
}

function onPlayerHitEnemy(e) {
    // hurt the player by our current health value
    for (var i = 0; i < e.length; ++i)
    {
        e[i].obj.hurt(this.health);
    }
    this.hurt(this.maxHealth); // kill the enemy
}

function onProjectileHitPlayer(e) {
    for (var i = 0; i < e.length; ++i)
        e[i].hurt(this.damage);
    this.destroy();
}

Crafty.c("Spawner", {
    init: function() { },
    setSpawnFunction: function(func) {
        this.spawnFunction = func;
        return this;
    },
    startSpawning: function() {
        this.spawnFunction();
        //this.timeout(this.startSpawning, 1000); //TODO: random intervals
    }
});

function startGame() {
    // Create an infinite background illusion with 2 images moving
    var background1 = Crafty.e("ParralaxBackground");
    var background2 = Crafty.e("ParralaxBackground").y = -SCREEN_H;

    // Create the player space shit
    var player = Crafty.e("Spaceship");

    // TODO: use more sophisticated spawner with different enemies + handle difficulty + random enemies
    var spawner = Crafty.e("Spawner").setSpawnFunction(spawnNextEnemy);

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
        //socket.emit('shooting', true);
    });

    Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function(e) {
        player.shooting = false;
        //socket.emit('shooting', false);
    });

    Crafty.addEvent(this, Crafty.stage.elem, "mouseout", function(e) {
        player.shooting = false;
        //socket.emit('shooting', false);
    });

    // We bring the enemies
    spawner.startSpawning();
}

// Spawns the specified enemy, at the specified starting x and y position with the specified path type to follow.
function spawnEnemy(enemyType, startX, startY, pathType) {
    var enemy = Crafty.e(enemyType).attr({x:startX, y:startY})
                                    .collision()
                                    .onHit("Spaceship", onPlayerHitEnemy)
                                    .origin("center");
    enemy.followPath(getPath(pathType, startX, startY));

    return enemy;
}

function spawnNextEnemy() {
    spawnEnemy('Patrol', 350, -50, "PatrolHorizontal");
    spawnEnemy('Grunt', 0, -50, "TopLeftBottomRight");
}

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
Crafty.canvas.init();

// Load the spritesheet
Crafty.sprite(50, "assets/back.png", {
    space: [0,0, 16, 12], // the space background
    ship: [0, 12], // the spaceship
    pewpewlazors: [1, 12], // the pewpew
    grunt: [2, 12], // the grunt enemy
    explosion: [3, 12], // the explosion animation
    patrol: [8, 12], // the patrol enemy
    enemypewpew: [1, 12],
    shield: [9, 12],
    shieldObject: [10, 12],
    heal: [11, 12],
    teleport: [0, 13]
    });

// Called when an enemy is hit by a pewpewlazors
function onLazorHitEnemy(e) {
    e[0].obj.hurt(this.damage); // hurt the enemy
    checkToGiveEnemyCashToPlayer(e[0].obj, this.owner);
    this.destroy(); // remove the pew pew lazor
}

function onPlayerHitEnemy(e) {
    // hurt the player by our current health value
    checkToGiveEnemyCashToPlayer(this, e[0].obj);
    hurtPlayer(e[0].obj, this.health);
    this.hurt(this.maxHealth); // kill the enemy
}

function checkToGiveEnemyCashToPlayer(enemy, player) {
    if (enemy.health <= 0) // enemy is dead
        player.gainCash(enemy.cash);
}

function onProjectileHitPlayer(e) {
    hurtPlayer(e[0].obj, this.damage);
    this.destroy();
}

function hurtPlayer(player, dmg) {
    if (player.powerups["ShieldPowerup"] !== undefined) // if we're shielded
    {
        var remainingDmg = dmg - player.powerups["ShieldPowerup"].health;
        player.powerups["ShieldPowerup"].hurt(dmg);
        dmg = remainingDmg; // get the remaining damage
    }
    if (dmg > 0) // if we still have damages for the player
    {
        player.hurt(dmg);
        //TEMP UNTIL SERVER SHOOTS MESSAGES
        if (player.health <= 0)
            ui.showClientMessage("Player '" + player.playerID + "' branched a new dimension [C1] where he still lives.");
    }
}

//TEMP UNTIL SERVER SPAWNS ENEMIES
Crafty.c("Spawner", {
    init: function() { },
    setSpawnFunction: function(func) {
        this.spawnFunction = func;
        return this;
    },
    startSpawning: function() {
        this.spawnFunction();
        this.timeout(this.startSpawning, Crafty.math.randomInt(50, 1500));
    }
});

function startGame() {
    // Create an infinite background illusion with 2 images moving
    var background1 = Crafty.e("ParralaxBackground");
    var background2 = Crafty.e("ParralaxBackground").y = -SCREEN_H;

    // Create the player space shit
    this.players = [];
    var player = spawnPlayer(SCREEN_W/2, SCREEN_H/2, 0).setGun("PlayerFastPewPew");
    var interwebz = spawnPlayer(200, 300, 42).setGun("PlayerLamePewPew");
    interwebz.bind("EnterFrame", function() { this.shoot(); });
    setInterval(function() { forcePlayerPosition(interwebz.playerID, Crafty.math.randomInt(0, SCREEN_W),
        Crafty.math.randomInt(0, SCREEN_H), 50); }, 1000);

    // TODO: use more sophisticated spawner with different enemies + handle difficulty + random enemies
    var spawner = Crafty.e("Spawner").setSpawnFunction(spawnNextEnemy);

    // Update the player according to the movement
    Crafty.addEvent(this, Crafty.stage.elem, "mousemove", function(e) {
        var MOVE_LERP_SPEED = 0.9;
        var targetX = Crafty.math.clamp(e.x - player.w/2, 0, SCREEN_W - player.w);
        var targetY = Crafty.math.clamp(e.y - player.h/2, 0, SCREEN_H - player.h);
        player.x = Crafty.math.lerp(player.x, targetX, MOVE_LERP_SPEED);
        player.y = Crafty.math.lerp(player.y, targetY, MOVE_LERP_SPEED);
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

    this.ui = Crafty.e("UI");
    player.bind("CashChanged", function() {
        ui.setCashAmount(player.cash);
    });


    spawnPowerup('ShieldPowerup', 100, 100);
    spawnPowerup('ShieldPowerup', 500, 100);
    spawnPowerup('HealPowerup', 200, 100);
    spawnPowerup('HealPowerup', 400, 300);
}

function spawnPlayer(x, y, playerID) {
    var player = Crafty.e("Spaceship").setPlayerID(playerID);
    player.x = x - player.w/2;
    player.y = y - player.h/2;
    player.bind("Dead", function() { player.explode(Crafty.e("Implosion")); });
    this.players.push(player);
    return player;
}

function forcePlayerPosition(playerID, xPos, yPos, tweenTime) {
    for (var i = 0; i < this.players.length; ++i) {
        if (this.players[i].playerID === playerID) {
            this.players[i].tween({x:xPos, y:yPos}, tweenTime);
        }
    }
}

// Spawns the specified enemy, at the specified starting x and y position with the specified path type to follow.
function spawnEnemy(enemyType, startX, startY, pathType, gunType, speedModificator, cashValue) {
    var enemy = Crafty.e(enemyType).attr({x:startX, y:startY})
                                    .collision()
                                    .onHit("Spaceship", onPlayerHitEnemy);
    enemy.followPath(getPath(pathType, startX, startY), speedModificator);
    enemy.cash = cashValue;
    enemy.bind("Dead", function() { enemy.explode(Crafty.e("Explosion")); });
    enemy.setGun(gunType);

    return enemy;
}


//TEMP UNTIL SERVER SPAWNS ENEMIES
function spawnNextEnemy() {
    if (Crafty.math.randomInt(0, 1) === 0) spawnEnemy('Patrol', 350, -50, "PatrolHorizontal", "LameConeEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else spawnEnemy('Grunt', 0, -50, "TopLeftBottomRight", "LameShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 1);
}

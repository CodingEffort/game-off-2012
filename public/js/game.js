/**
 * game.js
 * Jesse Emond and William Turner
 * 12/11/2012

 The main file of the game. All the components are mixed together here.
 */

// Game constants not-so-constant
var SCREEN_W = 700;
var SCREEN_H = 600;

// Initialize the network
var nc = new NetClient();

// Initialize the game screen
Crafty.init(SCREEN_W, SCREEN_H);
Crafty.canvas.init();

// Load the spritesheet
Crafty.sprite(50, "assets/back.png", {
    space: [0,0, 16, 12], // the space background
    ship: [0, 12], // the spaceship
    shipoverlay: [12, 12],
    pewpewlazors: [1, 12], // the pewpew
    grunt: [2, 12], // the grunt enemy
    explosion: [3, 12], // the explosion animation
    patrol: [8, 12], // the patrol enemy
    enemypewpew: [1, 12],
    shield: [9, 12],
    shieldObject: [10, 12],
    heal: [11, 12],
    teleport: [0, 13],
    easiestboss: [13, 12],
    easyboss: [14, 12]
    });

// Called when an enemy is hit by a pewpewlazors
function onLazorHitEnemy(e) {
    e[0].obj.hurt(this.damage); // hurt the enemy
    checkToGiveEnemyCashToPlayer(e[0].obj, this.owner);
    this.destroy(); // remove the pew pew lazor
}

function onPlayerHitEnemy(e) {
    // hurt the player by our current health value
    hurtPlayer(e[0].obj, this.health/100);
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

//TEMP UNTIL MULTIPLAYER
function spawnInterwebz(startX, startY, playerID, color, gun, timeForChangePos, lerpTime) {
    var interwebz = spawnPlayer(startX, startY, playerID, gun, color).bind("EnterFrame", function() { this.shoot(); });
    setInterval(function() { forcePlayerPosition(interwebz.playerID, Crafty.math.randomInt(0, SCREEN_W),
        Crafty.math.randomInt(0, SCREEN_H), lerpTime); }, timeForChangePos);
}

function startGame() {
    nc.bind('connected', function(player) {
      // TODO: do some shit fuck with 'player'
      // ==> player.id
      // pretty much the only relevent and useful info for now (note, it's a string)
    });
    nc.connect();

    /*
     * TODO: Bind the event 'join'
     * nc.bind('join', function(player) {
     *    // ==> player.id
     *    // The only important bit of information so far
     * });
     */

    /*
     * TODO: Bind the event 'shooting'
     * nc.bind('shooting', function(player, shooting) {
     *    // Here 'player' is the player.id from 'connect'
     *    // And 'shooting' is a bool for... well... fuck it, it's pretty obvious
     * });
     */

    /*
     * TODO: Bind the event 'position'
     * nc.bind('position', function(player, pos) {
     *    // Same here, 'player' is the 'player.id' from 'connect'
     *    // And 'pos' is an object like this { x: 0, y: 0 }
     * });
     */

    // Create an infinite background illusion with 2 images moving
    var background1 = Crafty.e("ParralaxBackground");
    var background2 = Crafty.e("ParralaxBackground").y = -SCREEN_H;

    // Create the player space shit
    this.players = [];
    var player = spawnPlayer(SCREEN_W/2, SCREEN_H/2, 0, "PlayerMelee", "#FF9900");
    spawnInterwebz(300, 300, 42, "#00FF00", "PlayerFastPewPew", 1000, 50);
    spawnInterwebz(200, 400, 1337, "#FF0000", "PlayerParrallelFastPewPew", 2000, 100);
    spawnInterwebz(400, 200, 69, "#0000FF", "PlayerFastPewPewSplit3", 5000, 200);

    // TODO: use more sophisticated spawner with different enemies + handle difficulty + random enemies
    var spawner = Crafty.e("Spawner").setSpawnFunction(spawnNextEnemy);

    // Update the player according to the movement
    Crafty.addEvent(this, Crafty.stage.elem, "mousemove", function(e) {
        var MOVE_LERP_SPEED = 0.9;

        var position = $("#cr-stage").position();

        var targetX = Crafty.math.clamp(e.x - position.left - player.w/2, 0, SCREEN_W - player.w);
        var targetY = Crafty.math.clamp(e.y - position.top - player.h/2, 0, SCREEN_H - player.h);
        player.x = Crafty.math.lerp(player.x, targetX, MOVE_LERP_SPEED);
        player.y = Crafty.math.lerp(player.y, targetY, MOVE_LERP_SPEED);
        nc.position(player.x, player.y);
    });

    // Check to fire for the player.
    Crafty.addEvent(this, Crafty.stage.elem, "mousedown", function(e) {
        player.shooting = true;
        nc.shooting(true);
    });

    Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function(e) {
        player.shooting = false;
        nc.shooting(false);
    });

    Crafty.addEvent(this, Crafty.stage.elem, "mouseout", function(e) {
        player.shooting = false;
        nc.shooting(false);
    });

    //make the stage unselectable

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

function spawnPlayer(x, y, playerID, currentGun, color) {
    var player = Crafty.e("Spaceship").setPlayerID(playerID);
    player.x = x - player.w/2;
    player.y = y - player.h/2;
    player.bind("Dead", function() { player.explode(Crafty.e("Implosion")); });
    player.setPlayerColor(color);
    player.setGun(currentGun);
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
    var r = Crafty.math.randomInt(0,100);
    if (r <= 10) spawnEnemy('Patrol', Crafty.math.randomInt(50, SCREEN_W-50), -50, "PatrolHorizontal", "LameShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 20) spawnEnemy('Patrol', Crafty.math.randomInt(50, SCREEN_W-50), -50, "PatrolHorizontal", "LameConeEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 40) spawnEnemy('Grunt', Crafty.math.randomInt(50, SCREEN_W/2), -50, "TopLeftBottomRight", "LameShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 1);
    else if (r <= 60) spawnEnemy('Grunt', Crafty.math.randomInt(SCREEN_W/2, SCREEN_W-50), -50, "TopRightBottomLeft", "LameEnemyPewPew", Crafty.math.randomNumber(0.7, 1.3), 1);
    else if (r <= 65) spawnEnemy('EasiestBoss', Crafty.math.randomInt(50, SCREEN_W-50), -50, "ZigZag", "LameFastLargeShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 70) spawnEnemy('EasiestBossAiming', Crafty.math.randomInt(50, SCREEN_W-50), -50, "Circle", "LameFastLargeShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 75) spawnEnemy('EasyBoss', Crafty.math.randomInt(50, SCREEN_W-50), -50, "Circle", "CircularEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else {}
    
}

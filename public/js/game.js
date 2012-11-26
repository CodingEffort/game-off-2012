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

var dT = 0;
var dTSpeed = 1;

var players = {};
var enemies = {};
var powerups = {};
var ui = null;
var me = null;

// Initialize the game screen
Crafty.init(SCREEN_W, SCREEN_H);
Crafty.background("#000000");
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
    trapeze: [8, 12],
    deltoid: [7, 13],
    rectbox: [8, 13],
    halfcircle: [8, 13],
    enemypewpew: [1, 12],
    shield: [9, 12],
    shieldObject: [10, 12],
    heal: [11, 12],
    teleport: [0, 13],
    easiestboss: [13, 12],
    easyboss: [14, 12],
    firinmylazor: [5, 13],
    normalboss: [6, 13],
    bigboss: [15,12],
    bosshealthbarbg: [1,12],
    bosshealthbarfill: [1, 12]
    });

// Called when an enemy is hit by a pewpewlazors
function onLazorHitEnemy(e) {
    e[0].obj.hurt(this.damage); // hurt the enemy
    checkToGiveEnemyCashToPlayer(e[0].obj, this.owner);
    if (this.owner === undefined || (!this.owner.gun.isUnique &&
        this.destroyedOnContact))
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
    if (this.destroyedOnContact) this.destroy();
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
/*
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
*/

//TEMP UNTIL MULTIPLAYER
/*
function spawnInterwebz(startX, startY, playerID, color, gun, timeForChangePos, lerpTime) {
    var interwebz = spawnPlayer(startX, startY, playerID, gun, color).bind("EnterFrame", function() { this.shooting = true; });
    setInterval(function() { forcePlayerPosition(interwebz.playerID, Crafty.math.randomInt(0, SCREEN_W),
        Crafty.math.randomInt(0, SCREEN_H), lerpTime); }, timeForChangePos);
}
*/

function startGame() {
    ui = Crafty.e('UI');

    nc.bind('connected', function(player) {
      if (players[player.id]) {
        me = players[player.id];
        delete players[player.id];
      } else {
        me = spawnPlayer(SCREEN_W/2, SCREEN_H/2, player.id, "PlayerParrallelFastPewPew", "#FF0000");
      }
      dT = player.dT;
      me.bind('CashChanged', function() {
        ui.setCashAmount(me.cash);
      });
    });
    nc.connect();

    nc.bind('shooting', function(id, shooting) {
      players[id].shooting = shooting;
    });

    nc.bind('position', function(id, pos) {
      forcePlayerPosition(id, pos.x, pos.y, 5);
    });

    nc.bind('spawn', function(type, spawn) {
      if (type == 'player') {
        spawnPlayer(SCREEN_W/2, SCREEN_H/2, spawn.id, "PlayerParrallelFastPewPew", "#FF0000");
      } else if (type == 'enemy') {
        spawnEnemy("Grunt", 100, -50, spawn.id, "CircleStartRight", "LameEnemyPewPew", 1.0, 10, spawn.dTStart);
      } else if (type == 'powerup') {
        // TODO: spawn the powerup
      }
    });

    nc.bind('despawn', function(type, id) {
      if (type == 'player') {
        players[id].destroy();
      } else if (type == 'enemy') {
        enemies[id].destroy();
      } else if (type == 'powerup') {
        // TODO: destroy the powerup
      }
    });

    nc.bind('updatedt', function(newDT) {
        var DT_SPEED_MOD = 0.1;
        if (dT < newDT)
            dTSpeed *= (1 + DT_SPEED_MOD);
        else if (dT > newDT)
            dTSpeed *= (1 - DT_SPEED_MOD);
        dT = Crafty.math.lerp(dT, newDT, 0.1);
    });

    // Create an infinite background illusion with 2 images moving
    var background1 = Crafty.e("ParralaxBackground");
    var background2 = Crafty.e("ParralaxBackground").y = -SCREEN_H; // 2 backgrounds for the effect: the other one starts above the first

    // Create the player space ship
    //var player = spawnPlayer(SCREEN_W/2, SCREEN_H/2, 0, "PlayerHomingPewPew", "#FF9900");
    //spawnInterwebz(300, 300, 42, "#00FF00", "PlayerFastPewPew", 1000, 50);
    //spawnInterwebz(200, 400, 1337, "#FF0000", "PlayerParrallelFastPewPew", 2000, 100);
    //spawnInterwebz(400, 200, 69, "#0000FF", "PlayerFastPewPewSplit3", 5000, 200);
    //spawnInterwebz(100, 400, 101, "#FFFFFF", "PlayerFastPewPewSplit5", 3000, 300);
    //spawnInterwebz(600, 200, 5, "#AAAAAA", "PlayerFireBigPewPew", 3000, 300);

    // TODO: use more sophisticated spawner with different enemies + handle difficulty + random enemies
    //var spawner = Crafty.e("Spawner").setSpawnFunction(spawnNextEnemy);

    // Update the player according to the movement
    Crafty.addEvent(this, Crafty.stage.elem, "mousemove", function(e) {
        if (me) {
            var MOVE_LERP_SPEED = 0.9;

            var position = $("#cr-stage").position();

            var targetX = Crafty.math.clamp(e.x - position.left - me.w/2, 0, SCREEN_W - me.w);
            var targetY = Crafty.math.clamp(e.y - position.top - me.h/2, 0, SCREEN_H - me.h);
            me.x = Crafty.math.lerp(me.x, targetX, MOVE_LERP_SPEED);
            me.y = Crafty.math.lerp(me.y, targetY, MOVE_LERP_SPEED);
            nc.position(me.x, me.y);
        }
    });

    // Check to fire for the player.
    Crafty.addEvent(this, Crafty.stage.elem, "mousedown", function(e) {
        if (me) {
            me.shooting = true;
            nc.shooting(true);
        }
    });

    Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function(e) {
        if (me) {
            me.shooting = false;
            nc.shooting(false);
        }
    });

    Crafty.addEvent(this, Crafty.stage.elem, "mouseout", function(e) {
        if (me) {
            me.shooting = false;
            nc.shooting(false);
        }
    });

    Crafty.bind("EnterFrame", function() {
        dT += dTSpeed;
    });

    // We bring the enemies
    //spawner.startSpawning();

    //spawnPowerup('ShieldPowerup', 100, 100);
    //spawnPowerup('ShieldPowerup', SCREEN_W-300, 100);
    //spawnPowerup('HealPowerup', 300, 100);
    //spawnPowerup('HealPowerup', SCREEN_W-100, 100);
}

function spawnPlayer(x, y, playerID, currentGun, color) {
    var player = Crafty.e("Spaceship").setPlayerID(playerID);
    player.x = x - player.w/2;
    player.y = y - player.h/2;
    player.bind("Dead", function() { player.explode(Crafty.e("Implosion")); });
    player.setPlayerColor(color);
    player.setGun(currentGun);
    players[playerID] = player;
    return player;
}

function forcePlayerPosition(playerID, xPos, yPos, tweenTime) {
    players[playerID].tween({x:xPos, y:yPos}, tweenTime);
}

// Spawns the specified enemy, at the specified starting x and y position with the specified path type to follow.
function spawnEnemy(enemyType, startX, startY, id, pathType, gunType, speedModificator, cashValue, dTStart) {
    var enemy = Crafty.e(enemyType);
    enemy.attr({x:startX, y:startY})
        .collision()
        .onHit("Spaceship", onPlayerHitEnemy)
        .setDeltaTStart(dTStart);
    enemy.followPath(getPath(pathType, startX, startY), speedModificator);
    enemy.cash = cashValue;
    enemy.bind("Dead", function() {
        enemy.explode(Crafty.e("Explosion"));
    });
    enemy.setGun(gunType);
    enemy.id = id;
    enemies[id] = enemy;

    return enemy;
}


//TEMP UNTIL SERVER SPAWNS ENEMIES
/*
function spawnNextEnemy() {
    var r = Crafty.math.randomInt(0,100);
    if (r <= 10) spawnEnemy('Patrol', Crafty.math.randomInt(50, SCREEN_W-50), -50, "PatrolHorizontalStartLeft", "LameShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 20) spawnEnemy('Patrol', Crafty.math.randomInt(50, SCREEN_W-50), -50, "PatrolHorizontalStartRight", "LameConeEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 40) spawnEnemy('Grunt', Crafty.math.randomInt(50, SCREEN_W/2), -50, "TopLeftBottomRight", "LameShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 1);
    else if (r <= 60) spawnEnemy('Grunt', Crafty.math.randomInt(SCREEN_W/2, SCREEN_W-50), -50, "TopRightBottomLeft", "LameEnemyPewPew", Crafty.math.randomNumber(0.7, 1.3), 1);
    else if (r <= 65) spawnEnemy('EasiestBoss', Crafty.math.randomInt(50, SCREEN_W-50), -50, "ZigZagStartLeft", "LameLargeShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 70) spawnEnemy('EasiestBossAiming', Crafty.math.randomInt(50, SCREEN_W-50), -50, "CircleStartRight", "LameLargeShotgunEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 75) spawnEnemy('EasyBoss', Crafty.math.randomInt(50, SCREEN_W-50), -50, "CircleStartLeft", "CircularEnemyPewPew", Crafty.math.randomNumber(0.8, 1.2), 2);
    else if (r <= 80) spawnPowerup('ShieldPowerup', Crafty.math.randomInt(50, SCREEN_W-50), Crafty.math.randomInt(50, SCREEN_H-50));
    else if (r <= 85) spawnPowerup('HealPowerup', Crafty.math.randomInt(50, SCREEN_W-50), Crafty.math.randomInt(50, SCREEN_H-50));
    
}
*/

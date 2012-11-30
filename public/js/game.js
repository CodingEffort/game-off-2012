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
var lastdT = 0;
var dTSpeed = 1;

var players = {};
var enemies = {};
var powerups = {};
var ui = null;
var me = null;

// Initialize the game screen
Crafty.init(SCREEN_W, SCREEN_H);
Crafty.background("#FFF");//"#000000");
Crafty.canvas.init();
Crafty.settings.modify("autoPause", true);

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
    bosshealthbarfill: [1, 12],
    mergemsg: [9, 13, 6, 1]
    });

// Called when an enemy is hit by a pewpewlazors
function onLazorHitEnemy(e) {
    e[0].obj.hurt(this.damage); // hurt the enemy
    if (this.owner === undefined || (!this.owner.gun.isUnique &&
        this.destroyedOnContact))
        this.destroy(); // remove the pew pew lazor
}

function onPlayerHitEnemy(e) {
    // hurt the player by our current health value
    hurtPlayer(e[0].obj, Math.ceil(this.health/100));
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
    }
}

function startGame() {
    ui = Crafty.e('UI');

    nc.bind('connected', function(player) {
        me = spawnPlayer(player.pos.x, player.pos.y, player.id,
            player.health, player.maxhealth, player.gun, player.color);
        me.bind('CashChanged', function() {
            ui.setCashAmount(me.cash);
        });
    });
    nc.connect();

    nc.bind("branch", function(player, path) {
        if (me) {
            for (var e in enemies) {
                enemies[e].destroy();
                delete enemies[e];
            }
            for (var p in players) {
                if (players[p].id !== me.id) {
                    players[p].destroy();
                    delete players[p];
                }
            }
            var projectiles = Crafty("Projectile");
            for (var i = 0; i < projectiles.length; ++i) {
                Crafty(projectiles[i]).destroy();
            }
            dT = player.dt;
            lastdT = dT;
            me.setHealth(player.health);
        }
        var el = $("#path");
        $(el).empty();
        for (var j = 0; j < path.length; ++j) {
          var b = $(document.createElement('li'));
          $(b).html(path[j].name + ((j < path.length - 1) ? ' <span class="divider">&gt;</span>' : ''));
          if (j == path.length - 1) {
            $(b).addClass('active');
          }
          $(el).append(b);
        }
    });

    nc.bind('shooting', function(id, shooting) {
      players[id].shooting = shooting;
    });

    nc.bind('position', function(id, pos) {
      forcePlayerPosition(id, pos.x, pos.y, 5);
    });

    nc.bind('spawn', function(type, spawn) {
      if (type == 'player') {
        if (me.id !== spawn.id)
            spawnPlayer(spawn.pos.x, spawn.pos.y, spawn.id, spawn.health, spawn.maxhealth,
             spawn.gun, spawn.color, spawn.shooting);
      }
      else if (type == 'enemy') {
        spawnEnemy(spawn.type, spawn.pos.x, spawn.pos.y, spawn.id, spawn.health,
            spawn.path, spawn.gun, spawn.speedmod, spawn.dtStart, spawn.difficultymod);
      }
      else if (type == 'powerup') {
        // TODO: spawn the powerup
      }
    });

    nc.bind('despawn', function(type, id) {
      if (type == 'player') {
        //TEMP UNTIL SERVER SHOOTS MESSAGES
        //ui.showClientMessage("Player '" + id + "' branched 'master' to work on Issue#1: File corruption.");
        if (id !== me.id && players[id]) {
            players[id].destroy();
            delete players[id];
        }
      } else if (type == 'enemy' && enemies[id]) {
        enemies[id].destroy();
        delete enemies[id];
      } else if (type == 'powerup') {
        // TODO: destroy the powerup
      }
    });

    nc.bind('dt', function(newDT) {
        dT = Crafty.math.lerp(dT, newDT, 0.1); // move a bit towards the current dT

        // If we're too far or too fast, just "teleport" (we teleport if too fast because we don't want enemies to go reversed)
        var diff = Math.abs(dT - newDT);
        if (diff > 30 || dT > newDT)
        {
            dT = newDT;
        }

        // Find a suitable speed to reach the new dT
        var updatesSinceLast = newDT - lastdT;
        var desired = newDT - dT;
        if (updatesSinceLast === 0) updatesSinceLast = 1; // avoid division by zero, just in case
        dTSpeed = desired / updatesSinceLast;

        lastdT = newDT;
    });

    nc.bind('cash', function(amount) {
      if (me) {
        me.setCash(amount);
        $('#shoptab li').each(function(i, e) {
          var price = Number($(e).attr('data-price'));
          if (price) {
            var tag = $(e).find('.label')[0];
            if (price <= amount) {
              if (tag) {
                if (!$(tag).hasClass('label-success')) $(tag).addClass('label-success');
                $(e).removeClass('disabled');
              }
            } else {
              if (tag) {
                $(tag).removeClass('label-success');
                if (!$(e).hasClass('disabled')) $(e).addClass('disabled');
              }
            }
          }
        });
      }
    });

    nc.bind('msg', function(msg, merge) {
      console.log(msg);
      ui.showClientMessage(msg);
      if (merge) {
        ui.mergeTime();
      }
    });

    // Create an infinite background illusion with 2 images moving
    var background1 = Crafty.e("ParralaxBackground");
    var background2 = Crafty.e("ParralaxBackground").y = -SCREEN_H; // 2 backgrounds for the effect: the other one starts above the first

    // Update the player according to the movement
    $("#cr-stage").mousemove(function(e) {
        if (me) {
            var MOVE_LERP_SPEED = 0.9;

            var position = $(this).position();

            var targetX = Crafty.math.clamp(e.pageX - position.left - me.w/2, 0, SCREEN_W - me.w);
            var targetY = Crafty.math.clamp(e.pageY - position.top - me.h/2, 0, SCREEN_H - me.h);
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
        // this is for the fun of it.
    });
}

function spawnPlayer(x, y, playerID, hp, maxhp, currentGun, color, shooting) {
    var player = Crafty.e("Spaceship").setPlayerID(playerID);
    player.x = x - player.w/2;
    player.y = y - player.h/2;
    player.setMaxHealth(maxhp);
    player.setHealth(hp);
    player.bind("Dead", function() {
        player.explode(Crafty.e("Implosion"));
    });
    player.bind("WillDie", function() {
        this.trigger("KillMe");
    });
    player.bind("KillMe", function() {
        nc.despawn('player', player.id, true);
    });
    player.bind("SyncLife", function() {
        nc.health('player', player.id, player.health);
    });
    player.setPlayerColor(color);
    player.setGun(currentGun);
    player.id = playerID;
    players[playerID] = player;
    player.shooting = shooting || false;
    return player;
}

function forcePlayerPosition(playerID, xPos, yPos, tweenTime) {
    players[playerID].tween({x:xPos, y:yPos}, tweenTime);
}

// Spawns the specified enemy, at the specified starting x and y position with the specified path type to follow.
function spawnEnemy(enemyType, startX, startY, id, health, pathType, gunType, speedModificator, dTStart, difficultymod) {
    var enemy = Crafty.e(enemyType);
    if (health > 0) { // If we're creating an existing enemy
        enemy.setMaxHealth(enemy.maxHealth * difficultymod);
        enemy.setHealth(health);
    }
    else { // if we're creating a new one: use the difficulty mod
        enemy.setMaxHealth(enemy.maxHealth * difficultymod);
        enemy.setHealth(enemy.maxHealth);
    }
    enemy.attr({x:startX, y:startY})
        .collision()
        .onHit("Spaceship", onPlayerHitEnemy)
        .setDeltaTStart(dTStart);
    enemy.followPath(getPath(pathType, startX, startY), speedModificator);
    enemy.bind("Dead", function() {
        enemy.explode(Crafty.e("Explosion"));
        enemy.alpha = 0.5;
        this.trigger("KillMe");
    });
    enemy.bind("SyncLife", function() {
        nc.health('enemy', enemy.id, enemy.health);
    });
    enemy.bind('WillDie', function() {
      this.trigger('KillMe');
    });
    enemy.bind("KillMe", function() {
        nc.despawn('enemy', enemy.id, true);
    });
    enemy.bind('OutOfScreen', function() {
        nc.despawn('enemy', enemy.id, false);
    });
    enemy.setGun(gunType);
    enemy.id = id;
    enemies[id] = enemy;

    enemy.gun.damage *= difficultymod;

    return enemy;
}


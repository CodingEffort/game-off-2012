/**
 * game.js
 * Jesse Emond and William Turner
 * 12/11/2012

 The main file of the game. All the components are mixed together here.
 */

// Game constants not-so-constant
var SCREEN_W = 800;
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

Crafty.c("FadeOut", {
    init: function() {
        this.requires("2D");
        this.bind("EnterFrame", this._updateFade);
    },
    _updateFade: function() {
        this.alpha = Math.max(this.alpha - this._fadeSpeed, 0.0);
        if (this.alpha < 0.05) {
            this.destroy();
        }
    },
    fadeOut: function(speed) {
        this._fadeSpeed = speed;
        return this;
    }
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

Crafty.c("Projectile", {
    init: function() {
        this.requires("2D, Canvas, Collision");

        this.bind("EnterFrame", function() {
            this.x += this.moveX * this.speed;
            this.y += this.moveY * this.speed;

            //TODO: check for others too
            if (this.y + this.h * 2 < 0)
                this.destroy();
        });
    },
    setDamage: function(dmg) {
        this.damage = dmg;
        return this;
    },
    setAngle: function(angle) {
        this.rotation = angle;
        this.moveX = Math.cos(toRadians(angle-90));
        this.moveY = Math.sin(toRadians(angle-90));
        return this;
    },
    setSpeed: function(speed) {
        this.speed = speed;
        return this;
    }
});

function toRadians(deg) {
    return deg * Math.PI / 180.0;
}

// Represents a player pewpew
Crafty.c("Pewpew", {
    init: function() {
        this.requires("Projectile");
    }
});

// Class that triggers a "OutOfScreen" event when it goes too far off of screen.
Crafty.c("NotifyWhenOutOfScreen", {
    init: function() {
        this.bind("EnterFrame", function() {
        });
    }
});

// Makes a component that follows a path specified by a mathematical function that returns the y based on a x.
Crafty.c("FollowPath", {
    _path: function(x) { return x; },
    _deltaT: 0,
    init: function() {
        this.deltaT = 0;
        this.showRotation = true;

        this.bind("EnterFrame", function() {
            var newPos = this.path(this.deltaT);
            var rect = this.mbr();
            this.x = newPos.x + rect._w / 2;
            this.y = newPos.y + rect._h / 2;

            this.deltaT++;

            // find the orientation that we should have based on our next position
            if (this.showRotation)
            {
                var nextPos = this.path(this.deltaT);
                this.rotation = Crafty.math.radToDeg(Math.atan2(nextPos.y - newPos.y, nextPos.x - newPos.x));
            }


            // Is going out of screen? Destroy it.
            if (this.x + this.w * 2 < 0 ||
                this.y + this.h * 2 < 0 ||
                this.x - this.w * 2 > SCREEN_W ||
                this.y - this.h * 2 > SCREEN_H)
            {
                this.destroy();
            }
        });
    },
    followPath: function(func) { this.path = func; return this; },
    allowRotation: function(allow) { this.showRotation = allow; }
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

Crafty.c("HealthBar" , {
    init: function() {
        //TODO: bold text and bigger
        //TODO: fix flashing bug (because of background)
        this.bar = Crafty.e("2D, Canvas, Text").textColor("#FFFFFF").attr({z:10000});

        this.bind("EnterFrame", function() {
            this.bar.text(this.health);
            var rect = this.mbr();
            this.bar.x = rect._x + rect._w/2 - this.bar.w/2;
            this.bar.y = rect._y + rect._h + 20;
            var percent = this.health / this.maxHealth;
            if (percent >= 0.7)
                this.bar.textColor("#00FF00");
            else if (percent >= 0.3)
                this.bar.textColor("#FFFF00");
            else
                this.bar.textColor("#FF0000");
        });

        this.bind("Remove", function() {
            this.bar.destroy();
        });
    }
});


Crafty.c("Living", {
    init: function() {
        this.requires("2D, Canvas, Sprite, Tint");
        this.health = 0;
        this.maxHealth = 0;
        this.flashing = true;
        this.flashIntensity = 0.0;

        this.bind("EnterFrame", function() {
            if (this.flashing) {
                this.alpha = 1.5;
            }
            else {
                this.flashIntensity -= 0.2;
            }
            this.flashIntensity = Crafty.math.clamp(this.flashIntensity, 0.0, 1.0);
            this.tint("#FFFFFF", this.flashIntensity);
        });
    },
    setMaxHealth: function(amount) {
        this.maxHealth = amount;
        this.health = amount;
        return this;
    },
    hurt: function(amount) {
        this.flashing = true;

        this.health -= amount;
        this.health = Crafty.math.clamp(this.health, 0, this.maxHealth);
        if (this.health === 0)
            this.onDeath();
    },
    onDeath: function() {
        var rect = this.mbr();
        var explosion = Crafty.e("Explosion").attr({z:9000});
        explosion.x = rect._x + rect._w/2 - explosion.w/2;
        explosion.y = rect._y + rect._h/2 - explosion.h/2;
        this.destroy();
    }
});


// Main spaceship object
Crafty.c("Spaceship", {
    _shooting: false,

    init: function() {
        this.requires("2D, Canvas, ship, Living, HealthBar")
            .setMaxHealth(100)
            .crop(0,0,35,35);
        this.x = SCREEN_W/2 - this.w/2;
        this.y = SCREEN_H/2 - this.h/2;
        this.canShoot = true;

        this.bind("EnterFrame", function() {
            if (this.shooting) {
                this.shoot();
            }
        });
    },
    reload: function() {
        this.canShoot = false;

        this.timeout(function() {
            this.canShoot = true;
        }, 150);
    },
    shoot: function() {
        if (this.canShoot) {
            var pew = Crafty.e("Pewpew, pewpewlazors")
                .setDamage(10)
                .setAngle(0)
                .setSpeed(15)
                .crop(22,15,4,35)
                .collision()
                .onHit("Enemy", onLazorHitEnemy);
            // Spawn it above the player's center, to shoot them pewpews
            pew.x = this.x + this.w/2 - pew.w/2;
            pew.y = this.y - this.h/2 - 0.3*pew.h;
            this.reload();
        }
    }
});

// Enemy component
Crafty.c("Enemy", {
    init: function() {
        this.requires("2D, Canvas, Collision, Living, FollowPath");
    },
    setShootDelay: function(delay) {
        this.shootDelay = delay;
        this.timeout(this.shoot, this.shootDelay);
        return this;
    },
    shoot: function() {
        // shoot the ammo
        //console.log("HELLO");
        //Crafty.e(this.projectTileName);
        //this.timout(this.shoot, this.shootDelay);
    },
    setProjectileType: function(projectileName) {
        this.projectileName = projectileName;
        return this;
    }
});

Crafty.c("Fireball", {
    init: function() {
        this.requires("Projectile, fireball")
            .setDamage(5)
            .setSpeed(12)
            .collision()
            .onHit("Spaceship", onProjectileHitPlayer)
            .crop(14,11,20,29);
    }
});

function onProjectileHitPlayer(e) {
    console.log("lol");
}

Crafty.c("Spawner", {
    init: function() { },
    setSpawnFunction: function(func) {
        this.spawnFunction = func;
        return this;
    },
    startSpawning: function() {
        this.spawnFunction();
        this.timeout(this.startSpawning, 1000); //TODO: random intervals
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
    });

    Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function(e) {
        player.shooting = false;
    });

    Crafty.addEvent(this, Crafty.stage.elem, "mouseout", function(e) {
        player.shooting = false;
    });

    // We bring the enemies
    spawner.startSpawning();
}

Crafty.c("Grunt", {
    init: function() {
        this.requires("Enemy, grunt")
            .crop(0,0,27,29)
            .setMaxHealth(15);
    }
});

Crafty.c("Patrol", {
    init: function() {
        this.requires("Enemy, patrol")
            .crop(0,0,27,25)
            .setMaxHealth(25)
            .allowRotation(false);
    }
});

// Spawns the specified enemy.
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